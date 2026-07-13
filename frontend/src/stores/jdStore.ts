import { create } from 'zustand';
import { apiRequest } from '../api';

export interface JobDescription {
  id: number;
  company_name: string;
  role: string;
  jd_text: string;
  created_at: string;
}

interface JDState {
  jds: JobDescription[];
  isLoading: boolean;
  error: string | null;
  fetchJDs: () => Promise<void>;
  createJD: (jd: Omit<JobDescription, 'id' | 'created_at'>) => Promise<void>;
  updateJD: (id: number, jd: Omit<JobDescription, 'id' | 'created_at'>) => Promise<void>;
  deleteJD: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useJDStore = create<JDState>((set) => ({
  jds: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchJDs: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest('/jd');
      set({ jds: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch JDs', isLoading: false });
    }
  },

  createJD: async (jd) => {
    set({ isLoading: true, error: null });
    try {
      const newJd = await apiRequest('/jd', {
        method: 'POST',
        body: JSON.stringify(jd)
      });
      set((state) => ({ jds: [...state.jds, newJd], isLoading: false }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to create JD', isLoading: false });
      throw err;
    }
  },

  updateJD: async (id, jd) => {
    set({ isLoading: true, error: null });
    try {
      const updatedJd = await apiRequest(`/jd/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jd)
      });
      set((state) => ({
        jds: state.jds.map((j) => (j.id === id ? updatedJd : j)),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update JD', isLoading: false });
      throw err;
    }
  },

  deleteJD: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiRequest(`/jd/${id}`, {
        method: 'DELETE'
      });
      set((state) => ({
        jds: state.jds.filter((j) => j.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete JD', isLoading: false });
      throw err;
    }
  }
}));
