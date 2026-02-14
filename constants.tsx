
import React from 'react';
import { 
  Layers, MessageSquare, Zap, Activity, Network, Smartphone, Cpu, Database, Server, 
  Bell, Search, Lock, MapPin, BarChart3, Key, Share2, FileText, Ticket, MousePointer2, 
  Camera, CreditCard, HardDrive, RefreshCcw, ShieldCheck, TrendingUp, Edit3, Globe, 
  ShoppingBag, Video, Wallet, Cloud, Settings, Terminal
} from 'lucide-react';

export const SYSTEM_TOPICS = [
  // L1 - Junior/Senior Fundamentals
  { id: 'url-shortener', title: 'URL Shortener', icon: <Zap size={18} />, level: 'L1', category: 'Fundamentals' },
  { id: 'notification', title: 'Notification System', icon: <Bell size={18} />, level: 'L1', category: 'Fundamentals' },
  { id: 'proximity-service', title: 'Nearby Friends/Yelp', icon: <MapPin size={18} />, level: 'L1', category: 'Fundamentals' },
  { id: 'autocomplete', title: 'Search Autocomplete', icon: <MousePointer2 size={18} />, level: 'L1', category: 'Fundamentals' },
  { id: 'rate-limiter', title: 'API Rate Limiter', icon: <ShieldCheck size={18} />, level: 'L1', category: 'Fundamentals' },
  { id: 'id-generator', title: 'Unique ID Generator', icon: <Settings size={18} />, level: 'L1', category: 'Fundamentals' },
  
  // L2 - Senior/Staff Intermediate
  { id: 'messenger', title: 'WhatsApp/Messenger', icon: <MessageSquare size={18} />, level: 'L2', category: 'Intermediate' },
  { id: 'e-commerce', title: 'Shopping Cart & Inventory', icon: <ShoppingBag size={18} />, level: 'L2', category: 'Intermediate' },
  { id: 'dropbox', title: 'Cloud Storage/S3', icon: <HardDrive size={18} />, level: 'L2', category: 'Intermediate' },
  { id: 'instagram', title: 'Instagram Feed/Storage', icon: <Camera size={18} />, level: 'L2', category: 'Intermediate' },
  { id: 'api-gateway', title: 'Enterprise API Gateway', icon: <Key size={18} />, level: 'L2', category: 'Intermediate' },
  { id: 'log-aggregator', title: 'Log Management System', icon: <FileText size={18} />, level: 'L2', category: 'Intermediate' },
  { id: 'web-crawler', title: 'Scalable Web Crawler', icon: <Globe size={18} />, level: 'L2', category: 'Intermediate' },
  { id: 'distributed-queue', title: 'Message Broker (Kafka)', icon: <Layers size={18} />, level: 'L2', category: 'Intermediate' },
  
  // L3 - Staff/Principal Advanced
  { id: 'netflix', title: 'Netflix Video Streaming', icon: <Video size={18} />, level: 'L3', category: 'Advanced' },
  { id: 'uber', title: 'Uber/Grab Dispatcher', icon: <Network size={18} />, level: 'L3', category: 'Advanced' },
  { id: 'ticket-booking', title: 'TicketMaster/Booking', icon: <Ticket size={18} />, level: 'L3', category: 'Advanced' },
  { id: 'ad-bidding', title: 'Real-time Ad Bidding', icon: <BarChart3 size={18} />, level: 'L3', category: 'Advanced' },
  { id: 'payment-system', title: 'Stripe/Fintech Gateway', icon: <Wallet size={18} />, level: 'L3', category: 'Advanced' },
  { id: 'news-feed', title: 'Twitter/FB News Feed', icon: <Share2 size={18} />, level: 'L3', category: 'Advanced' },
  { id: 'distributed-lock', title: 'Distributed Mutex Service', icon: <Lock size={18} />, level: 'L3', category: 'Advanced' },
  { id: 'matching-engine', title: 'Stock Trading Engine', icon: <TrendingUp size={18} />, level: 'L3', category: 'Advanced' },
  { id: 'kv-store', title: 'Dynamo/Cassandra Store', icon: <Database size={18} />, level: 'L3', category: 'Advanced' },
  { id: 'collaborative-editor', title: 'Google Docs Real-time', icon: <Edit3 size={18} />, level: 'L3', category: 'Advanced' }
];

export const COMPONENT_ICONS: Record<string, React.ReactNode> = {
  client: <Smartphone size={24} />,
  loadbalancer: <Network size={24} />,
  service: <Cpu size={24} />,
  database: <Database size={24} />,
  cache: <Zap size={24} />,
  queue: <Layers size={24} />
};
