import { create } from 'zustand';
import { apiRequest } from '../api';

export interface PersonalInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  location?: string;
}

export interface Skill {
  id: number;
  name: string;
  level?: string;
}

export interface Technology {
  id: number;
  name: string;
  category?: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies?: string;
  role?: string;
  team_size?: string;
  outcome?: string;
  start_date?: string;
  end_date?: string;
  url?: string;
}

export interface Internship {
  id: number;
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date?: string;
  location?: string;
}

export interface Certification {
  id: number;
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  url?: string;
}

export interface Leadership {
  id: number;
  organization: string;
  role: string;
  description: string;
  start_date: string;
  end_date?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  date?: string;
}

export interface Position {
  id: number;
  organization: string;
  role: string;
  description: string;
  start_date: string;
  end_date?: string;
}

interface ProfileState {
  completionPercentage: number;
  sectionsStatus: Record<string, boolean>;
  personalInfo: PersonalInfo | null;
  educations: Education[];
  skills: Skill[];
  technologies: Technology[];
  projects: Project[];
  internships: Internship[];
  certifications: Certification[];
  leaderships: Leadership[];
  achievements: Achievement[];
  positions: Position[];
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  savePersonalInfo: (info: PersonalInfo) => Promise<void>;
  
  // Section add, edit, delete
  addSectionItem: (section: string, item: any) => Promise<void>;
  updateSectionItem: (section: string, itemId: number, item: any) => Promise<void>;
  deleteSectionItem: (section: string, itemId: number) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  completionPercentage: 0,
  sectionsStatus: {},
  personalInfo: null,
  educations: [],
  skills: [],
  technologies: [],
  projects: [],
  internships: [],
  certifications: [],
  leaderships: [],
  achievements: [],
  positions: [],
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest('/profile/summary');
      set({
        completionPercentage: data.completion_percentage,
        sectionsStatus: data.sections_status,
        personalInfo: data.personal_info,
        educations: data.educations,
        skills: data.skills,
        technologies: data.technologies,
        projects: data.projects,
        internships: data.internships,
        certifications: data.certifications,
        leaderships: data.leaderships,
        achievements: data.achievements,
        positions: data.positions,
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load profile', isLoading: false });
    }
  },

  savePersonalInfo: async (info) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiRequest('/profile/personal', {
        method: 'POST',
        body: JSON.stringify(info)
      });
      set({ personalInfo: data });
      await get().fetchProfile(); // reload completeness
    } catch (err: any) {
      set({ error: err.message || 'Failed to save personal info', isLoading: false });
      throw err;
    }
  },

  addSectionItem: async (section, item) => {
    set({ isLoading: true, error: null });
    try {
      // Map frontend section names to API endpoints if necessary
      const endpoint = section === 'leadership' ? 'leadership' : section;
      await apiRequest(`/profile/${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(item)
      });
      await get().fetchProfile();
    } catch (err: any) {
      set({ error: err.message || `Failed to add item to ${section}`, isLoading: false });
      throw err;
    }
  },

  updateSectionItem: async (section, itemId, item) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = section === 'leadership' ? 'leadership' : section;
      await apiRequest(`/profile/${endpoint}/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(item)
      });
      await get().fetchProfile();
    } catch (err: any) {
      set({ error: err.message || `Failed to update item in ${section}`, isLoading: false });
      throw err;
    }
  },

  deleteSectionItem: async (section, itemId) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = section === 'leadership' ? 'leadership' : section;
      await apiRequest(`/profile/${endpoint}/${itemId}`, {
        method: 'DELETE'
      });
      await get().fetchProfile();
    } catch (err: any) {
      set({ error: err.message || `Failed to delete item from ${section}`, isLoading: false });
      throw err;
    }
  }
}));
