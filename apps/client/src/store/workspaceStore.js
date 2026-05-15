import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '../services/api.js';
import { getSocket } from '../services/socket.js';

export const useWorkspaceStore = create((set, get) => ({
  teams: [],
  activeTeam: null,
  tasks: [],
  taskFilter: 'all',
  notifications: [],
  analytics: null,
  onlineUsers: [],
  setTaskFilter(taskFilter) {
    set({ taskFilter });
  },
  async loadTeams() {
    const { data } = await api.get('/teams');
    set({ teams: data, activeTeam: get().activeTeam || data[0] || null });
    if (data[0]) await get().selectTeam(get().activeTeam?.id || data[0].id);
  },
  async selectTeam(teamId) {
    const activeTeam = get().teams.find((team) => team.id === teamId) || get().activeTeam;
    set({ activeTeam });
    getSocket()?.emit('team_join', teamId);
    await Promise.all([get().loadTasks(teamId), get().loadAnalytics(teamId)]);
  },
  async loadTasks(teamId = get().activeTeam?.id) {
    if (!teamId) return;
    const { data } = await api.get(`/tasks/team/${teamId}`);
    set({ tasks: data });
  },
  async createTask(payload) {
    const { data } = await api.post('/tasks', payload);
    get().upsertTask(data);
    set({ teams: get().teams.map((team) => team.id === data.teamId ? { ...team, tasks: [data, ...(team.tasks || []).filter((task) => task.id !== data.id)] } : team) });
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
  async cancelTask(taskId) {
    const { data } = await api.patch(`/tasks/${taskId}/cancel`);
    get().upsertTask(data);
  },
  upsertTask(task) {
    set({ tasks: [task, ...get().tasks.filter((item) => item.id !== task.id)] });
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
    const socket = getSocket();
    if (!socket) return;
    socket.off('task_created').on('task_created', get().upsertTask);
    socket.off('task_updated').on('task_updated', get().upsertTask);
    socket.off('task_started').on('task_started', get().upsertTask);
    socket.off('task_completed').on('task_completed', get().upsertTask);
    socket.off('notification_created').on('notification_created', (notification) => set({ notifications: [notification, ...get().notifications] }));
    socket.off('user_online').on('user_online', ({ userId }) => set({ onlineUsers: Array.from(new Set([...get().onlineUsers, userId])) }));
    socket.off('user_offline').on('user_offline', ({ userId }) => set({ onlineUsers: get().onlineUsers.filter((id) => id !== userId) }));
    socket.off('comment_created').on('comment_created', ({ taskId, comment }) => set({ tasks: get().tasks.map((task) => task.id === taskId ? { ...task, comments: [...(task.comments || []), comment] } : task) }));
  },
}));
