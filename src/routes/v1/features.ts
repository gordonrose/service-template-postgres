import { Router } from 'express';

import {
  templateFeatureIntegration,
  type FeatureIntegration,
  type FeatureRegistry,
} from '../../features/_template/integration.js';

const registerFeatureIntegrations = (
  registry: FeatureRegistry,
  integrations: readonly FeatureIntegration[],
): void => {
  for (const integration of integrations) {
    integration.register(registry);
  }
};

export const createFeaturesV1Router = (): Router => {
  const router = Router();

  const registry: FeatureRegistry = {
    use(path, childRouter) {
      router.use(path, childRouter);
    },
  };

  const integrations: readonly FeatureIntegration[] = [
    templateFeatureIntegration,
  ];

  registerFeatureIntegrations(registry, integrations);

  return router;
};
