import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import styles from './Dialog.module.css';

export interface DialogProps {
  open: boolean;
  title: string;
  /** Chamado pelo botao de fechar, pela tecla Esc e pelo clique no fundo. */
  onClose: () => void;
  /** Acoes do rodape, normalmente `Button`s. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Janela modal sobre o elemento nativo `<dialog>`: foco preso, Esc e fundo
 * escurecido vem do navegador, sem dependencia extra.
 *
 * Fecha pela tecla Esc ou pelo botao "Fechar". Nao fecha por clique no fundo:
 * um handler de clique em elemento nao interativo quebra as regras de
 * acessibilidade que o lint aplica, e a acao ja tem dois caminhos claros.
 */
export function Dialog({ open, title, onClose, footer, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      // `showModal` nao existe em todos os ambientes de teste; o atributo
      // `open` mantem o conteudo verificavel quando ele falta.
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      return;
    }

    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.header}>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
          <X className="icon" aria-hidden="true" />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </dialog>
  );
}
