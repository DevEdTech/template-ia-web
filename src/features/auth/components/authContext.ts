// O contexto mora em arquivo proprio.
//
// Nao e organizacao por gosto: o Fast Refresh do Vite so reaproveita o estado
// quando um modulo exporta apenas componentes. Contexto junto do provider
// derruba o estado da tela a cada salvamento durante o desenvolvimento.
import { createContext } from 'react';
import type { AuthState, Session } from '../model/session';

/** Operacoes que a interface pode acionar. */
export interface AuthContextValue {
  readonly state: AuthState;
  /** Leva o usuario ao provedor. `returnTo` e o endereco interno de volta. */
  readonly login: (returnTo?: string) => Promise<void>;
  readonly logout: () => void;
  /** Sessao valida agora, renovando se estiver perto do fim. */
  readonly ensureSession: () => Promise<Session | null>;
  /** Assume uma sessao recem-concluida (usado pela pagina de retorno). */
  readonly adoptSession: (session: Session) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
