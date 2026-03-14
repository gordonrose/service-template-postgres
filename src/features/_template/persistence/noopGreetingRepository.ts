import type { TemplateGreetingRepository } from '../domain/ports.js';

export const createTemplateNoopGreetingRepository =
  (): TemplateGreetingRepository => {
    return {
      async recordGreeting(): Promise<void> {
        return;
      },
    };
  };
