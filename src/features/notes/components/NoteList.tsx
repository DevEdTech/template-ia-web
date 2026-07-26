import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Button } from '@/shared/components';
import { createNote, validateTitle } from '../model/note';
import type { Note } from '../model/note';
import { loadNotes, addNoteToStorage, removeNoteFromStorage } from '../services/noteStorage';
import styles from './NoteList.module.css';

export function NoteList() {
  const [notes, setNotes] = useState<Note[]>(() => loadNotes());
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const note = createNote(title);
      addNoteToStorage(note);
      setNotes((prev) => [note, ...prev]);
      setTitle('');
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  function handleRemove(id: string) {
    const removed = removeNoteFromStorage(id);
    if (removed) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    if (error) {
      try {
        validateTitle(e.target.value);
        setError(null);
      } catch {
        // keep error if still invalid
      }
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={title}
            onChange={handleChange}
            placeholder="Nova nota..."
            className={styles.input}
            aria-invalid={!!error}
          />
          <Button type="submit">Adicionar</Button>
        </div>
        <div aria-live="polite">{error && <p className={styles.error}>{error}</p>}</div>
      </form>

      <div aria-live="polite">
        {notes.length === 0 ? (
          <p className={styles.emptyState}>Nenhuma nota ainda. Adicione a primeira!</p>
        ) : (
          <ul className={styles.list}>
            {notes.map((note) => (
              <li key={note.id} className={styles.noteItem}>
                <div className={styles.noteContent}>
                  <p className={styles.noteTitle}>{note.title}</p>
                  <p className={styles.noteDate}>{new Date(note.createdAt).toLocaleString()}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => handleRemove(note.id)}
                  aria-label={`Remover nota: ${note.title}`}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
