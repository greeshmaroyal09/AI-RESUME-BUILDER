import { create } from 'zustand';
import { apiRequest } from '../api';

export interface ATSAnalysis {
  match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  strengths: string[];
  gaps: string[];
  weaknesses: string[];
  missing_experience: string[];
  missing_certifications: string[];
  recommendations: string[];
  improvement_roadmap: string[];
}

export interface TailoredResume {
  personal_info: any;
  summary: string;
  education: any[];
  skills: string[];
  technologies: string[];
  projects: any[];
  internships: any[];
  certifications: any[];
  leadership: any[];
  achievements: any[];
  positions_of_responsibility: any[];
}

export interface GeneratedResume {
  id: number;
  user_id: number;
  jd_id?: number;
  company_name: string;
  role: string;
  created_at: string;
  ats_score: number;
  resume_json: TailoredResume;
  ats_analysis_json: ATSAnalysis;
  jd?: any;
}

interface ResumeState {
  history: GeneratedResume[];
  currentResume: GeneratedResume | null;
  currentAnalysis: ATSAnalysis | null;
  isLoading: boolean;
  error: string | null;

  fetchHistory: () => Promise<void>;
  analyzeJD: (jdId: number) => Promise<ATSAnalysis>;
  generateResume: (jdId: number) => Promise<GeneratedResume>;
  fetchResumeDetails: (id: number) => Promise<GeneratedResume>;
  deleteResumeHistory: (id: number) => Promise<void>;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  history: [],
  currentResume: null,
  currentAnalysis: null,
  isLoading: false,
  error: null,

  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest('/resume/history');
      set({ history: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch resume history', isLoading: false });
    }
  },

  analyzeJD: async (jdId) => {
    set({ isLoading: true, error: null, currentAnalysis: null });
    try {
      const data = await apiRequest('/resume/analyze', {
        method: 'POST',
        body: JSON.stringify({ jd_id: jdId })
      });
      set({ currentAnalysis: data, isLoading: false });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'ATS analysis failed', isLoading: false });
      throw err;
    }
  },

  generateResume: async (jdId) => {
    set({ isLoading: true, error: null, currentResume: null });
    try {
      const data = await apiRequest('/resume/generate', {
        method: 'POST',
        body: JSON.stringify({ jd_id: jdId })
      });
      set({ 
        currentResume: data, 
        currentAnalysis: data.ats_analysis_json,
        isLoading: false 
      });
      await get().fetchHistory(); // reload history
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Resume tailoring failed', isLoading: false });
      throw err;
    }
  },

  fetchResumeDetails: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest(`/resume/history/${id}`);
      set({ 
        currentResume: data, 
        currentAnalysis: data.ats_analysis_json,
        isLoading: false 
      });
      return data;
    } catch (err: any) {
      set({ error: err.message || 'Failed to load resume details', isLoading: false });
      throw err;
    }
  },

  deleteResumeHistory: async (id) => {
    // Optimistic update
    set((state) => ({ history: state.history.filter((r) => r.id !== id) }));
    try {
      await apiRequest(`/resume/history/${id}`, { method: 'DELETE' });
    } catch (err: any) {
      // Revert on failure
      const { fetchHistory } = get();
      await fetchHistory();
      throw err;
    }
  }
}));
