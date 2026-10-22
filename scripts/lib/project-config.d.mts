// Declarações para o módulo de perfil, consumido por `vitest.config.ts`.
//
// O módulo é `.mjs` de propósito: os scripts do template rodam sem build, com
// Node puro. Este arquivo é a ponte para o TypeScript do projeto.

export interface CoverageThresholds {
  statements: number;
  lines: number;
  branches: number;
  functions: number;
}

export interface ProjectConfig {
  profile: 'prototipo' | 'padrao' | 'rigoroso';
  capabilities: Record<string, boolean>;
  coverage: CoverageThresholds | null;
  technicalName: string;
  displayName: string;
  templateVersion: string;
}

export declare const PROJECT_ROOT: string;
export declare const PROFILES: readonly string[];
export declare const DEFAULT_PROFILE: string;
export declare const DEFAULT_CAPABILITIES: Record<string, boolean>;
export declare const COVERAGE_THRESHOLDS: Record<string, CoverageThresholds | null>;
export declare function readProjectConfig(root?: string): ProjectConfig;
export declare function hasCapability(name: string, root?: string): boolean;
