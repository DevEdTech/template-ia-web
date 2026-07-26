import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadNotes,
  saveNotes,
  addNoteToStorage,
  removeNoteFromStorage,
} from '../services/noteStorage';

describe('noteStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadNotes', () => {
    it('returns empty array when nothing stored', () => {
      expect(loadNotes()).toEqual([]);
    });

    it('handles corrupt data gracefully', () => {
      localStorage.setItem('notes:list', '{ corrupt json');
      expect(loadNotes()).toEqual([]);

      localStorage.setItem('notes:list', '{"not": "an array"}');
      expect(loadNotes()).toEqual([]);
    });
  });

  describe('saveNotes', () => {
    it('saves notes to localStorage', () => {
      const notes = [{ id: '1', title: 'test', createdAt: 123 }];
      saveNotes(notes);
      expect(localStorage.getItem('notes:list')).toBe(JSON.stringify(notes));
    });
  });

  describe('addNoteToStorage', () => {
    it('adds a note', () => {
      const note = { id: '1', title: 'test', createdAt: 123 };
      addNoteToStorage(note);
      expect(loadNotes()).toEqual([note]);

      const note2 = { id: '2', title: 'test2', createdAt: 124 };
      addNoteToStorage(note2);
      expect(loadNotes()).toEqual([note2, note]);
    });
  });

  describe('removeNoteFromStorage', () => {
    it('removes by id and returns true', () => {
      const note1 = { id: '1', title: 'test1', createdAt: 123 };
      const note2 = { id: '2', title: 'test2', createdAt: 124 };
      saveNotes([note1, note2]);

      const result = removeNoteFromStorage('1');
      expect(result).toBe(true);
      expect(loadNotes()).toEqual([note2]);
    });

    it('returns false for unknown id', () => {
      const result = removeNoteFromStorage('999');
      expect(result).toBe(false);
    });
  });
});
