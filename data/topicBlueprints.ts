import { HLDTopic } from '../types';

type TopicBlueprint = {
  title: string;
  shortDescription: string;
  domain: string;
  coreFlow: string;
  failureFlow: string;
};

const BLUEPRINTS: Record<string, TopicBlueprint> = {
  'url-shortener': {
    title: 'Scalable URL Shortener',
    shortDescription: 'Low-latency short-link generation and global redirection at internet scale.',
    domain: 'id generation, hot key caching, and redirect analytics',
    coreFlow: 'Client creates alias -> API validates -> DB persists mapping -> cache warms -> queue emits analytics event',
    failureFlow: 'Cache outage and DB read pressure are mitigated by queue-based retry and graceful degraded redirects'
  },
  messenger: {
    title: 'Real-time Messaging',
    shortDescription: 'Multi-region chat system with ordering guarantees and fan-out delivery.',
    domain: 'presence state, delivery acknowledgements, and durable stream replay',
    coreFlow: 'Client sends message -> API persists message -> queue fans out -> recipients fetch via cache-backed timeline',
    failureFlow: 'Queue lag and connection churn are handled with idempotency keys and recovery sync APIs'
  },
  'e-commerce': {
    title: 'Checkout Microservices',
    shortDescription: 'Resilient checkout flow with inventory, payment, and order orchestration.',
    domain: 'saga orchestration, exactly-once payment commands, and stock reservations',
    coreFlow: 'Client confirms cart -> API validates -> queue starts checkout saga -> DB commits order -> async fulfillment events',
    failureFlow: 'Payment timeout triggers compensating actions and queue retry with dead-letter routing'
  }
};

const defaultBlueprint: TopicBlueprint = {
  title: 'Distributed System Design',
  shortDescription: 'Production-ready architecture with observability, resiliency, and scalability.',
  domain: 'multi-tier service decomposition and fault tolerance',
  coreFlow: 'Client request -> load balancer -> API service -> cache/database read path -> async queue tasks',
  failureFlow: 'Partial dependency failures are isolated with backoff, fallback, and circuit-breaking'
};

const buildExplanation = (topic: TopicBlueprint) => `Step 1: Requirement Modelling\nStart with non-functional goals: p95 latency, availability, throughput, and compliance boundaries. ${topic.title} requires explicit budgets for read/write paths, asynchronous work, and cross-region propagation.\n\nStep 2: Service Boundaries\nDefine clean boundaries across API, persistence, cache, and asynchronous workers. In this system, the highest leverage comes from isolating ${topic.domain} so one subdomain can scale independently without forcing full platform redeploys.\n\nStep 3: Data Strategy\nChoose canonical write models in SQL and place denormalized read models in cache for fast reads. Introduce schema versioning and backward-compatible events so evolution stays safe during rolling deployments.\n\nStep 4: Core Sunny-Day Flow\n${topic.coreFlow}. Every hop includes trace propagation and idempotency metadata to keep replay safe.\n\nStep 5: Rainy-Day Recovery\n${topic.failureFlow}. Explicitly classify retryable vs non-retryable failures, and route poison messages to DLQ with operator dashboards.\n\nStep 6: Security & Governance\nEnforce Zero Trust controls: mTLS service-to-service auth, request-level authorization, secret rotation, and audit trails. Validate payload contracts at ingress and internal boundaries.\n\nStep 7: Operability\nUse golden signals (latency, traffic, errors, saturation), domain SLOs, and runbooks tied to alert policies. Pair automated canary analysis with feature flags to reduce deployment risk.`;

const buildMermaidHld = (title: string) => `flowchart LR
    C[Client] --> LB[Load Balancer]
    LB --> API[API Service]
    API --> CACHE[(Redis Cache)]
    API --> DB[(Primary DB)]
    API --> Q[(Event Queue)]
    Q --> W[Worker Service]
    W --> DB
    subgraph Observability
      OT[Tracing]
      MT[Metrics]
      LG[Logs]
    end
    API --> OT
    API --> MT
    API --> LG
    classDef data fill:#e2e8f0,stroke:#475569,color:#0f172a;
    class DB,CACHE,Q data;
    %% ${title}`;

const buildMermaidSequence = (title: string) => `sequenceDiagram
    autonumber
    participant U as User
    participant LB as Load Balancer
    participant API as API Service
    participant C as Cache
    participant D as Database
    participant Q as Queue

    U->>LB: HTTPS request
    LB->>API: Forward with trace-id
    API->>C: Read hot data
    alt Cache hit
      C-->>API: Cached value
    else Cache miss
      API->>D: Query canonical data
      D-->>API: Result
      API->>C: Write-through cache
    end
    API->>Q: Emit domain event
    API-->>U: 200 OK
    %% ${title}`;

const buildUseCases = () => ([
  {
    id: 'primary-request-flow',
    title: 'Primary request processing',
    description: 'Normal path serving a request with cache-assisted read and async side effects.',
    sunnySteps: [
      { from: 'client', to: 'lb', label: 'Client request arrives', status: 'success' as const },
      { from: 'lb', to: 'api', label: 'Load balancer routes request', status: 'success' as const },
      { from: 'api', to: 'cache', label: 'API reads cache', status: 'success' as const },
      { from: 'api', to: 'db', label: 'Cache miss fallback to database', status: 'success' as const },
      { from: 'api', to: 'queue', label: 'Emit event for async processing', status: 'success' as const },
      { from: 'api', to: 'client', label: 'Response returned to user', status: 'success' as const }
    ],
    rainySteps: [
      { from: 'client', to: 'lb', label: 'Client request arrives', status: 'success' as const },
      { from: 'lb', to: 'api', label: 'Load balancer routes request', status: 'success' as const },
      { from: 'api', to: 'cache', label: 'Cache timeout detected', status: 'failure' as const },
      { from: 'api', to: 'db', label: 'Fallback to DB under circuit policy', status: 'success' as const },
      { from: 'api', to: 'queue', label: 'Queue push retries after transient error', status: 'failure' as const },
      { from: 'api', to: 'client', label: 'Graceful degraded response', status: 'success' as const }
    ]
  },
  {
    id: 'write-consistency-flow',
    title: 'Write path with idempotency',
    description: 'State-changing command with durable persistence and event publication.',
    sunnySteps: [
      { from: 'client', to: 'lb', label: 'User submits command', status: 'success' as const },
      { from: 'lb', to: 'api', label: 'Route to stateless API pod', status: 'success' as const },
      { from: 'api', to: 'db', label: 'Store command with idempotency key', status: 'success' as const },
      { from: 'api', to: 'queue', label: 'Publish committed event', status: 'success' as const },
      { from: 'api', to: 'client', label: 'Acknowledge accepted write', status: 'success' as const }
    ],
    rainySteps: [
      { from: 'client', to: 'lb', label: 'User submits command', status: 'success' as const },
      { from: 'lb', to: 'api', label: 'Route to API pod', status: 'success' as const },
      { from: 'api', to: 'db', label: 'DB timeout during transaction', status: 'failure' as const },
      { from: 'api', to: 'queue', label: 'Queue deferred retry task', status: 'success' as const },
      { from: 'api', to: 'client', label: 'Return retryable error contract', status: 'failure' as const }
    ]
  },
  {
    id: 'async-worker-flow',
    title: 'Asynchronous workflow completion',
    description: 'Background task execution with visibility and retry handling.',
    sunnySteps: [
      { from: 'client', to: 'lb', label: 'User initiates async request', status: 'success' as const },
      { from: 'lb', to: 'api', label: 'API accepts and validates payload', status: 'success' as const },
      { from: 'api', to: 'queue', label: 'Task queued for worker', status: 'success' as const },
      { from: 'queue', to: 'api', label: 'Worker callback updates status', status: 'success' as const },
      { from: 'api', to: 'db', label: 'Persist final task state', status: 'success' as const },
      { from: 'api', to: 'client', label: 'Client polls and receives completion', status: 'success' as const }
    ],
    rainySteps: [
      { from: 'client', to: 'lb', label: 'User initiates async request', status: 'success' as const },
      { from: 'lb', to: 'api', label: 'Payload accepted', status: 'success' as const },
      { from: 'api', to: 'queue', label: 'Queue partition saturated', status: 'failure' as const },
      { from: 'api', to: 'db', label: 'Persist pending state for reconciliation', status: 'success' as const },
      { from: 'api', to: 'client', label: 'Return accepted with delayed status', status: 'success' as const }
    ]
  }
]);

const buildLlds = (title: string) => ([
  {
    language: 'TypeScript (NestJS)',
    explanation: 'Controller-service-repository layering with DTO validation and resilient integrations.',
    code: `// ${title}\n@Controller('resources')\nexport class ResourceController {\n  constructor(private readonly service: ResourceService) {}\n\n  @Post()\n  async create(@Body() dto: CreateResourceDto) {\n    return this.service.create(dto);\n  }\n}\n\n@Injectable()\nexport class ResourceService {\n  constructor(private readonly repo: ResourceRepository, private readonly queue: QueueClient) {}\n\n  async create(dto: CreateResourceDto) {\n    const entity = await this.repo.insert(dto);\n    await this.queue.publish('resource.created', { id: entity.id });\n    return entity;\n  }\n}`
  },
  {
    language: 'Python (FastAPI)',
    explanation: 'Dependency-injected service composition with pydantic models and async persistence.',
    code: `# ${title}\nfrom fastapi import FastAPI, Depends\nfrom pydantic import BaseModel\n\nclass CreateResourceDto(BaseModel):\n    name: str\n\napp = FastAPI()\n\n@app.post('/resources')\nasync def create_resource(dto: CreateResourceDto, service = Depends(get_service)):\n    return await service.create(dto)\n\nclass ResourceService:\n    async def create(self, dto: CreateResourceDto):\n        entity = await self.repo.insert(dto.model_dump())\n        await self.queue.publish('resource.created', {'id': entity['id']})\n        return entity`
  },
  {
    language: 'Java (Spring Boot)',
    explanation: 'Transaction-safe command handling with repository and event publisher boundaries.',
    code: `// ${title}\n@RestController\n@RequestMapping("/resources")\npublic class ResourceController {\n  private final ResourceService service;\n\n  public ResourceController(ResourceService service) {\n    this.service = service;\n  }\n\n  @PostMapping\n  public ResourceDto create(@RequestBody CreateResourceDto dto) {\n    return service.create(dto);\n  }\n}\n\n@Service\npublic class ResourceService {\n  @Transactional\n  public ResourceDto create(CreateResourceDto dto) {\n    Resource entity = repository.save(mapper.toEntity(dto));\n    publisher.publishEvent(new ResourceCreated(entity.getId()));\n    return mapper.toDto(entity);\n  }\n}`
  }
]);

export const generateLocalTopic = (topicId: string): HLDTopic => {
  const blueprint = BLUEPRINTS[topicId] || defaultBlueprint;

  return {
    id: topicId,
    title: blueprint.title,
    shortDescription: blueprint.shortDescription,
    fullExplanation: buildExplanation(blueprint),
    roleInsights: [
      {
        role: 'Senior',
        focus: 'Code-level reliability, contracts, and integration tests.',
        advice: 'Treat API and queue boundaries as first-class interfaces. Add contract tests and fallback paths before scaling.'
      },
      {
        role: 'Staff',
        focus: 'Cross-service latency management and platform-wide observability.',
        advice: 'Push idempotency and tracing standards into platform libraries so each product team gets reliability by default.'
      },
      {
        role: 'Principal',
        focus: 'Business-aligned architecture roadmap and operational governance.',
        advice: 'Link SLO tiers to customer journeys and cost envelopes, then sequence architecture investments around those constraints.'
      }
    ],
    useCases: buildUseCases(),
    llds: buildLlds(blueprint.title),
    mermaidHLD: buildMermaidHld(blueprint.title),
    mermaidSequence: buildMermaidSequence(blueprint.title)
  };
};
