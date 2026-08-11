import type { ReactNode } from 'react';
import styles from './Table.module.css';

export interface TableColumn<Row> {
  /** Identificador da coluna; usado como chave de render. */
  key: string;
  header: string;
  /** Conteudo da celula para uma linha. */
  cell: (row: Row) => ReactNode;
  align?: 'start' | 'end';
}

export interface TableProps<Row> {
  /** Descreve a tabela para quem usa leitor de tela. Obrigatorio. */
  caption: string;
  columns: readonly TableColumn<Row>[];
  rows: readonly Row[];
  rowKey: (row: Row) => string;
  /** Mostrado no lugar do corpo quando nao ha linhas. */
  empty?: ReactNode;
}

/**
 * Tabela de dados com cabecalho, legenda e estado vazio padronizados.
 * A legenda e obrigatoria porque uma tabela sem descricao e inacessivel.
 */
export function Table<Row>({ caption, columns, rows, rowKey, empty }: TableProps<Row>) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={column.align === 'end' ? styles.end : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.empty} colSpan={columns.length}>
                {empty ?? 'Nenhum registro para mostrar.'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key} className={column.align === 'end' ? styles.end : undefined}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
