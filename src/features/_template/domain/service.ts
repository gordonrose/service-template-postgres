import type { TemplateServiceDependencies } from './ports.js';
import type { TemplateCommand, TemplateResult } from './types.js';

const buildTemplateResult = (
  command: TemplateCommand,
): TemplateResult => {
  if (command.id === undefined || command.createdAt === undefined) {
    return {
      message: `Template says hello to ${command.name}.`,
    };
  }

  return {
    message: `Template says hello to ${command.name}.`,
    id: command.id,
    createdAt: command.createdAt,
  };
};

export function executeTemplateCommand(
  command: TemplateCommand,
): TemplateResult;

export function executeTemplateCommand(
  command: TemplateCommand,
  dependencies: TemplateServiceDependencies,
): Promise<TemplateResult>;

export function executeTemplateCommand(
  command: TemplateCommand,
  dependencies?: TemplateServiceDependencies,
): TemplateResult | Promise<TemplateResult> {
  const result = buildTemplateResult(command);

  if (dependencies === undefined) {
    return result;
  }

  if (dependencies.templateEntityRepository !== undefined) {
    if (command.id === undefined || command.createdAt === undefined) {
      return Promise.reject(
        new Error('Persisted template command requires id and createdAt.'),
      );
    }

    return dependencies.templateEntityRepository
      .create({
        id: command.id,
        requestContext: dependencies.requestContext,
        name: command.name,
        createdAt: command.createdAt,
      })
      .then(() => result);
  }

  if (dependencies.greetingRepository !== undefined) {
    return dependencies.greetingRepository
      .recordGreeting({
        requestContext: dependencies.requestContext,
        name: command.name,
      })
      .then(() => result);
  }

  return Promise.resolve(result);
}
