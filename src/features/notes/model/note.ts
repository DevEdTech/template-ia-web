export interface Note {
  id: string;
  title: string;
  createdAt: number;
}

export function validateTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error('Title cannot be empty');
  }
  return trimmed;
}

export function createNote(title: string): Note {
  const validTitle = validateTitle(title);
  return {
    id: crypto.randomUUID(),
    title: validTitle,
    createdAt: Date.now(),
  };
}
