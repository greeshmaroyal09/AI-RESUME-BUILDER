import { useState, useEffect, useRef } from 'react';
import { useProfileStore, type PersonalInfo } from '../stores/profileStore';
import { apiRequest } from '../api';
import { 
  Sparkles, Save, Trash2, Edit3, Send, CheckCircle2, User, BookOpen,
  Settings, Award, Briefcase, GraduationCap, Code2, X, ShieldAlert
} from 'lucide-react';

// Definitions of sections
const SECTIONS = [
  { id: 'personal_info', label: 'Personal Info', icon: User },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Award },
  { id: 'technologies', label: 'Technologies', icon: Code2 },
  { id: 'projects', label: 'Projects', icon: BookOpen },
  { id: 'internships', label: 'Internships', icon: Briefcase },
  { id: 'certifications', label: 'Certifications', icon: Settings },
  { id: 'leadership', label: 'Leadership', icon: Award },
  { id: 'achievements', label: 'Achievements', icon: Sparkles },
  { id: 'positions', label: 'Positions of Responsibility', icon: Sparkles },
];

export default function ProfileBuilder() {
  const {
    completionPercentage, sectionsStatus, fetchProfile, personalInfo, educations, skills,
    technologies, projects, internships, certifications, leaderships,
    achievements, positions, savePersonalInfo, addSectionItem, updateSectionItem, deleteSectionItem
  } = useProfileStore();

  const [activeTab, setActiveTab] = useState('personal_info');
  
  // AI Assist Drawer state
  const [showAiAssist, setShowAiAssist] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Form states
  const [personalForm, setPersonalForm] = useState<PersonalInfo>({
    first_name: '', last_name: '', email: '', phone: '', location: '', github: '', linkedin: '', website: '', summary: ''
  });
  
  // Dynamic section form states (used for both Create & Edit)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [genericForm, setGenericForm] = useState<Record<string, string>>({});

  // Profile Intelligence Review state
  const [reviewReport, setReviewReport] = useState<{
    completeness_score: number;
    missing_elements: string[];
    follow_up_questions: string[];
    is_sufficient: boolean;
  } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  
  // Confirmation modal state (Phase G)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Sync Personal Info form
  useEffect(() => {
    if (personalInfo) {
      setPersonalForm({
        first_name: personalInfo.first_name || '',
        last_name: personalInfo.last_name || '',
        email: personalInfo.email || '',
        phone: personalInfo.phone || '',
        location: personalInfo.location || '',
        github: personalInfo.github || '',
        linkedin: personalInfo.linkedin || '',
        website: personalInfo.website || '',
        summary: personalInfo.summary || '',
      });
    }
  }, [personalInfo]);

  // Reset generic forms on tab change
  useEffect(() => {
    resetForm();
    setShowAiAssist(false);
    setChatMessages([]);
  }, [activeTab]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showAiAssist]);

  const resetForm = () => {
    setEditingId(null);
    setGenericForm({});
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePersonalInfo(personalForm);
      showNotification('✅ Personal details saved successfully!');
    } catch (err: any) {
      showNotification(`❌ ${err.message || 'Error saving personal details'}`);
    }
  };

  const startEditItem = (item: any) => {
    setEditingId(item.id);
    const formValues: Record<string, string> = {};
    Object.keys(item).forEach(key => {
      if (key !== 'id' && key !== 'user_id') {
        formValues[key] = item[key] !== null ? String(item[key]) : '';
      }
    });
    setGenericForm(formValues);
  };

  const proceedSave = async (formData: any) => {
    try {
      if (editingId !== null) {
        await updateSectionItem(activeTab, editingId, formData);
      } else {
        await addSectionItem(activeTab, formData);
      }
      resetForm();
      setShowReviewModal(false);
      setReviewReport(null);
      showNotification('✅ Record saved successfully!');
    } catch (err: any) {
      showNotification(`❌ ${err.message || 'Error saving record'}`);
    }
  };

  const handleGenericSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReviewLoading(true);
    try {
      const report = await apiRequest(`/profile/review/${activeTab}`, {
        method: 'POST',
        body: JSON.stringify(genericForm)
      });
      setIsReviewLoading(false);
      
      if (report.is_sufficient || report.missing_elements.length === 0) {
        await proceedSave(genericForm);
      } else {
        setReviewReport(report);
        const initialAnswers: Record<string, string> = {};
        report.missing_elements.forEach((elem: string) => {
          initialAnswers[elem] = '';
        });
        setFollowUpAnswers(initialAnswers);
        setShowReviewModal(true);
      }
    } catch (err: any) {
      setIsReviewLoading(false);
      // Fallback: save anyway on error
      await proceedSave(genericForm);
    }
  };

  const handleVerifyAndSave = () => {
    const updatedForm = { ...genericForm };
    
    // Map missing element names back to genericForm fields
    const mapping: Record<string, string> = {
      // Projects
      "Project Title": "title",
      "Detailed Description": "description",
      "Technologies Used": "technologies",
      "Your Role": "role",
      "Team Size": "team_size",
      "Project Outcome / Impact": "outcome",
      // Education
      "Institution Name": "institution",
      "Degree Title": "degree",
      "Field of Study": "field_of_study",
      "GPA or score": "gpa",
      "Institution Location": "location",
      "Timeline Dates": "start_date",
      // Skills
      "Skill Name": "name",
      "Proficiency Level": "level",
      // Technologies
      "Technology Name": "name",
      "Category": "category",
      // Internships
      "Company Name": "company",
      "Role Title": "role",
      "Responsibilities / Accomplishments": "description",
      "Location": "location",
      // Certifications
      "Certification Name": "name",
      "Issuing Organization": "issuer",
      "Issue Date": "issue_date",
      "Verification URL": "url",
      // Leadership
      "Organization Name": "organization",
      "Achievements / Contributions": "description",
      // Achievements
      "Achievement Title": "title",
      "Context / Description": "description",
      "Date Received": "date",
      // Positions
      "Duties Description": "description"
    };

    Object.entries(followUpAnswers).forEach(([elem, answer]) => {
      const field = mapping[elem];
      if (field && answer.trim()) {
        if (field === 'description' && updatedForm[field]) {
          updatedForm[field] = `${updatedForm[field].trim()} ${answer.trim()}`;
        } else {
          updatedForm[field] = answer.trim();
        }
      }
    });

    proceedSave(updatedForm);
  };

  const handleDeleteItem = async (itemId: number) => {
    setConfirmDeleteId(itemId);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId === null) return;
    try {
      await deleteSectionItem(activeTab, confirmDeleteId);
      showNotification('🗑️ Entry deleted successfully.');
    } catch (err: any) {
      showNotification(`❌ ${err.message || 'Error deleting item'}`);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // ----------------- AI ASSISTANT FUNCTIONALITY -----------------
  
  const handleOpenAiAssist = () => {
    setShowAiAssist(true);
    setChatMessages([
      { role: 'assistant', content: `Hello! I am your AI Profile Assistant. I will help you describe and compile your details for the **${SECTIONS.find(s => s.id === activeTab)?.label}** section.\n\nLet's get started!` }
    ]);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiLoading) return;

    const userMsg = chatInput.trim();
    const updatedMessages = [...chatMessages, { role: 'user', content: userMsg }];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsAiLoading(true);

    try {
      // Send chat context to FastAPI AI Chat Endpoint
      const response = await apiRequest('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          section: activeTab,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          current_form_data: activeTab === 'personal_info' ? personalForm : genericForm
        })
      });

      setChatMessages(prev => [...prev, { role: 'assistant', content: response.response_text }]);

      if (response.is_complete && response.parsed_data) {
        // Auto fill form fields!
        if (activeTab === 'personal_info') {
          setPersonalForm(response.parsed_data);
        } else {
          const formValues: Record<string, string> = {};
          Object.keys(response.parsed_data).forEach(key => {
            formValues[key] = response.parsed_data[key] !== null ? String(response.parsed_data[key]) : '';
          });
          setGenericForm(formValues);
        }
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '🎉 I have successfully formatted your answers and auto-filled the form fields! Please review the form on the screen and hit "Save" to save it permanently.' 
        }]);
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an issue: ${err.message}. Please try again.` }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Render list of items for list-type sections
  const getSectionItems = () => {
    switch (activeTab) {
      case 'education': return educations;
      case 'skills': return skills;
      case 'technologies': return technologies;
      case 'projects': return projects;
      case 'internships': return internships;
      case 'certifications': return certifications;
      case 'leadership': return leaderships;
      case 'achievements': return achievements;
      case 'positions': return positions;
      default: return [];
    }
  };

  const activeSectionItems = getSectionItems();
  const activeTabDetails = SECTIONS.find(s => s.id === activeTab);

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">

      {/* Toast Notification */}
      {saveNotification && (
        <div className="fixed top-5 right-5 z-[200] bg-slate-800 border border-slate-700 text-white text-xs font-semibold px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {saveNotification}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h4 className="text-white font-extrabold text-sm">Delete Entry</h4>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">This action cannot be undone. The entry will be permanently removed from your profile.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-1">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: Section list */}
      <div className="w-80 border-r border-slate-800/80 bg-slate-900/10 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-extrabold text-white">Profile Workspace</h2>
          <div className="flex items-center justify-between text-xs mt-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl font-semibold">
            <span className="text-slate-500">Progress:</span>
            <span className="text-primary-400">{completionPercentage}% Complete</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left font-medium text-xs tracking-wide uppercase transition-all ${
                  activeTab === sec.id
                    ? 'bg-slate-800 text-white shadow-inner border border-slate-700/60'
                    : 'text-slate-500 hover:bg-slate-900/50 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${activeTab === sec.id ? 'text-primary-400' : ''}`} />
                  {sec.label}
                </span>
                {(() => {
                  const isDone = sectionsStatus[sec.id];
                  return isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : null;
                })()}
              </button>
            );
          })}
        </nav>
      </div>

      {/* CENTER COLUMN: Forms editing Workspace */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
          
          {/* Section Header */}
          <div className="flex justify-between items-center pb-6 border-b border-slate-800">
            <div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                {activeTabDetails?.label}
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                Provide comprehensive, factual information. Use the AI Assistant to rewrite descriptions professionally.
              </p>
            </div>
            
            <button
              onClick={handleOpenAiAssist}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-950/20"
            >
              <Sparkles className="w-4 h-4" />
              AI Assist Writer
            </button>
          </div>

          {/* Form rendering */}
          {activeTab === 'personal_info' ? (
            <form onSubmit={handleSavePersonal} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={personalForm.first_name}
                    onChange={(e) => setPersonalForm({ ...personalForm, first_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none placeholder:text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={personalForm.last_name}
                    onChange={(e) => setPersonalForm({ ...personalForm, last_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={personalForm.email}
                    onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={personalForm.phone || ''}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Current Location</label>
                  <input
                    type="text"
                    value={personalForm.location || ''}
                    placeholder="e.g. San Francisco, CA"
                    onChange={(e) => setPersonalForm({ ...personalForm, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Portfolio Website</label>
                  <input
                    type="url"
                    value={personalForm.website || ''}
                    placeholder="https://myportfolio.com"
                    onChange={(e) => setPersonalForm({ ...personalForm, website: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">LinkedIn URL</label>
                  <input
                    type="url"
                    value={personalForm.linkedin || ''}
                    onChange={(e) => setPersonalForm({ ...personalForm, linkedin: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={personalForm.github || ''}
                    onChange={(e) => setPersonalForm({ ...personalForm, github: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Professional Summary</label>
                <textarea
                  rows={4}
                  value={personalForm.summary || ''}
                  placeholder="Describe your career goals, key specialties, and general experience..."
                  onChange={(e) => setPersonalForm({ ...personalForm, summary: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-950/20"
              >
                <Save className="w-4 h-4" />
                Save Personal Info
              </button>
            </form>
          ) : (
            // Form for custom records (Education, Projects, Internships, etc.)
            <div className="space-y-8">
              
              {/* Add/Edit card form */}
              <div className="bg-slate-900/35 border border-slate-800/80 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-5 uppercase tracking-wide flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary-400" />
                  {editingId !== null ? 'Modify Entry' : 'Create Entry'}
                </h3>
                
                <form onSubmit={handleGenericSubmit} className="space-y-5">
                  {/* Dynamic inputs based on active tab requirements */}
                  {activeTab === 'education' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">School / Institution</label>
                          <input
                            type="text" required
                            value={genericForm.institution || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, institution: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Location</label>
                          <input
                            type="text"
                            value={genericForm.location || ''}
                            placeholder="e.g. Cambridge, MA"
                            onChange={(e) => setGenericForm({ ...genericForm, location: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Degree & Field of Study</label>
                          <input
                            type="text" required placeholder="B.S. in Computer Science"
                            value={`${genericForm.degree || ''} ${genericForm.field_of_study ? `in ${genericForm.field_of_study}` : ''}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              const parts = val.split(' in ');
                              setGenericForm({
                                ...genericForm,
                                degree: parts[0] || '',
                                field_of_study: parts[1] || ''
                              });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">GPA / Score</label>
                          <input
                            type="text"
                            value={genericForm.gpa || ''}
                            placeholder="e.g. 3.8 / 4.0"
                            onChange={(e) => setGenericForm({ ...genericForm, gpa: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Start Date</label>
                          <input
                            type="text" required placeholder="MM/YYYY"
                            value={genericForm.start_date || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, start_date: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">End Date</label>
                          <input
                            type="text" placeholder="MM/YYYY or Present"
                            value={genericForm.end_date || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, end_date: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'skills' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Skill Name</label>
                        <input
                          type="text" required placeholder="e.g. Project Management, SQL"
                          value={genericForm.name || ''}
                          onChange={(e) => setGenericForm({ ...genericForm, name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Proficiency Level</label>
                        <select
                          value={genericForm.level || ''}
                          onChange={(e) => setGenericForm({ ...genericForm, level: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 outline-none"
                        >
                          <option value="">Select Level</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === 'technologies' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Technology Name</label>
                        <input
                          type="text" required placeholder="e.g. React, Docker, Python"
                          value={genericForm.name || ''}
                          onChange={(e) => setGenericForm({ ...genericForm, name: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Category</label>
                        <input
                          type="text" placeholder="Languages, Frameworks, databases etc."
                          value={genericForm.category || ''}
                          onChange={(e) => setGenericForm({ ...genericForm, category: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'projects' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Project Title</label>
                          <input
                            type="text" required
                            value={genericForm.title || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, title: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Role / Contribution</label>
                          <input
                            type="text" placeholder="e.g. Frontend developer, Solo Architect"
                            value={genericForm.role || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, role: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Technologies Used</label>
                          <input
                            type="text" placeholder="e.g. React, Flask, MongoDB (comma-separated)"
                            value={genericForm.technologies || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, technologies: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Project Link (URL)</label>
                          <input
                            type="url" placeholder="https://github.com/user/project"
                            value={genericForm.url || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, url: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Team Size</label>
                          <input
                            type="text" placeholder="e.g. Solo, 3 members"
                            value={genericForm.team_size || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, team_size: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Outcome / Metric</label>
                          <input
                            type="text" placeholder="e.g. 20% speedup, 100+ active users"
                            value={genericForm.outcome || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, outcome: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Start Date</label>
                          <input
                            type="text" placeholder="MM/YYYY"
                            value={genericForm.start_date || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, start_date: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">End Date</label>
                          <input
                            type="text" placeholder="MM/YYYY or Present"
                            value={genericForm.end_date || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, end_date: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Project Description</label>
                        <textarea
                          rows={4} required placeholder="Detail the core challenge, implementation details, and performance metrics..."
                          value={genericForm.description || ''}
                          onChange={(e) => setGenericForm({ ...genericForm, description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'internships' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Company / Organization</label>
                          <input
                            type="text" required
                            value={genericForm.company || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, company: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Role / Title</label>
                          <input
                            type="text" required placeholder="SWE Intern"
                            value={genericForm.role || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, role: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Location</label>
                          <input
                            type="text" placeholder="Remote, or City, ST"
                            value={genericForm.location || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, location: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Start Date</label>
                          <input
                            type="text" required placeholder="MM/YYYY"
                            value={genericForm.start_date || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, start_date: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">End Date</label>
                          <input
                            type="text" placeholder="MM/YYYY or Present"
                            value={genericForm.end_date || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, end_date: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Responsibilities & Achievements</label>
                        <textarea
                          rows={4} required placeholder="Highlight core impact, team interactions, and tech deliverables..."
                          value={genericForm.description || ''}
                          onChange={(e) => setGenericForm({ ...genericForm, description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none leading-relaxed"
                        />
                      </div>
                    </>
                  )}

                  {/* Fallback for other standard sections like Certifications, Leadership, Achievements, Positions */}
                  {['certifications', 'leadership', 'achievements', 'positions'].includes(activeTab) && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                            {activeTab === 'certifications' ? 'Certificate Name' : 'Organization Name'}
                          </label>
                          <input
                            type="text" required
                            value={genericForm.name || genericForm.organization || genericForm.title || ''}
                            onChange={(e) => setGenericForm({ 
                              ...genericForm, 
                              name: e.target.value,
                              organization: e.target.value,
                              title: e.target.value
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                            {activeTab === 'certifications' ? 'Issuing Authority' : 'Role / Title'}
                          </label>
                          <input
                            type="text" required={activeTab !== 'achievements'}
                            value={genericForm.issuer || genericForm.role || ''}
                            onChange={(e) => setGenericForm({ 
                              ...genericForm, 
                              issuer: e.target.value,
                              role: e.target.value
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                            {activeTab === 'certifications' ? 'Verification Link (URL)' : 'Secondary Info'}
                          </label>
                          <input
                            type="text"
                            placeholder="Optional metadata"
                            value={genericForm.url || genericForm.location || ''}
                            onChange={(e) => setGenericForm({ 
                              ...genericForm, 
                              url: e.target.value,
                              location: e.target.value
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">
                            Date / Start Date
                          </label>
                          <input
                            type="text" required placeholder="MM/YYYY"
                            value={genericForm.issue_date || genericForm.start_date || genericForm.date || ''}
                            onChange={(e) => setGenericForm({ 
                              ...genericForm, 
                              issue_date: e.target.value,
                              start_date: e.target.value,
                              date: e.target.value
                            })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      {activeTab !== 'certifications' && (
                        <div>
                          <label className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider mb-2">Description</label>
                          <textarea
                            rows={3} required
                            value={genericForm.description || ''}
                            onChange={(e) => setGenericForm({ ...genericForm, description: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none resize-none"
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isReviewLoading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary-950/20 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isReviewLoading ? 'Reviewing...' : 'Save Entry'}
                    </button>
                    {editingId !== null && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-700/50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List of existing items */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                  Registered Records ({activeSectionItems.length})
                </h4>

                {activeSectionItems.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
                    No entries found. Fill the form above or click AI Assist Writer to populate.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeSectionItems.map((item: any) => (
                      <div 
                        key={item.id}
                        className="p-4 bg-slate-900/25 border border-slate-850 rounded-xl flex items-center justify-between gap-4"
                      >
                        <div className="overflow-hidden">
                          <h5 className="text-xs font-bold text-white truncate">
                            {item.title || item.name || item.institution || item.company || item.organization || 'Record Details'}
                          </h5>
                          <span className="text-[10px] text-slate-500 truncate block mt-1">
                            {item.role || item.degree || item.issuer || item.description || ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => startEditItem(item)}
                            className="p-2 hover:bg-slate-800 hover:text-white rounded-lg text-slate-500 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 hover:bg-slate-800 hover:text-rose-400 rounded-lg text-slate-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* RIGHT COLUMN: AI Assist Sliding Panel (Drawer) */}
      {showAiAssist && (
        <div className="w-96 border-l border-slate-800/80 bg-slate-900/60 backdrop-blur-xl flex flex-col h-full shrink-0 shadow-2xl z-25 relative animate-in slide-in-from-right duration-250">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <h3 className="font-extrabold text-xs uppercase text-white tracking-wider">AI Assist Drawer</h3>
            </div>
            <button
              onClick={() => setShowAiAssist(false)}
              className="text-xs text-slate-500 hover:text-white font-bold p-1 hover:bg-slate-800 rounded-lg"
            >
              Close
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex flex-col max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'ml-auto bg-primary-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                }`}
              >
                <span className="font-bold text-[9px] text-slate-400 mb-1">
                  {msg.role === 'user' ? 'You' : 'AI Assistant'}
                </span>
                <div className="whitespace-pre-line font-medium space-y-1" dangerouslySetInnerHTML={{ __html: msg.content
                  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.+?)\*/g, '<em>$1</em>')
                  .replace(/`(.+?)`/g, '<code class="bg-slate-700 px-1 rounded text-[10px]">$1</code>')
                  .replace(/\n/g, '<br />')
                }} />
              </div>
            ))}
            {isAiLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs px-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce delay-75" />
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce delay-150" />
                AI is compiling details...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input form */}
          <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-850 bg-slate-950/25 flex gap-2">
            <input
              type="text" required placeholder="Type your answers here..."
              value={chatInput}
              disabled={isAiLoading}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary-500 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={isAiLoading || !chatInput.trim()}
              className="p-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white rounded-xl transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}


      {/* PROFILE INTELLIGENCE REVIEW MODAL */}
      {showReviewModal && reviewReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Profile Intelligence Review
              </h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Score indicator */}
              <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase">Completeness Rating</h4>
                  <p className="text-[10px] text-slate-500 mt-1">Based on key information standards</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-amber-400">{reviewReport.completeness_score}%</span>
                  <div className="w-24 h-1.5 bg-slate-850 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${reviewReport.completeness_score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Missing Fields alerts */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">Missing Core Facts</h4>
                <div className="flex flex-wrap gap-1.5">
                  {reviewReport.missing_elements.map((elem) => (
                    <span 
                      key={elem} 
                      className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-950/20 text-[10px] font-extrabold rounded-lg"
                    >
                      {elem}
                    </span>
                  ))}
                </div>
              </div>

              {/* Follow-up Questions form */}
              <div className="space-y-4">
                <div className="pb-2 border-b border-slate-850">
                  <h4 className="text-xs font-bold text-white">Answer Follow-up Questions to reach 100%</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Your answers will be verified and mapped back to the record fields.</p>
                </div>

                <div className="space-y-4">
                  {reviewReport.missing_elements.map((elem, idx) => (
                    <div key={elem} className="space-y-2">
                      <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wide leading-relaxed">
                        {idx + 1}. {reviewReport.follow_up_questions[idx]}
                      </label>
                      {elem.includes("Description") || elem.includes("Outcome") || elem.includes("Responsibilities") || elem.includes("Achievements") || elem.includes("Duties") || elem.includes("Contributions") ? (
                        <textarea
                          rows={3}
                          placeholder="Provide details..."
                          value={followUpAnswers[elem] || ''}
                          onChange={(e) => setFollowUpAnswers({
                            ...followUpAnswers,
                            [elem]: e.target.value
                          })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary-500 resize-none leading-relaxed"
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="Provide details..."
                          value={followUpAnswers[elem] || ''}
                          onChange={(e) => setFollowUpAnswers({
                            ...followUpAnswers,
                            [elem]: e.target.value
                          })}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => proceedSave(genericForm)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-750"
              >
                Save Anyway (Keep score)
              </button>
              <button
                onClick={handleVerifyAndSave}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary-950/20"
              >
                Verify & Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
