import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const siteUrl = 'https://nexflow.bhauu.online';
const defaultTitle = 'NexFlow | Realtime Task Management Software for Teams';
const defaultDescription = 'NexFlow is a realtime team task-management workspace for Kanban planning, team collaboration, notifications, analytics, and focused execution.';
const keywords = 'NexFlow, task management software, realtime task management, team collaboration, kanban board, project management, team chat, productivity app';

const routeMeta = {
  '/login': {
    title: defaultTitle,
    description: defaultDescription,
  },
  '/register': {
    title: 'NexFlow | Team Task Collaboration and Kanban Software',
    description: 'Create a NexFlow account to manage team tasks, realtime Kanban boards, project groups, chat, notifications, and productivity analytics.',
  },
  '/admin': {
    title: 'NexFlow Admin | Platform Analytics and User Monitoring',
    description: 'NexFlow admin panel helps monitor users, groups, members, roles, tasks, messages, and platform activity from one private dashboard.',
  },
};

function setMeta(selector, attribute, value) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    const match = selector.match(/meta\[(name|property)="([^"]+)"\]/);
    if (match) tag.setAttribute(match[1], match[2]);
    document.head.appendChild(tag);
  }
  tag.setAttribute(attribute, value);
}

function setLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

export function SeoMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
    const meta = routeMeta[normalizedPath] || { title: defaultTitle, description: defaultDescription };
    const canonical = `${siteUrl}${normalizedPath === '/' ? '/' : normalizedPath}`;
    const image = `${siteUrl}/brand/Fulllogo-trans.webp`;

    document.title = meta.title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[name="keywords"]', 'content', keywords);
    setMeta('meta[name="robots"]', 'content', 'index, follow');
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[name="twitter:title"]', 'content', meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
    setMeta('meta[name="twitter:image"]', 'content', image);
    setLink('canonical', canonical);
  }, [pathname]);

  return null;
}
