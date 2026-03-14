import type { Router } from 'express';

import { createTemplateRouter } from './transport/router.js';

export interface FeatureRegistry {
  use(path: string, router: Router): void;
}

export interface FeatureIntegration {
  readonly featureKey: string;
  readonly mountPath: string;
  register(registry: FeatureRegistry): void;
}

export const templateFeatureIntegration: FeatureIntegration = {
  featureKey: '_template',
  mountPath: '/_template',
  register(registry) {
    registry.use(this.mountPath, createTemplateRouter());
  },
};
