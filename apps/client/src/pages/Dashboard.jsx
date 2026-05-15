import { useEffect } from 'react';
import { TodoTaskList } from '../components/tasks/TodoTaskList.jsx';
import { useWorkspaceStore } from '../store/workspaceStore.js';

export default function Dashboard() {
  const { loadTeams, loadNotifications, wireRealtime } = useWorkspaceStore();
  useEffect(() => { loadTeams(); loadNotifications(); wireRealtime(); }, []);
  return <TodoTaskList />;
}
