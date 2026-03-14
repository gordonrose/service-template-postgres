export interface TemplateCreateRequest {
  readonly name: string;
}

export interface TemplateCreateResponse {
  readonly message: string;
  readonly id?: string;
  readonly createdAt?: string;
}

export type ValidationResult<T> =
  | {
      readonly ok: true;
      readonly value: T;
    }
  | {
      readonly ok: false;
      readonly issues: readonly string[];
    };
