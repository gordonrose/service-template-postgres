export interface TemplateCommand {
  readonly name: string;
  readonly id?: string;
  readonly createdAt?: string;
}

export interface TemplateResult {
  readonly message: string;
  readonly id?: string;
  readonly createdAt?: string;
}
