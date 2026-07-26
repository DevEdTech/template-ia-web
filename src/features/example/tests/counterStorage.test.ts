import { beforeEach, describe, expect, it } from 'vitest';
import { loadCount, saveCount } from '../services/counterStorage';

describe('counterStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadCount', () => {
    it('retorna null quando não há valor salvo', () => {
      expect(loadCount()).toBeNull();
    });

    it('retorna o número salvo quando existe', () => {
      localStorage.setItem('example:counter', '42');
      expect(loadCount()).toBe(42);
    });

    it('retorna null quando o valor salvo é inválido', () => {
      localStorage.setItem('example:counter', 'abc');
      expect(loadCount()).toBeNull();
    });
  });

  describe('saveCount', () => {
    it('persiste o valor no localStorage', () => {
      saveCount(7);
      expect(localStorage.getItem('example:counter')).toBe('7');
    });

    it('sobrescreve o valor anterior', () => {
      saveCount(5);
      saveCount(10);
      expect(localStorage.getItem('example:counter')).toBe('10');
    });
  });
});
