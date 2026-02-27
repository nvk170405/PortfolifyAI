import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    ChevronLeft,
    Save,
    Download,
    Wand2,
    FileText,
    Briefcase,
    GraduationCap,
    Sparkles,
    LayoutTemplate,
    Loader2,
    Plus,
    Trash2,
    Check,
    X,
} from 'lucide-react';
import { resumeApi } from '../services/api';

const steps = [
    { id: 'basics', title: 'Personal Info', icon: FileText },
    { id: 'experience', title: 'Experience', icon: Briefcase },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'skills', title: 'Skills', icon: Sparkles },
];

interface Experience {
    title: string;
    company: string;
    location: string;
    dates: string;
    bullets: string[];
}

interface Education {
    degree: string;
    school: string;
    year: string;
}

interface ResumeContent {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string[];
}

const emptyResume: ResumeContent = {
    firstName: '', lastName: '', title: '', email: '', phone: '', location: '', summary: '',
    experience: [{ title: '', company: '', location: '', dates: '', bullets: [''] }],
    education: [{ degree: '', school: '', year: '' }],
    skills: [],
};

const ResumeBuilder = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('id');
    const previewRef = useRef<HTMLDivElement>(null);

    const [activeStep, setActiveStep] = useState(0);
    const [resumeTitle, setResumeTitle] = useState('Untitled Resume');
    const [content, setContent] = useState<ResumeContent>({ ...emptyResume });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(!!editId);
    const [resumeId, setResumeId] = useState<string | null>(editId);
    const [skillInput, setSkillInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const [enhancingBullet, setEnhancingBullet] = useState<string | null>(null);
    const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
    const [suggestingSkills, setSuggestingSkills] = useState(false);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    useEffect(() => {
        if (!editId) return;
        const load = async () => {
            try {
                const data = await resumeApi.get(editId);
                setResumeTitle(data.title);
                setContent({ ...emptyResume, ...data.content });
                setResumeId(data.id);
            } catch { /* fallback to empty */ }
            finally { setLoading(false); }
        };
        load();
    }, [editId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (resumeId) {
                await resumeApi.update(resumeId, { title: resumeTitle, content });
            } else {
                const res = await resumeApi.create({ title: resumeTitle, content: content as any });
                setResumeId(res.id);
                navigate(`/resume-builder?id=${res.id}`, { replace: true });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch { showToast('Failed to save'); }
        finally { setSaving(false); }
    };

    const handleAiSummary = async () => {
        if (!content.title && !content.experience.some(e => e.title)) {
            showToast('Add a job title or experience first');
            return;
        }
        setAiLoading(true);
        try {
            // Save first if needed
            let id = resumeId;
            if (!id) {
                const res = await resumeApi.create({ title: resumeTitle, content: content as any });
                id = res.id;
                setResumeId(id);
                navigate(`/resume-builder?id=${id}`, { replace: true });
            }
            const expSummary = content.experience.map(e => `${e.title} at ${e.company}: ${e.bullets.filter(b => b).join('. ')}`).join(' | ');
            const result = await resumeApi.aiSummary(id!, {
                job_title: content.title || resumeTitle,
                experience_summary: expSummary || 'General professional experience',
            });
            updateField('summary', result.summary);
            showToast('AI summary generated!');
        } catch {
            showToast('AI generation failed — check your API key');
        } finally {
            setAiLoading(false);
        }
    };

    const handleEnhanceBullet = async (expIdx: number, bulletIdx: number) => {
        const bullet = content.experience[expIdx].bullets[bulletIdx];
        if (!bullet.trim()) { showToast('Write a bullet first, then enhance it'); return; }
        const key = `${expIdx}-${bulletIdx}`;
        setEnhancingBullet(key);
        try {
            const result = await resumeApi.enhanceBullet({
                bullet,
                job_title: content.experience[expIdx].title,
                company: content.experience[expIdx].company,
            });
            const exp = [...content.experience];
            const bullets = [...exp[expIdx].bullets];
            bullets[bulletIdx] = result.enhanced;
            exp[expIdx] = { ...exp[expIdx], bullets };
            updateField('experience', exp);
            showToast('Bullet enhanced with AI!');
        } catch { showToast('Enhancement failed'); }
        finally { setEnhancingBullet(null); }
    };

    const handleSuggestSkills = async () => {
        if (!content.title) { showToast('Add a job title first'); return; }
        setSuggestingSkills(true);
        try {
            const expSummary = content.experience.map(e => `${e.title} at ${e.company}`).join(', ');
            const result = await resumeApi.suggestSkills({
                job_title: content.title,
                current_skills: content.skills,
                experience_summary: expSummary,
            });
            setSuggestedSkills(result.skills.filter(s => !content.skills.includes(s)));
            showToast(`${result.skills.length} skills suggested!`);
        } catch { showToast('Suggestion failed — check API key'); }
        finally { setSuggestingSkills(false); }
    };

    const handleExportPDF = () => {
        const printContent = previewRef.current;
        if (!printContent) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) { showToast('Please allow popups to export PDF'); return; }
        printWindow.document.write(`
            <!DOCTYPE html><html><head><title>${resumeTitle}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; padding: 48px; }
                header { border-bottom: 2px solid #1a1a1a; padding-bottom: 24px; margin-bottom: 32px; }
                h1 { font-size: 36px; font-weight: 700; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 8px; }
                h2.subtitle { font-size: 16px; font-weight: 500; color: #666; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 16px; }
                .contact { font-size: 13px; font-weight: 500; color: #333; }
                .contact span { margin-right: 12px; }
                .summary { font-size: 13px; line-height: 1.7; text-align: justify; margin-bottom: 32px; }
                h3 { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 16px; }
                .exp-block { margin-bottom: 24px; }
                .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
                .exp-header h4 { font-weight: 700; font-size: 14px; }
                .exp-header span { font-size: 13px; font-weight: 600; color: #666; }
                .exp-company { font-size: 13px; font-weight: 500; color: #6366f1; margin-bottom: 8px; }
                ul { padding-left: 16px; }
                li { font-size: 13px; line-height: 1.6; margin-bottom: 4px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
                .edu h4 { font-weight: 700; font-size: 13px; }
                .edu .school { font-size: 13px; color: #666; }
                .edu .year { font-size: 12px; color: #999; }
                .skill-tag { display: inline-block; padding: 4px 8px; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 6px; margin-bottom: 6px; }
                @media print { body { padding: 0.75in; } @page { size: A4; margin: 0; } }
            </style></head><body>
            <header>
                <h1>${content.firstName || 'Your'} ${content.lastName || 'Name'}</h1>
                <h2 class="subtitle">${content.title || 'Professional Title'}</h2>
                <div class="contact">
                    ${content.email ? `<span>${content.email}</span>` : ''}
                    ${content.phone ? `<span>• ${content.phone}</span>` : ''}
                    ${content.location ? `<span>• ${content.location}</span>` : ''}
                </div>
            </header>
            ${content.summary ? `<div class="summary">${content.summary}</div>` : ''}
            ${content.experience.some(e => e.title || e.company) ? `
                <h3>Experience</h3>
                ${content.experience.filter(e => e.title || e.company).map(exp => `
                    <div class="exp-block">
                        <div class="exp-header"><h4>${exp.title}</h4><span>${exp.dates}</span></div>
                        <div class="exp-company">${exp.company}${exp.location ? ` — ${exp.location}` : ''}</div>
                        <ul>${exp.bullets.filter(b => b).map(b => `<li>${b}</li>`).join('')}</ul>
                    </div>
                `).join('')}
            ` : ''}
            <div class="grid">
                ${content.education.some(e => e.degree || e.school) ? `
                    <div>
                        <h3>Education</h3>
                        ${content.education.filter(e => e.degree || e.school).map(edu => `
                            <div class="edu"><h4>${edu.degree}</h4><div class="school">${edu.school}</div><div class="year">${edu.year}</div></div>
                        `).join('')}
                    </div>
                ` : ''}
                ${content.skills.length > 0 ? `
                    <div>
                        <h3>Skills</h3>
                        <div>${content.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
                    </div>
                ` : ''}
            </div>
            </body></html>
        `);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
    };

    const updateField = (field: keyof ResumeContent, value: any) => {
        setContent(prev => ({ ...prev, [field]: value }));
    };

    const updateExp = (idx: number, field: keyof Experience, value: any) => {
        const exp = [...content.experience];
        exp[idx] = { ...exp[idx], [field]: value };
        updateField('experience', exp);
    };

    const addSkill = () => {
        const s = skillInput.trim();
        if (s && !content.skills.includes(s)) {
            updateField('skills', [...content.skills, s]);
            setSkillInput('');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 size={32} className="animate-spin text-dark-600" /></div>;
    }

    return (
        <div className="flex absolute inset-0 animate-slide-up bg-white">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-dark-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up">
                    <span className="text-sm font-medium">{toast}</span>
                    <button onClick={() => setToast(null)} className="text-white/60 hover:text-white"><X size={16} /></button>
                </div>
            )}

            {/* Left Pane: Editor */}
            <div className="w-full lg:w-1/2 flex flex-col bg-white border-r border-light-300 relative z-10">
                <div className="p-6 border-b border-light-200 flex items-center justify-between bg-white sticky top-0 z-20">
                    <div>
                        <input type="text" value={resumeTitle} onChange={e => setResumeTitle(e.target.value)} className="text-xl font-bold text-dark-900 bg-transparent border-none outline-none w-full" placeholder="Resume Title" />
                        <p className="text-sm text-dark-600">{saved ? '✓ Saved' : resumeId ? 'Editing' : 'New resume'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleAiSummary} disabled={aiLoading} className="p-2 text-dark-600 hover:text-dark-900 rounded-lg hover:bg-light-100 transition-colors relative" title="AI Magic — Generate Summary">
                            {aiLoading ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                        </button>
                        <button className="btn-secondary py-2 px-4 text-sm gap-2 flex items-center" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* Step Navigation */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex items-center justify-between mb-2">
                        {steps.map((step, idx) => (
                            <React.Fragment key={step.id}>
                                <div className={`flex flex-col items-center gap-2 relative z-10 ${idx <= activeStep ? 'text-dark-900' : 'text-light-400'}`}>
                                    <button onClick={() => setActiveStep(idx)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${idx === activeStep ? 'bg-dark-900 text-white shadow-md scale-110' : idx < activeStep ? 'bg-dark-900 text-white' : 'bg-light-200 text-dark-600 border border-light-300 hover:bg-light-300'}`}>
                                        <step.icon size={18} />
                                    </button>
                                </div>
                                {idx < steps.length - 1 && <div className={`flex-1 h-1 rounded-full mx-2 ${idx < activeStep ? 'bg-dark-900' : 'bg-light-200'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs font-medium px-1 mt-2">
                        {steps.map((step, idx) => <span key={`label-${step.id}`} className={idx <= activeStep ? 'text-dark-900' : 'text-light-400'}>{step.title}</span>)}
                    </div>
                </div>

                {/* Dynamic Form Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-xl mx-auto space-y-8 pb-32">
                        {activeStep === 0 && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-8 h-8 rounded-lg bg-light-200 flex items-center justify-center text-dark-900"><FileText size={16} /></div>
                                    <h3 className="text-xl font-bold text-dark-900">Personal Details</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-dark-800 mb-1">First Name</label><input type="text" className="input-field py-3" value={content.firstName} onChange={e => updateField('firstName', e.target.value)} placeholder="John" /></div>
                                    <div><label className="block text-sm font-medium text-dark-800 mb-1">Last Name</label><input type="text" className="input-field py-3" value={content.lastName} onChange={e => updateField('lastName', e.target.value)} placeholder="Doe" /></div>
                                </div>
                                <div><label className="block text-sm font-medium text-dark-800 mb-1">Professional Title</label><input type="text" className="input-field py-3" value={content.title} onChange={e => updateField('title', e.target.value)} placeholder="Senior Frontend Engineer" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-dark-800 mb-1">Email</label><input type="email" className="input-field py-3" value={content.email} onChange={e => updateField('email', e.target.value)} placeholder="john@example.com" /></div>
                                    <div><label className="block text-sm font-medium text-dark-800 mb-1">Phone</label><input type="tel" className="input-field py-3" value={content.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+1 (555) 123-4567" /></div>
                                </div>
                                <div><label className="block text-sm font-medium text-dark-800 mb-1">Location</label><input type="text" className="input-field py-3" value={content.location} onChange={e => updateField('location', e.target.value)} placeholder="San Francisco, CA" /></div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-sm font-medium text-dark-800">Professional Summary</label>
                                        <button onClick={handleAiSummary} disabled={aiLoading} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
                                            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} {aiLoading ? 'Writing...' : 'Auto-write with AI'}
                                        </button>
                                    </div>
                                    <textarea className="input-field py-3 min-h-[120px] resize-y" value={content.summary} onChange={e => updateField('summary', e.target.value)} placeholder="A brief professional summary..." />
                                </div>
                            </div>
                        )}
                        {activeStep === 1 && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="flex items-center gap-2 mb-6"><div className="w-8 h-8 rounded-lg bg-light-200 flex items-center justify-center text-dark-900"><Briefcase size={16} /></div><h3 className="text-xl font-bold text-dark-900">Work Experience</h3></div>
                                {content.experience.map((exp, idx) => (
                                    <div key={idx} className="border border-light-300 rounded-2xl p-5 space-y-4 relative">
                                        {content.experience.length > 1 && <button onClick={() => updateField('experience', content.experience.filter((_, i) => i !== idx))} className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-medium text-dark-800 mb-1">Job Title</label><input type="text" className="input-field py-2.5" value={exp.title} onChange={e => updateExp(idx, 'title', e.target.value)} placeholder="Software Engineer" /></div>
                                            <div><label className="block text-sm font-medium text-dark-800 mb-1">Company</label><input type="text" className="input-field py-2.5" value={exp.company} onChange={e => updateExp(idx, 'company', e.target.value)} placeholder="TechCorp Inc." /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-medium text-dark-800 mb-1">Location</label><input type="text" className="input-field py-2.5" value={exp.location} onChange={e => updateExp(idx, 'location', e.target.value)} placeholder="San Francisco, CA" /></div>
                                            <div><label className="block text-sm font-medium text-dark-800 mb-1">Dates</label><input type="text" className="input-field py-2.5" value={exp.dates} onChange={e => updateExp(idx, 'dates', e.target.value)} placeholder="2021 - Present" /></div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-800 mb-1">Key Achievements</label>
                                            {exp.bullets.map((b, bi) => (
                                                <div key={bi} className="flex items-center gap-2 mb-2">
                                                    <span className="text-dark-600 text-sm">•</span>
                                                    <input type="text" className="input-field py-2 text-sm flex-1" value={b} onChange={e => { const bullets = [...exp.bullets]; bullets[bi] = e.target.value; updateExp(idx, 'bullets', bullets); }} placeholder="Describe an achievement..." />
                                                    <button onClick={() => handleEnhanceBullet(idx, bi)} disabled={enhancingBullet === `${idx}-${bi}`} className="p-1 text-purple-500 hover:text-purple-700 transition-colors" title="Enhance with AI">
                                                        {enhancingBullet === `${idx}-${bi}` ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                    </button>
                                                    {exp.bullets.length > 1 && <button onClick={() => updateExp(idx, 'bullets', exp.bullets.filter((_, i) => i !== bi))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
                                                </div>
                                            ))}
                                            <button onClick={() => updateExp(idx, 'bullets', [...exp.bullets, ''])} className="text-xs font-semibold text-dark-600 hover:text-dark-900 flex items-center gap-1 mt-1"><Plus size={12} /> Add bullet</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => updateField('experience', [...content.experience, { title: '', company: '', location: '', dates: '', bullets: [''] }])} className="btn-ghost w-full py-3 text-sm"><Plus size={16} /> Add Experience</button>
                            </div>
                        )}
                        {activeStep === 2 && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="flex items-center gap-2 mb-6"><div className="w-8 h-8 rounded-lg bg-light-200 flex items-center justify-center text-dark-900"><GraduationCap size={16} /></div><h3 className="text-xl font-bold text-dark-900">Education</h3></div>
                                {content.education.map((edu, idx) => (
                                    <div key={idx} className="border border-light-300 rounded-2xl p-5 space-y-4 relative">
                                        {content.education.length > 1 && <button onClick={() => updateField('education', content.education.filter((_, i) => i !== idx))} className="absolute top-3 right-3 p-1 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}
                                        <div><label className="block text-sm font-medium text-dark-800 mb-1">Degree</label><input type="text" className="input-field py-2.5" value={edu.degree} onChange={e => { const ed = [...content.education]; ed[idx] = { ...ed[idx], degree: e.target.value }; updateField('education', ed); }} placeholder="B.S. in Computer Science" /></div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><label className="block text-sm font-medium text-dark-800 mb-1">School</label><input type="text" className="input-field py-2.5" value={edu.school} onChange={e => { const ed = [...content.education]; ed[idx] = { ...ed[idx], school: e.target.value }; updateField('education', ed); }} placeholder="University of California" /></div>
                                            <div><label className="block text-sm font-medium text-dark-800 mb-1">Year</label><input type="text" className="input-field py-2.5" value={edu.year} onChange={e => { const ed = [...content.education]; ed[idx] = { ...ed[idx], year: e.target.value }; updateField('education', ed); }} placeholder="2018" /></div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => updateField('education', [...content.education, { degree: '', school: '', year: '' }])} className="btn-ghost w-full py-3 text-sm"><Plus size={16} /> Add Education</button>
                            </div>
                        )}
                        {activeStep === 3 && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="flex items-center gap-2 mb-6"><div className="w-8 h-8 rounded-lg bg-light-200 flex items-center justify-center text-dark-900"><Sparkles size={16} /></div><h3 className="text-xl font-bold text-dark-900">Skills</h3></div>
                                <div className="flex gap-2">
                                    <input type="text" className="input-field py-3 flex-1" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Type a skill and press Enter" />
                                    <button onClick={addSkill} className="btn-secondary py-3 px-4"><Plus size={16} /></button>
                                </div>
                                <button onClick={handleSuggestSkills} disabled={suggestingSkills} className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-lg w-max">
                                    {suggestingSkills ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {suggestingSkills ? 'Suggesting...' : '✨ AI Suggest Skills'}
                                </button>
                                {suggestedSkills.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs font-medium text-dark-600 mb-2">Click to add suggested skills:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedSkills.map(skill => (
                                                <button key={skill} onClick={() => { updateField('skills', [...content.skills, skill]); setSuggestedSkills(prev => prev.filter(s => s !== skill)); }} className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1">
                                                    <Plus size={12} /> {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {content.skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 bg-light-200 border border-light-300 text-dark-800 text-sm font-semibold rounded-lg flex items-center gap-2">{skill}<button onClick={() => updateField('skills', content.skills.filter(s => s !== skill))} className="text-dark-600 hover:text-red-600"><Trash2 size={12} /></button></span>
                                    ))}
                                    {content.skills.length === 0 && <p className="text-dark-600 text-sm">No skills added yet. Type above and press Enter.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-light-200 bg-white flex items-center justify-between sticky bottom-0 z-20">
                    <button className={`btn-ghost py-3 px-6 ${activeStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => setActiveStep(prev => Math.max(0, prev - 1))} disabled={activeStep === 0}><ChevronLeft size={20} /> Back</button>
                    <button className="btn-primary py-3 px-8" onClick={() => activeStep === steps.length - 1 ? handleSave() : setActiveStep(prev => prev + 1)}>
                        {activeStep === steps.length - 1 ? 'Save & Finish' : 'Next Step'} <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Right Pane: Live Preview */}
            <div className="hidden lg:flex w-1/2 bg-light-200 flex-col relative">
                <div className="h-16 flex items-center justify-between px-6 bg-light-200 border-b border-light-300 absolute top-0 left-0 right-0 z-10">
                    <div className="flex items-center gap-2">
                        <button onClick={() => showToast('Template library coming soon!')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-light-300 rounded-lg text-sm font-medium hover:bg-light-100 transition-colors shadow-sm text-dark-800">
                            <LayoutTemplate size={16} /> Change Template
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleExportPDF} className="flex items-center justify-center w-10 h-10 bg-white border border-light-300 rounded-lg text-dark-800 hover:bg-light-100 transition-colors shadow-sm" title="Export PDF">
                            <Download size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 pt-24 pb-12 flex justify-center items-start custom-scrollbar">
                    <div ref={previewRef} className="w-full max-w-[800px] aspect-[1/1.414] bg-white shadow-card rounded-sm overflow-hidden border border-light-300">
                        <div className="p-12 h-full flex flex-col font-sans">
                            <header className="border-b-2 border-dark-900 pb-6 mb-8">
                                <h1 className="text-5xl font-bold tracking-tight text-dark-900 mb-2 uppercase">{content.firstName || 'Your'} {content.lastName || 'Name'}</h1>
                                <h2 className="text-xl font-medium text-dark-600 mb-4 tracking-widest uppercase">{content.title || 'Professional Title'}</h2>
                                <div className="flex items-center gap-4 text-sm font-medium text-dark-800 flex-wrap">
                                    {content.email && <span>{content.email}</span>}
                                    {content.phone && <><span>•</span><span>{content.phone}</span></>}
                                    {content.location && <><span>•</span><span>{content.location}</span></>}
                                </div>
                            </header>
                            {content.summary && <div className="mb-8"><p className="text-sm leading-relaxed text-dark-800 text-justify">{content.summary}</p></div>}
                            {content.experience.some(e => e.title || e.company) && (
                                <div className="mb-8 flex-1">
                                    <h3 className="text-lg font-bold uppercase tracking-wider text-dark-900 border-b border-light-300 pb-2 mb-4">Experience</h3>
                                    {content.experience.filter(e => e.title || e.company).map((exp, idx) => (
                                        <div key={idx} className="mb-6">
                                            <div className="flex justify-between items-baseline mb-1"><h4 className="font-bold text-dark-900">{exp.title}</h4><span className="text-sm font-semibold text-dark-600">{exp.dates}</span></div>
                                            <div className="text-sm font-medium text-brand-accent mb-2">{exp.company}{exp.location ? ` — ${exp.location}` : ''}</div>
                                            <ul className="list-disc leading-relaxed pl-4 space-y-1 text-sm text-dark-800 marker:text-light-400">{exp.bullets.filter(b => b).map((b, bi) => <li key={bi}>{b}</li>)}</ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-8">
                                {content.education.some(e => e.degree || e.school) && (
                                    <div><h3 className="text-lg font-bold uppercase tracking-wider text-dark-900 border-b border-light-300 pb-2 mb-4">Education</h3>
                                        {content.education.filter(e => e.degree || e.school).map((edu, idx) => (<div key={idx} className="mb-3"><h4 className="font-bold text-dark-900 text-sm">{edu.degree}</h4><div className="text-sm text-dark-600">{edu.school}</div><div className="text-xs text-light-400 font-medium">{edu.year}</div></div>))}</div>
                                )}
                                {content.skills.length > 0 && (
                                    <div><h3 className="text-lg font-bold uppercase tracking-wider text-dark-900 border-b border-light-300 pb-2 mb-4">Skills</h3>
                                        <div className="flex flex-wrap gap-2">{content.skills.map(skill => <span key={skill} className="px-2 py-1 bg-light-200 border border-light-300 text-dark-800 text-xs font-semibold rounded-md">{skill}</span>)}</div></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilder;
