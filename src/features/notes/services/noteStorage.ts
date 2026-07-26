import type { Note } from '../model/note';

const STORAGE_KEY = 'notes:list';

export function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as Note[];
  } catch (err) {
    console.warn('Failed to load notes from storage:', err);
    return [];
  }
}

export function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.warn('Failed to save notes to storage:', err);
  }
}

export function addNoteToStorage(note: Note): void {
  const current = loadNotes();
  const next = [note, ...current];
  saveNotes(next);
}

export function removeNoteFromStorage(id: string): boolean {
  const current = loadNotes();
  const next = current.filter((n) => n.id !== id);

  if (current.length !== next.length) {
    saveNotes(next);
    return true;
  }

  return false;
}
