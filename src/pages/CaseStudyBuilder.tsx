import { useState } from 'react';
import { Save, Download, Sparkles, CheckCircle2, Loader2, Check, X } from 'lucide-react';
import { caseStudyApi } from '../services/api';

interface CaseStudyInputs {
    projectName: string;
    role: string;
    techStack: string;
    problem: string;
    solution: string;
    results: string;
}

interface GeneratedContent {
    executive_summary?: string;
    challenge?: string;
    solution_architecture?: string;
}

const CaseStudyBuilder = () => {
    const [activeTab, setActiveTab] = useState<'details' | 'content'>('details');
    const [inputs, setInputs] = useState<CaseStudyInputs>({
        projectName: '', role: '', techStack: '', problem: '', solution: '', results: '',
    });
    const [generated, setGenerated] = useState<GeneratedContent>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [caseStudyId, setCaseStudyId] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await caseStudyApi.create({ title: inputs.projectName || 'Untitled Case Study', inputs });
            setCaseStudyId(res.id);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch { showToast('Failed to save'); }
        finally { setSaving(false); }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            let id = caseStudyId;
            if (!id) {
                const res = await caseStudyApi.create({ title: inputs.projectName || 'Untitled Case Study', inputs });
                id = res.id;
                setCaseStudyId(id);
            }
            const result = await caseStudyApi.generate(id!);
            setGenerated(result.generated_content || {});
            setActiveTab('content');
            showToast('Case study generated!');
        } catch { showToast('Generation failed — check your API key'); }
        finally { setGenerating(false); }
    };

    const handleExportPDF = () => {
        const w = window.open('', '_blank');
        if (!w) { showToast('Allow popups to export PDF'); return; }
        const techTags = inputs.techStack.split(',').map(t => t.trim()).filter(Boolean);
        w.document.write(`
            <!DOCTYPE html><html><head><title>${inputs.projectName || 'Case Study'}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; padding: 48px; max-width: 800px; margin: 0 auto; }
                h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
                .subtitle { font-size: 1.125rem; color: #64748b; margin-bottom: 1rem; }
                .role { text-align: right; }
                .role .label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }
                .role .value { font-size: 0.875rem; color: #64748b; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2.5rem; }
                .tag { background: #1a1a1a; color: white; font-size: 0.75rem; font-weight: 700; padding: 4px 12px; border-radius: 9999px; }
                h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; margin-top: 2rem; }
                p { line-height: 1.7; margin-bottom: 1rem; }
                .impact { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 2rem; }
                .impact h4 { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
                .impact li { font-size: 0.875rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
                .impact li::before { content: '✓'; color: #22c55e; font-weight: 700; }
                @media print { body { padding: 0; } @page { margin: 0.5in; } }
            </style></head><body>
            <div class="header">
                <div><h1>${inputs.projectName || 'Project Title'}</h1><p class="subtitle">${inputs.problem ? inputs.problem.substring(0, 80) : 'Case Study'}</p></div>
                ${inputs.role ? `<div class="role"><div class="label">Role</div><div class="value">${inputs.role}</div></div>` : ''}
            </div>
            ${techTags.length ? `<div class="tags">${techTags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
            ${inputs.results ? `<div class="impact"><h4>Impact</h4><ul>${inputs.results.split('.').filter(Boolean).slice(0, 5).map(r => `<li>${r.trim()}</li>`).join('')}</ul></div>` : ''}
            ${generated.executive_summary ? `<h3>Executive Summary</h3><p>${generated.executive_summary}</p>` : ''}
            ${generated.challenge ? `<h3>The Challenge</h3><p>${generated.challenge}</p>` : ''}
            ${generated.solution_architecture ? `<h3>Solution Architecture</h3><p>${generated.solution_architecture}</p>` : ''}
            ${!generated.executive_summary && inputs.problem ? `<h3>The Problem</h3><p>${inputs.problem}</p>` : ''}
            ${!generated.solution_architecture && inputs.solution ? `<h3>The Solution</h3><p>${inputs.solution}</p>` : ''}
            </body></html>
        `);
        w.document.close();
        setTimeout(() => w.print(), 500);
    };

    const updateInput = (field: keyof CaseStudyInputs, value: string) => setInputs(prev => ({ ...prev, [field]: value }));
    const techTags = inputs.techStack.split(',').map(t => t.trim()).filter(Boolean);

    return (
        <div className="flex absolute inset-0 animate-slide-up bg-white">
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-dark-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up">
                    <span className="text-sm font-medium">{toast}</span>
                    <button onClick={() => setToast(null)} className="text-white/60 hover:text-white"><X size={16} /></button>
                </div>
            )}

            <div className="w-full lg:w-1/2 flex flex-col bg-white border-r border-light-300 relative z-10">
                <div className="p-6 border-b border-light-200 flex items-center justify-between bg-white sticky top-0 z-20">
                    <div>
                        <input type="text" value={inputs.projectName} onChange={e => updateInput('projectName', e.target.value)} className="text-xl font-bold text-dark-900 bg-transparent border-none outline-none w-full" placeholder="Case Study Title" />
                        <p className="text-sm text-dark-600">Case Study Generator</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn-secondary py-2 px-4 text-sm gap-2 border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white flex items-center" onClick={handleGenerate} disabled={generating}>
                            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {generating ? 'Generating...' : 'Auto-Generate'}
                        </button>
                        <button className="btn-primary py-2 px-4 text-sm gap-2 flex items-center" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                        </button>
                    </div>
                </div>

                <div className="flex px-6 border-b border-light-200">
                    <button onClick={() => setActiveTab('details')} className={`py-4 text-sm font-semibold mr-8 border-b-2 transition-colors ${activeTab === 'details' ? 'border-dark-900 text-dark-900' : 'border-transparent text-dark-600 hover:text-dark-900'}`}>Project Details</button>
                    <button onClick={() => setActiveTab('content')} className={`py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'content' ? 'border-dark-900 text-dark-900' : 'border-transparent text-dark-600 hover:text-dark-900'}`}>Generated Content</button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' && (
                        <div className="max-w-xl mx-auto space-y-6 animate-slide-up pb-20">
                            <div><label className="block text-sm font-medium text-dark-800 mb-1">Role / Contribution</label><input type="text" className="input-field py-3" value={inputs.role} onChange={e => updateInput('role', e.target.value)} placeholder="Lead Frontend Engineer" /></div>
                            <div><label className="block text-sm font-medium text-dark-800 mb-1">Tech Stack (comma-separated)</label><input type="text" className="input-field py-3" value={inputs.techStack} onChange={e => updateInput('techStack', e.target.value)} placeholder="React, Next.js, Tailwind CSS, Stripe API" /></div>
                            <div><label className="block text-sm font-medium text-dark-800 mb-1">The Problem</label><textarea className="input-field py-3 min-h-[100px]" value={inputs.problem} onChange={e => updateInput('problem', e.target.value)} placeholder="Describe the problem this project solved..." /></div>
                            <div><label className="block text-sm font-medium text-dark-800 mb-1">The Solution & Workflow</label><textarea className="input-field py-3 min-h-[100px]" value={inputs.solution} onChange={e => updateInput('solution', e.target.value)} placeholder="Describe how you solved it..." /></div>
                            <div><label className="block text-sm font-medium text-dark-800 mb-1">Results & Impact</label><textarea className="input-field py-3 min-h-[100px]" value={inputs.results} onChange={e => updateInput('results', e.target.value)} placeholder="Describe the measurable impact..." /></div>
                        </div>
                    )}
                    {activeTab === 'content' && (
                        <div className="max-w-xl mx-auto space-y-6 animate-slide-up pb-20">
                            {!generated.executive_summary && !generating ? (
                                <div className="p-8 bg-light-100 rounded-xl border border-light-300 border-dashed text-center">
                                    <Sparkles size={32} className="mx-auto mb-3 text-dark-600" />
                                    <h3 className="font-bold text-dark-900 mb-2">No content yet</h3>
                                    <p className="text-sm text-dark-600 mb-4">Fill in the project details and click "Auto-Generate" to create your case study.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-xl flex gap-3 text-brand-accent items-start">
                                        <Sparkles size={20} className="shrink-0 mt-0.5" />
                                        <div><h4 className="font-semibold text-sm">AI Generated Content</h4><p className="text-xs opacity-80 mt-1">Review and edit the generated text below.</p></div>
                                    </div>
                                    <div><label className="block text-sm font-bold text-dark-900 mb-2">Executive Summary</label><textarea className="input-field py-3 min-h-[120px] bg-light-100 text-sm font-medium" value={generated.executive_summary || ''} onChange={e => setGenerated(p => ({ ...p, executive_summary: e.target.value }))} /></div>
                                    <div><label className="block text-sm font-bold text-dark-900 mb-2">Challenge</label><textarea className="input-field py-3 min-h-[120px] bg-light-100 text-sm font-medium" value={generated.challenge || ''} onChange={e => setGenerated(p => ({ ...p, challenge: e.target.value }))} /></div>
                                    <div><label className="block text-sm font-bold text-dark-900 mb-2">Solution Architecture</label><textarea className="input-field py-3 min-h-[120px] bg-light-100 text-sm font-medium" value={generated.solution_architecture || ''} onChange={e => setGenerated(p => ({ ...p, solution_architecture: e.target.value }))} /></div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane: Preview */}
            <div className="hidden lg:flex w-1/2 bg-light-200 flex-col relative">
                <div className="h-16 flex items-center justify-end px-6 bg-light-200 border-b border-light-300 absolute top-0 left-0 right-0 z-10">
                    <button onClick={handleExportPDF} className="flex items-center justify-center w-10 h-10 bg-white border border-light-300 rounded-lg text-dark-800 hover:bg-light-100 transition-colors shadow-sm" title="Export as PDF">
                        <Download size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 pt-24 pb-12 flex justify-center items-start custom-scrollbar">
                    <div className="w-full max-w-[800px] bg-white shadow-card rounded-xl overflow-hidden border border-light-300 p-10 pb-16">
                        <div className="font-sans text-dark-800">
                            <div className="mb-6 flex justify-between items-start">
                                <div>
                                    <h1 className="text-4xl font-extrabold text-dark-900 tracking-tight mb-2">{inputs.projectName || 'Project Title'}</h1>
                                    <p className="text-xl text-dark-600 font-medium">{inputs.problem ? inputs.problem.substring(0, 60) + '...' : 'Project description'}</p>
                                </div>
                                {inputs.role && <div className="text-right"><div className="text-sm font-bold text-dark-900 uppercase tracking-widest">Role</div><div className="text-sm text-dark-600">{inputs.role}</div></div>}
                            </div>
                            {techTags.length > 0 && <div className="flex flex-wrap gap-2 mb-10">{techTags.map(tech => <span key={tech} className="px-3 py-1 bg-dark-900 text-white text-xs font-bold rounded-full">{tech}</span>)}</div>}
                            <div className="w-full h-48 bg-light-200 rounded-2xl mb-10 border border-light-300 flex items-center justify-center relative overflow-hidden"><span className="text-light-400 font-medium">Hero Image Placeholder</span></div>
                            {(generated.executive_summary || inputs.results) && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                    <div className="p-5 bg-light-100 rounded-xl border border-light-200">
                                        <h4 className="text-sm font-bold text-dark-900 uppercase tracking-widest mb-2">Impact</h4>
                                        <ul className="space-y-2">{inputs.results.split('.').filter(Boolean).slice(0, 3).map((r, i) => <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 size={14} className="text-green-500 shrink-0" /> {r.trim()}</li>)}</ul>
                                    </div>
                                    <div className="md:col-span-2"><h3 className="text-2xl font-bold text-dark-900 mb-3">Executive Summary</h3><p className="leading-relaxed">{generated.executive_summary || 'Click "Auto-Generate" to create the summary.'}</p></div>
                                </div>
                            )}
                            {generated.challenge && <><h3 className="text-2xl font-bold text-dark-900 mb-3">The Challenge</h3><p className="leading-relaxed mb-8">{generated.challenge}</p></>}
                            {generated.solution_architecture && <><h3 className="text-2xl font-bold text-dark-900 mb-3">Solution Architecture</h3><p className="leading-relaxed">{generated.solution_architecture}</p></>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseStudyBuilder;
