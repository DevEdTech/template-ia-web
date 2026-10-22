import { useState } from 'react';
import { Button } from '@vitru/styleguide';
import { Copy } from 'lucide-react';
import styles from './HomePage.module.css';

/** O texto continua disponível para cópia manual se o navegador negar acesso. */
export function CopyBlock({ label, text }: { label: string; text: string }) {
  const [feedback, setFeedback] = useState('');

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback('Copiado. Cole no terminal ou no agente, conforme a instrução.');
    } catch {
      setFeedback('Não foi possível copiar. Selecione o texto abaixo e copie manualmente.');
    }
  }

  return (
    <div className={styles.copyBlock}>
      <div className={styles.copyHeader}>
        <span>{label}</span>
        <Button variant="secondary" onClick={() => void copy()} aria-label={`Copiar ${label}`}>
          <Copy className="icon icon-sm" aria-hidden="true" />
          Copiar
        </Button>
      </div>
      <pre aria-label={label}>
        <code>{text}</code>
      </pre>
      <p className={styles.feedback} role="status">
        {feedback}
      </p>
    </div>
  );
}
