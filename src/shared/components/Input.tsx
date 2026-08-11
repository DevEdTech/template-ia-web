import { useId, type InputHTMLAttributes } from 'react';
import { FieldShell, type FieldOwnProps } from './FieldShell';
import { describedBy } from './fieldIds';
import styles from './FieldShell.module.css';

export type InputProps = FieldOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'aria-describedby' | 'aria-invalid'>;

/**
 * Campo de texto com rotulo, dica e erro ja ligados por acessibilidade.
 * Prefira este componente a um `<input>` solto.
 */
export function Input({ label, hint, error, className, ...rest }: InputProps) {
  const id = useId();
  const classes = [styles.control, className].filter(Boolean).join(' ');

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      controlId={id}
      hintId={`${id}-hint`}
      errorId={`${id}-error`}
    >
      <input
        id={id}
        className={classes}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, `${id}-hint`, error, `${id}-error`)}
        {...rest}
      />
    </FieldShell>
  );
}
