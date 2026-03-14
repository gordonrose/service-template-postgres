import type { MigrationDefinition } from './types.js';

import { createTemplateEntitiesMigration } from '../../../features/_template/persistence/migrations/0001_create_template_entities.js';

export const migrationManifest: readonly MigrationDefinition[] = [
  createTemplateEntitiesMigration,
];

export default migrationManifest;
