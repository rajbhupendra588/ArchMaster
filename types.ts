
export enum SimulationMode {
  SUNNY = 'SUNNY',
  RAINY = 'RAINY'
}

export interface ComponentNode {
  id: string;
  name: string;
  type: 'client' | 'loadbalancer' | 'service' | 'database' | 'cache' | 'queue' | 'cdn' | 'storage';
  x: number;
  y: number;
}

export interface DataFlow {
  from: string;
  to: string;
  label: string;
  status: 'success' | 'failure' | 'pending';
}

export interface UseCase {
  id: string;
  title: string;
  description: string;
  sunnySteps: DataFlow[];
  rainySteps: DataFlow[];
}

export interface LLD {
  language: string;
  code: string;
  explanation: string;
}

export interface DesignPattern {
  name: string;
  why: string;
  benefit: string;
}

export interface HLDStep {
  stepTitle: string;
  description: string;
  realTimeExample: string;
  tradeOff: string;
}

export interface HLDTopic {
  id: string;
  title: string;
  shortDescription: string;
  fr: string[]; 
  nfr: string[];
  fullExplanation: HLDStep[];
  useCases: UseCase[];
  llds: LLD[];
  designPatterns: DesignPattern[]; // New field for architectural/design patterns
  mermaidHLD: string;
  mermaidSequence: string;
  nodes: ComponentNode[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
