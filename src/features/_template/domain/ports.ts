import type { RequestContext } from '../../../lib/requestContext.js';

export interface TemplateGreetingRecord {
  readonly requestContext: RequestContext;
  readonly name: string;
}

export interface TemplateGreetingRepository {
  recordGreeting(record: TemplateGreetingRecord): Promise<void>;
}

export interface TemplateEntityRecord {
  readonly id: string;
  readonly requestContext: RequestContext;
  readonly name: string;
  readonly createdAt: string;
}

export interface TemplateEntityRepository {
  create(record: TemplateEntityRecord): Promise<void>;
}

export interface TemplateServiceDependencies {
  readonly requestContext: RequestContext;
  readonly greetingRepository?: TemplateGreetingRepository;
  readonly templateEntityRepository?: TemplateEntityRepository;
}
