import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import { connectStoredSocket, getSocket } from '../services/socket.js';

let sectionSyncTimer = null;
let pendingSections = new Set();

function currentUserId() {
  return JSON.parse(localStorage.getItem('nexflow-auth') || '{}')?.state?.user?.id;
}

export const useWorkspaceStore = create((set, get) => ({
  teams: [],
  activeTeam: null,
  tasks: [],
  bundles: [],
  activeBundleId: 'all',
  taskFilter: 'all',
  chatMessages: [],
  notifications: [],
  analytics: null,
  onlineUsers: [],
  unreadChatByTeam: {},
  openChatTeamId: null,
  realtimeCleanup: null,
  realtimeStatus: 'offline',
  setTaskFilter(taskFilter) {
    set({ taskFilter });
  },
  setActiveBundleId(activeBundleId) {
    set({ activeBundleId });
  },
  markChatOpen(teamId) {
    set({
      openChatTeamId: teamId || null,
      unreadChatByTeam: teamId ? { ...get().unreadChatByTeam, [teamId]: 0 } : get().unreadChatByTeam,
    });
  },
  markChatClosed() {
    set({ openChatTeamId: null });
  },
  async loadTeams() {
    const { data } = await api.get('/teams');
    set({ teams: data, activeTeam: get().activeTeam || data[0] || null });
    if (data[0]) await get().selectTeam(get().activeTeam?.id || data[0].id);
  },
  async selectTeam(teamId) {
    const activeTeam = get().teams.find((team) => team.id === teamId) || get().activeTeam;
    set({ activeTeam, activeBundleId: 'all' });
    getSocket()?.emit('team_join', teamId);
    await Promise.all([get().loadTasks(teamId), get().loadBundles(teamId), get().loadChatMessages(teamId), get().loadAnalytics(teamId)]);
  },
  async loadBundles(teamId = get().activeTeam?.id) {
    if (!teamId) return;
    const { data } = await api.get(`/bundles/team/${teamId}`);
    set({ bundles: data });
  },
  async loadTasks(teamId = get().activeTeam?.id) {
    if (!teamId) return;
    const { data } = await api.get(`/tasks/team/${teamId}`);
    set({ tasks: data });
    set({ teams: get().teams.map((team) => team.id === teamId ? { ...team, tasks: data } : team) });
  },
  async loadChatMessages(teamId = get().activeTeam?.id) {
    if (!teamId) return;
    const { data } = await api.get(`/chat/team/${teamId}`);
    set({ chatMessages: data });
  },
  async syncTeamSections(teamId = get().activeTeam?.id, sections = ['tasks', 'bundles', 'chat', 'analytics', 'notifications']) {
    if (!teamId) return;
    const uniqueSections = Array.from(new Set(sections));
    const work = [];
    if (uniqueSections.includes('tasks')) work.push(get().loadTasks(teamId));
    if (uniqueSections.includes('bundles')) work.push(get().loadBundles(teamId));
    if (uniqueSections.includes('chat')) work.push(get().loadChatMessages(teamId));
    if (uniqueSections.includes('analytics')) work.push(get().loadAnalytics(teamId));
    if (uniqueSections.includes('notifications')) work.push(get().loadNotifications());
    await Promise.all(work);
  },
  queueTeamSectionSync(teamId = get().activeTeam?.id, sections = ['tasks', 'bundles', 'chat', 'analytics', 'notifications']) {
    if (!teamId || teamId !== get().activeTeam?.id) return;
    sections = sections?.length ? sections : ['tasks', 'bundles', 'chat', 'analytics', 'notifications'];
    sections.forEach((section) => pendingSections.add(section));
    window.clearTimeout(sectionSyncTimer);
    sectionSyncTimer = window.setTimeout(() => {
      const sectionsToSync = Array.from(pendingSections);
      pendingSections = new Set();
      get().syncTeamSections(teamId, sectionsToSync).catch(() => {});
    }, 250);
  },
  async sendChatMessage(content, teamId = get().activeTeam?.id) {
    if (!teamId || !content.trim()) return;
    const { data } = await api.post('/chat', { teamId, content });
    get().upsertChatMessage(data);
  },
  async deleteChatMessage(messageId) {
    const { data } = await api.delete(`/chat/${messageId}`);
    get().removeChatMessage(data);
  },
  async createTask(payload) {
    const { data } = await api.post('/tasks', payload);
    get().upsertTask(data);
  },
  async createBundle(payload) {
    const { data } = await api.post('/bundles', payload);
    set({ bundles: [...get().bundles.filter((bundle) => bundle.id !== data.id), data], activeBundleId: data.id });
  },
  async createTeam(payload) {
    const { data } = await api.post('/teams', payload);
    set({ teams: [data, ...get().teams], activeTeam: data });
    await get().selectTeam(data.id);
  },
  async joinTeam(inviteCode) {
    const { data } = await api.post('/teams/join', { inviteCode });
    set({ teams: [data, ...get().teams.filter((team) => team.id !== data.id)], activeTeam: data });
    await get().selectTeam(data.id);
  },
  async startTask(taskId) {
    try {
      const { data } = await api.patch(`/tasks/${taskId}/start`);
      get().upsertTask(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to start task');
    }
  },
  async completeTask(taskId) {
    const { data } = await api.patch(`/tasks/${taskId}/complete`);
    get().upsertTask(data);
  },
  async reopenTask(taskId) {
    const { data } = await api.patch(`/tasks/${taskId}/reopen`);
    get().upsertTask(data);
  },
  async cancelTask(taskId) {
    const { data } = await api.patch(`/tasks/${taskId}/cancel`);
    get().upsertTask(data);
  },
  async deleteTask(taskId) {
    const { data } = await api.delete(`/tasks/${taskId}`);
    get().removeTask(data);
  },
  async updateMemberRole(memberId, role, teamId = get().activeTeam?.id) {
    if (!teamId) return;
    const { data } = await api.patch(`/teams/${teamId}/members/${memberId}/role`, { role });
    get().upsertTeam(data);
  },
  async removeMember(memberId, teamId = get().activeTeam?.id) {
    if (!teamId) return;
    const { data } = await api.delete(`/teams/${teamId}/members/${memberId}`);
    get().upsertTeam(data);
  },
  async deleteTeam(teamId = get().activeTeam?.id) {
    if (!teamId) return;
    await api.delete(`/teams/${teamId}`);
    get().removeTeam(teamId);
  },
  async leaveTeam(teamId = get().activeTeam?.id) {
    if (!teamId) return;
    await api.post(`/teams/${teamId}/leave`);
    const remainingTeams = get().teams.filter((team) => team.id !== teamId);
    set({ teams: remainingTeams, activeTeam: remainingTeams[0] || null, tasks: [], bundles: [], chatMessages: [] });
    if (remainingTeams[0]) await get().selectTeam(remainingTeams[0].id);
  },
  upsertTeam(team) {
    if (!team?.id) return;
    set({
      teams: [team, ...get().teams.filter((item) => item.id !== team.id)],
      activeTeam: get().activeTeam?.id === team.id ? team : get().activeTeam,
    });
  },
  upsertTask(task) {
    if (!task?.id || !task?.title) return;
    const activeTeamId = get().activeTeam?.id;
    set({
      tasks: task.teamId === activeTeamId ? [task, ...get().tasks.filter((item) => item.id !== task.id)] : get().tasks,
      teams: get().teams.map((team) => team.id === task.teamId ? { ...team, tasks: [task, ...(team.tasks || []).filter((item) => item.id !== task.id)] } : team),
    });
  },
  removeTask(task) {
    if (!task?.id) return;
    set({
      tasks: get().tasks.filter((item) => item.id !== task.id),
      teams: get().teams.map((team) => team.id === task.teamId ? { ...team, tasks: (team.tasks || []).filter((item) => item.id !== task.id) } : team),
    });
  },
  removeTeam(teamId) {
    if (!teamId) return;
    const remainingTeams = get().teams.filter((team) => team.id !== teamId);
    const isActiveTeam = get().activeTeam?.id === teamId;
    set({
      teams: remainingTeams,
      activeTeam: isActiveTeam ? remainingTeams[0] || null : get().activeTeam,
      tasks: isActiveTeam ? [] : get().tasks,
      bundles: isActiveTeam ? [] : get().bundles,
      chatMessages: isActiveTeam ? [] : get().chatMessages,
      activeBundleId: isActiveTeam ? 'all' : get().activeBundleId,
    });
    if (isActiveTeam && remainingTeams[0]) get().selectTeam(remainingTeams[0].id);
  },
  upsertChatMessage(message) {
    if (!message?.id || message.teamId !== get().activeTeam?.id) return;
    const exists = get().chatMessages.some((item) => item.id === message.id);
    const messages = [...get().chatMessages.filter((item) => item.id !== message.id), message]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const shouldCountUnread = !exists && message.userId !== currentUserId() && get().openChatTeamId !== message.teamId;
    set({
      chatMessages: messages,
      unreadChatByTeam: shouldCountUnread ? { ...get().unreadChatByTeam, [message.teamId]: (get().unreadChatByTeam[message.teamId] || 0) + 1 } : get().unreadChatByTeam,
    });
  },
  removeChatMessage(message) {
    if (!message?.id) return;
    set({ chatMessages: get().chatMessages.filter((item) => item.id !== message.id) });
  },
  async addComment(taskId, content) {
    await api.post(`/tasks/${taskId}/comments`, { content });
  },
  async loadNotifications() {
    const { data } = await api.get('/notifications');
    set({ notifications: data });
  },
  async loadAnalytics(teamId = get().activeTeam?.id) {
    if (!teamId) return;
    const { data } = await api.get(`/analytics/team/${teamId}`);
    set({ analytics: data });
  },
  wireRealtime() {
    const socket = getSocket() || connectStoredSocket();
    if (!socket) return;
    get().realtimeCleanup?.();
    const syncActiveTeam = async () => {
      const teamId = get().activeTeam?.id;
      if (!teamId) return;
      socket.emit('team_join', teamId, (response) => {
        if (response?.userIds) set({ onlineUsers: response.userIds });
      });
      try {
        await get().syncTeamSections(teamId);
      } catch {
        // Realtime recovery should never break the visible app if one refresh request fails.
      }
    };
    const handleConnect = () => {
      set({ realtimeStatus: 'online' });
      syncActiveTeam();
    };
    const handleDisconnect = () => set({ realtimeStatus: 'offline' });
    const handleWorkspaceChange = ({ teamId, sections }) => {
      if (teamId !== get().activeTeam?.id) return;
      get().queueTeamSectionSync(teamId, sections);
    };
    socket.off('connect').on('connect', handleConnect);
    socket.off('disconnect').on('disconnect', handleDisconnect);
    socket.io.off('reconnect').on('reconnect', syncActiveTeam);
    socket.io.off('reconnect_error').on('reconnect_error', () => {});
    if (socket.connected) set({ realtimeStatus: 'online' });
    syncActiveTeam();
    socket.off('task_created').on('task_created', (task) => { get().upsertTask(task); get().queueTeamSectionSync(task.teamId, ['analytics']); });
    socket.off('task_updated').on('task_updated', (task) => { get().upsertTask(task); get().queueTeamSectionSync(task.teamId, ['analytics']); });
    socket.off('task_started').on('task_started', (task) => { get().upsertTask(task); get().queueTeamSectionSync(task.teamId, ['analytics']); });
    socket.off('task_completed').on('task_completed', (task) => { get().upsertTask(task); get().queueTeamSectionSync(task.teamId, ['analytics']); });
    socket.off('task_deleted').on('task_deleted', (task) => { get().removeTask(task); get().queueTeamSectionSync(task.teamId, ['analytics']); });
    socket.off('chat_message').on('chat_message', get().upsertChatMessage);
    socket.off('chat_message_deleted').on('chat_message_deleted', get().removeChatMessage);
    socket.off('workspace_changed').on('workspace_changed', handleWorkspaceChange);
    socket.off('team_updated').on('team_updated', get().upsertTeam);
    socket.off('team_removed').on('team_removed', ({ teamId }) => {
      get().removeTeam(teamId);
    });
    socket.off('team_deleted').on('team_deleted', ({ teamId }) => {
      get().removeTeam(teamId);
    });
    socket.off('bundle_created').on('bundle_created', (bundle) => {
      if (bundle.teamId !== get().activeTeam?.id) return;
      set({ bundles: [...get().bundles.filter((item) => item.id !== bundle.id), bundle] });
    });
    socket.off('notification_created').on('notification_created', (notification) => set({ notifications: [notification, ...get().notifications] }));
    socket.off('team_presence').on('team_presence', ({ teamId, userIds }) => {
      if (teamId === get().activeTeam?.id) set({ onlineUsers: userIds });
    });
    socket.off('user_online').on('user_online', ({ userId }) => set({ onlineUsers: Array.from(new Set([...get().onlineUsers, userId])) }));
    socket.off('user_offline').on('user_offline', ({ userId }) => set({ onlineUsers: get().onlineUsers.filter((id) => id !== userId) }));
    socket.off('comment_created').on('comment_created', ({ taskId, comment }) => set({ tasks: get().tasks.map((task) => task.id === taskId ? { ...task, comments: [...(task.comments || []), comment] } : task) }));
    const handleVisibilityChange = () => {
      if (!document.hidden) syncActiveTeam();
    };
    const recoveryInterval = window.setInterval(syncActiveTeam, 8000);
    window.addEventListener('focus', syncActiveTeam);
    window.addEventListener('online', syncActiveTeam);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    set({
      realtimeCleanup: () => {
        window.clearInterval(recoveryInterval);
        window.clearTimeout(sectionSyncTimer);
        window.removeEventListener('focus', syncActiveTeam);
        window.removeEventListener('online', syncActiveTeam);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.io.off('reconnect', syncActiveTeam);
        socket.off('workspace_changed', handleWorkspaceChange);
      },
    });
  },
}));
