
export enum SimulationMode {
  SUNNY = 'SUNNY',
  RAINY = 'RAINY'
}

export interface ComponentNode {
  id: string;
  name: string;
  type: 'client' | 'loadbalancer' | 'service' | 'database' | 'cache' | 'queue';
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

export interface RoleInsight {
  role: 'Senior' | 'Staff' | 'Principal';
  focus: string;
  advice: string;
}

export interface HLDTopic {
  id: string;
  title: string;
  shortDescription: string;
  fullExplanation: string;
  roleInsights: RoleInsight[];
  useCases: UseCase[];
  llds: LLD[];
  mermaidHLD: string;
  mermaidSequence: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
