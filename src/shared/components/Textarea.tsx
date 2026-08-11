import { useId, type TextareaHTMLAttributes } from 'react';
import { FieldShell, type FieldOwnProps } from './FieldShell';
import { describedBy } from './fieldIds';
import styles from './FieldShell.module.css';

export type TextareaProps = FieldOwnProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'aria-describedby' | 'aria-invalid'>;

/** Campo de texto longo, com a mesma estrutura de rotulo, dica e erro do `Input`. */
export function Textarea({ label, hint, error, className, ...rest }: TextareaProps) {
  const id = useId();
  const classes = [styles.control, styles.textarea, className].filter(Boolean).join(' ');

  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      controlId={id}
      hintId={`${id}-hint`}
      errorId={`${id}-error`}
    >
      <textarea
        id={id}
        className={classes}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, `${id}-hint`, error, `${id}-error`)}
        {...rest}
      />
    </FieldShell>
  );
}
