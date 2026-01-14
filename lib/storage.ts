
import { AnalysisResult } from '../types';

const STORAGE_KEY = 'cv_jd_history';

export const storage = {
  save: (result: AnalysisResult) => {
    const history = storage.getAll();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([result, ...history]));
  },
  getAll: (): AnalysisResult[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  getById: (id: string): AnalysisResult | undefined => {
    return storage.getAll().find(r => r.id === id);
  },
  delete: (id: string) => {
    const history = storage.getAll().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
};
