
import React from 'react';
import { 
  Layers, 
  MessageSquare,
  Zap,
  Activity,
  Network
} from 'lucide-react';

export const SYSTEM_TOPICS = [
  { 
    id: 'url-shortener', 
    title: 'Scalable URL Shortener', 
    icon: <Zap size={20} />,
    complexity: 'L1 - Intermediate',
    roleTarget: 'Senior Engineer'
  },
  { 
    id: 'messenger', 
    title: 'Real-time Messaging', 
    icon: <MessageSquare size={20} />,
    complexity: 'L2 - Advanced',
    roleTarget: 'Staff Engineer'
  },
  { 
    id: 'e-commerce', 
    title: 'Checkout Microservices', 
    icon: <Layers size={20} />,
    complexity: 'L2 - Advanced',
    roleTarget: 'Staff Engineer'
  },
  { 
    id: 'netflix', 
    title: 'Video Content Delivery', 
    icon: <Activity size={20} />,
    complexity: 'L3 - Expert',
    roleTarget: 'Principal Architect'
  },
  { 
    id: 'uber', 
    title: 'Distributed Ride-Hailing', 
    icon: <Network size={20} />,
    complexity: 'L3 - Expert',
    roleTarget: 'Principal Architect'
  }
];

export const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  client: <Activity size={24} />,
  loadbalancer: <Layers size={24} />,
  service: <Activity size={24} />,
  database: <Layers size={24} />,
  cache: <Zap size={24} />,
  queue: <Activity size={24} />
};
