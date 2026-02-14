import React from 'react';
import {
  Layers,
  MessageSquare,
  Zap,
  Activity,
  Network,
  ShoppingCart,
  ShieldCheck,
  BrainCircuit,
  Wallet,
  Radio
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
    icon: <ShoppingCart size={20} />,
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
  },
  {
    id: 'payments',
    title: 'Global Payments Platform',
    icon: <Wallet size={20} />,
    complexity: 'L3 - Expert',
    roleTarget: 'Principal Architect'
  },
  {
    id: 'api-gateway',
    title: 'API Gateway & Zero Trust',
    icon: <ShieldCheck size={20} />,
    complexity: 'L2 - Advanced',
    roleTarget: 'Staff Engineer'
  },
  {
    id: 'event-streaming',
    title: 'Event Streaming Backbone',
    icon: <Radio size={20} />,
    complexity: 'L2 - Advanced',
    roleTarget: 'Staff Engineer'
  },
  {
    id: 'recommendation',
    title: 'Recommendation Engine',
    icon: <BrainCircuit size={20} />,
    complexity: 'L3 - Expert',
    roleTarget: 'Principal Architect'
  },
  {
    id: 'collaboration-suite',
    title: 'Collaborative Docs Platform',
    icon: <Layers size={20} />,
    complexity: 'L2 - Advanced',
    roleTarget: 'Senior Engineer'
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
