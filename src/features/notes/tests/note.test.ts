import { describe, it, expect } from 'vitest';
import { createNote, validateTitle } from '../model/note';

describe('Note Model', () => {
  describe('createNote', () => {
    it('creates a valid note', () => {
      const note = createNote('My Note');
      expect(note.id).toBeDefined();
      expect(typeof note.id).toBe('string');
      expect(note.title).toBe('My Note');
      expect(note.createdAt).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('validateTitle', () => {
    it('trims whitespace', () => {
      expect(validateTitle('  test  ')).toBe('test');
    });

    it('throws on empty string', () => {
      expect(() => validateTitle('')).toThrow('Title cannot be empty');
      expect(() => validateTitle('   ')).toThrow('Title cannot be empty');
    });
  });
});
