import { useEffect, useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Button } from '@/shared/components';
import { createNote, validateTitle } from '../model/note';
import type { Note } from '../model/note';
import {
  NoteStorageError,
  noteStorageKeys,
  loadNotesSnapshot,
  addNoteToStorage,
  removeNoteFromStorage,
} from '../services/noteStorage';
import styles from './NoteList.module.css';

export function NoteList() {
  const [initialState] = useState<{
    notes: Note[];
    revision: number;
    storageError: string | null;
  }>(() => {
    try {
      const snapshot = loadNotesSnapshot();
      return { ...snapshot, storageError: null };
    } catch (err) {
      return {
        notes: [],
        revision: 0,
        storageError: err instanceof Error ? err.message : 'Não foi possível carregar as notas.',
      };
    }
  });
  const [notes, setNotes] = useState<Note[]>(initialState.notes);
  const [revision, setRevision] = useState(initialState.revision);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(initialState.storageError);

  useEffect(() => {
    function synchronize(event: StorageEvent) {
      if (event.key !== noteStorageKeys.primary) return;
      try {
        const snapshot = loadNotesSnapshot();
        setNotes(snapshot.notes);
        setRevision(snapshot.revision);
        setStorageError(null);
      } catch (err) {
        if (err instanceof Error) setStorageError(err.message);
      }
    }
    window.addEventListener('storage', synchronize);
    return () => window.removeEventListener('storage', synchronize);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
      const note = createNote(title);
      const snapshot = addNoteToStorage(note, revision);
      setNotes(snapshot.notes);
      setRevision(snapshot.revision);
      setTitle('');
      setError(null);
      setStorageError(null);
    } catch (err) {
      if (err instanceof NoteStorageError) {
        setStorageError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      }
    }
  }

  function handleRemove(id: string) {
    try {
      const result = removeNoteFromStorage(id, revision);
      if (result.removed) {
        setNotes(result.snapshot.notes);
        setRevision(result.snapshot.revision);
        setStorageError(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setStorageError(err.message);
      }
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
      {storageError && (
        <p className={styles.storageError} role="alert">
          {storageError}
        </p>
      )}
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
