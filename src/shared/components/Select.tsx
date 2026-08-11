import { useId, type SelectHTMLAttributes } from 'react';
import { FieldShell, type FieldOwnProps } from './FieldShell';
import { describedBy } from './fieldIds';
import styles from './FieldShell.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectProps = FieldOwnProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'aria-describedby' | 'aria-invalid'> & {
    options: readonly SelectOption[];
    /** Texto da opcao vazia inicial; omita quando o campo ja tem valor. */
    placeholder?: string;
  };

/** Campo de escolha unica, com a mesma estrutura dos demais campos do kit. */
export function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  className,
  ...rest
}: SelectProps) {
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
      <select
        id={id}
        className={classes}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, `${id}-hint`, error, `${id}-error`)}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
