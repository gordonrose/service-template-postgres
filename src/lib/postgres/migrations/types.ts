export interface MigrationDefinition {
  readonly id: string;
  readonly up: readonly string[];
}

export interface MigrationRunSummary {
  readonly appliedMigrationIds: readonly string[];
  readonly skippedMigrationIds: readonly string[];
}
