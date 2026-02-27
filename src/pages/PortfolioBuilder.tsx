import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Monitor, Smartphone, Eye, Globe, Code2,
    CheckCircle2, LayoutTemplate, Save, Loader2, Check, Plus, Trash2, Palette, Type, X, Sparkles,
} from 'lucide-react';
import { portfolioApi } from '../services/api';

interface Project { name: string; tech: string; selected: boolean; }

interface PortfolioConfig {
    headline: string;
    subheadline: string;
    projects: Project[];
    subdomain: string;
    accentColor: string;
    fontFamily: string;
    darkMode: boolean;
}

const emptyConfig: PortfolioConfig = {
    headline: '', subheadline: '', projects: [], subdomain: '',
    accentColor: '#6366f1', fontFamily: 'Inter', darkMode: true,
};

const ACCENT_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Orange', value: '#f97316' },
];

const FONTS = ['Inter', 'Roboto', 'Outfit', 'Space Grotesk', 'DM Sans', 'Poppins'];

const PortfolioBuilder = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('id');

    const [activeTab, setActiveTab] = useState<'content' | 'design' | 'settings'>('content');
    const [portfolioTitle, setPortfolioTitle] = useState('My Portfolio');
    const [config, setConfig] = useState<PortfolioConfig>({ ...emptyConfig });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(!!editId);
    const [portfolioId, setPortfolioId] = useState<string | null>(editId);
    const [isPublished, setIsPublished] = useState(false);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [toast, setToast] = useState<string | null>(null);
    const [generatingBio, setGeneratingBio] = useState(false);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    useEffect(() => {
        if (!editId) return;
        const load = async () => {
            try {
                const data = await portfolioApi.get(editId);
                setPortfolioTitle(data.title);
                setConfig({ ...emptyConfig, ...data.config });
                setIsPublished(data.is_published);
                setPortfolioId(data.id);
            } catch { /* empty */ }
            finally { setLoading(false); }
        };
        load();
    }, [editId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            if (portfolioId) {
                await portfolioApi.update(portfolioId, { title: portfolioTitle, config, is_published: isPublished });
            } else {
                const res = await portfolioApi.create({ title: portfolioTitle, config });
                setPortfolioId(res.id);
                navigate(`/portfolio-builder?id=${res.id}`, { replace: true });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch { showToast('Failed to save'); }
        finally { setSaving(false); }
    };

    const handlePublish = async () => {
        const newVal = !isPublished;
        setIsPublished(newVal);
        if (portfolioId) {
            await portfolioApi.update(portfolioId, { is_published: newVal });
            showToast(newVal ? 'Portfolio published!' : 'Portfolio unpublished');
        } else {
            await handleSave();
        }
    };

    const handleFullPreview = () => {
        const w = window.open('', '_blank');
        if (!w) { showToast('Allow popups for full preview'); return; }
        const bgColor = config.darkMode ? '#0f172a' : '#ffffff';
        const textColor = config.darkMode ? '#ffffff' : '#0f172a';
        const subText = config.darkMode ? '#94a3b8' : '#64748b';
        const cardBg = config.darkMode ? 'rgba(30,41,59,0.5)' : '#ffffff';
        const cardBorder = config.darkMode ? '#334155' : '#e2e8f0';
        const sectionBg = config.darkMode ? '#1e293b' : '#f1f5f9';
        const thumbBg = config.darkMode ? '#0f172a' : '#f1f5f9';
        w.document.write(`
            <!DOCTYPE html><html><head><title>${portfolioTitle}</title>
            <link href="https://fonts.googleapis.com/css2?family=${(config.fontFamily || 'Inter').replace(' ', '+')}:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: '${config.fontFamily || 'Inter'}', sans-serif; background: ${bgColor}; color: ${textColor}; -webkit-font-smoothing: antialiased; }

                /* Nav */
                nav { padding: 2rem 3rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; font-weight: 500; }
                nav .logo { font-weight: 800; font-size: 1.35rem; letter-spacing: -0.06em; }
                nav .links { display: flex; gap: 2rem; color: ${subText}; }
                nav .links a { color: inherit; text-decoration: none; opacity: 0.7; transition: opacity 0.2s; }
                nav .links a:hover { opacity: 1; color: ${textColor}; }

                /* Hero */
                .hero { padding: 6rem 4rem 8rem; max-width: 720px; }
                .hero h1 { font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 800; line-height: 1.08; letter-spacing: -0.03em; margin-bottom: 1.5rem; }
                .hero p { font-size: 1.25rem; color: ${subText}; line-height: 1.65; margin-bottom: 2.5rem; opacity: 0.6; font-weight: 400; }
                .hero .cta { display: inline-block; background: ${config.accentColor}; color: white; border: none; padding: 0.85rem 2rem; border-radius: 9999px; font-weight: 700; font-size: 0.875rem; cursor: pointer; text-decoration: none; letter-spacing: 0.02em; transition: opacity 0.2s; }
                .hero .cta:hover { opacity: 0.9; }

                /* Projects */
                .projects-section { padding: 3.5rem 3rem 4rem; background: ${sectionBg}; border-radius: 3rem 3rem 0 0; }
                .projects-section .section-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.5rem; }
                .projects-section .section-title svg { width: 24px; height: 24px; }
                .projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
                .project-card { background: ${cardBg}; border: 1px solid ${cardBorder}; border-radius: 1.5rem; padding: 1.5rem; height: 280px; cursor: pointer; transition: border-color 0.3s, transform 0.3s; }
                .project-card:hover { border-color: ${config.darkMode ? '#94a3b8' : '#1e293b'}; transform: translateY(-2px); }
                .project-card .thumb { width: 100%; height: 140px; background: ${thumbBg}; border-radius: 0.75rem; margin-bottom: 1rem; overflow: hidden; position: relative; }
                .project-card .thumb .gradient { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15)); transition: transform 0.5s; }
                .project-card:hover .thumb .gradient { transform: scale(1.08); }
                .project-card h3 { font-weight: 700; font-size: 1.15rem; margin-bottom: 0.35rem; }
                .project-card p { font-size: 0.875rem; color: ${subText}; opacity: 0.6; }

                /* Footer */
                .footer { padding: 3rem; text-align: center; font-size: 0.8rem; color: ${subText}; opacity: 0.5; }

                /* Responsive */
                @media (max-width: 640px) {
                    nav { padding: 1.5rem; }
                    .hero { padding: 2rem 1.5rem 3rem; }
                    .hero h1 { font-size: 2rem; }
                    .hero p { font-size: 1rem; }
                    .projects-section { padding: 2rem 1.5rem; border-radius: 2rem 2rem 0 0; }
                    .projects-grid { grid-template-columns: 1fr; }
                    .project-card { height: auto; }
                }
            </style></head><body>
            <nav>
                <div class="logo">${portfolioTitle}.</div>
                <div class="links">
                    <a href="#work">Work</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                </div>
            </nav>
            <div class="hero">
                <h1>${config.headline || 'Your Headline Here'}</h1>
                <p>${config.subheadline || 'Add a sub-headline describing what you do.'}</p>
                <a class="cta" href="#">View Resume</a>
            </div>
            ${config.projects.length > 0 ? `
                <div class="projects-section" id="work">
                    <div class="section-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="${config.accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Featured Work
                    </div>
                    <div class="projects-grid">
                        ${config.projects.map(p => `
                            <div class="project-card">
                                <div class="thumb"><div class="gradient"></div></div>
                                <h3>${p.name || 'Project Name'}</h3>
                                <p>${p.tech || 'Technologies'}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            <div class="footer">Built with PortfolifyAI</div>
            </body></html>
        `);
        w.document.close();
    };

    const addProject = () => setConfig(prev => ({ ...prev, projects: [...prev.projects, { name: '', tech: '', selected: true }] }));
    const removeProject = (idx: number) => setConfig(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== idx) }));

    const handleGenerateBio = async () => {
        setGeneratingBio(true);
        try {
            const result = await portfolioApi.generateBio({
                name: portfolioTitle,
                title: config.headline || 'Professional',
                skills: config.projects.map(p => p.tech).filter(Boolean),
            });
            setConfig(prev => ({
                ...prev,
                headline: result.tagline || prev.headline,
                subheadline: result.bio || prev.subheadline,
            }));
            showToast('AI bio generated!');
        } catch { showToast('Bio generation failed'); }
        finally { setGeneratingBio(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 size={32} className="animate-spin text-dark-600" /></div>;

    return (
        <div className="flex absolute inset-0 animate-slide-up bg-white">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-dark-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up">
                    <span className="text-sm font-medium">{toast}</span>
                    <button onClick={() => setToast(null)} className="text-white/60 hover:text-white"><X size={16} /></button>
                </div>
            )}

            {/* Settings Area */}
            <div className="w-full lg:w-[400px] flex flex-col bg-white border-r border-light-300 relative z-10">
                <div className="p-6 border-b border-light-200 bg-white sticky top-0 z-20">
                    <input type="text" value={portfolioTitle} onChange={e => setPortfolioTitle(e.target.value)} className="text-xl font-bold text-dark-900 bg-transparent border-none outline-none w-full" placeholder="Portfolio Title" />
                    <div className="flex items-center gap-2 text-sm text-dark-600">
                        <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        {isPublished ? 'Published' : 'Draft'}
                    </div>
                </div>

                <div className="flex p-4 border-b border-light-200">
                    {[{ id: 'content', label: 'Content' }, { id: 'design', label: 'Design' }, { id: 'settings', label: 'Settings' }].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-dark-900 text-white shadow-sm' : 'text-dark-600 hover:bg-light-100'}`}>{tab.label}</button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {activeTab === 'content' && (
                        <div className="space-y-6 animate-slide-up">
                            <div>
                                <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2"><LayoutTemplate size={18} /> Hero Section</h3>
                                <button onClick={handleGenerateBio} disabled={generatingBio} className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-lg w-max mb-3">
                                    {generatingBio ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {generatingBio ? 'Generating...' : '✨ AI Generate Bio'}
                                </button>
                                <div className="space-y-4">
                                    <div><label className="block text-xs font-semibold text-dark-600 mb-1">Headline</label><input type="text" className="input-field py-2 text-sm" value={config.headline} onChange={e => setConfig(p => ({ ...p, headline: e.target.value }))} placeholder="Hi, I'm Alex. I build modern web apps." /></div>
                                    <div><label className="block text-xs font-semibold text-dark-600 mb-1">Sub-headline</label><textarea className="input-field py-2 text-sm min-h-[80px]" value={config.subheadline} onChange={e => setConfig(p => ({ ...p, subheadline: e.target.value }))} placeholder="Describe what you specialise in..." /></div>
                                </div>
                            </div>
                            <div className="border-t border-light-200 pt-6">
                                <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2"><Code2 size={18} /> Projects</h3>
                                <div className="space-y-3">
                                    {config.projects.map((proj, idx) => (
                                        <div key={idx} className="p-3 rounded-xl border border-light-300 bg-white space-y-2 relative">
                                            <button onClick={() => removeProject(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                            <input type="text" className="input-field py-1.5 text-sm" value={proj.name} onChange={e => { const p = [...config.projects]; p[idx] = { ...p[idx], name: e.target.value }; setConfig(prev => ({ ...prev, projects: p })); }} placeholder="Project Name" />
                                            <input type="text" className="input-field py-1.5 text-sm" value={proj.tech} onChange={e => { const p = [...config.projects]; p[idx] = { ...p[idx], tech: e.target.value }; setConfig(prev => ({ ...prev, projects: p })); }} placeholder="React • Next.js • Tailwind" />
                                        </div>
                                    ))}
                                    <button onClick={addProject} className="w-full py-3 text-sm font-semibold text-dark-900 bg-light-200 hover:bg-light-300 rounded-xl transition-colors border border-dashed border-dark-600"><Plus size={14} className="inline mr-1" /> Add New Project</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'design' && (
                        <div className="animate-slide-up space-y-6">
                            {/* Accent Color */}
                            <div>
                                <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2"><Palette size={18} /> Accent Color</h3>
                                <div className="grid grid-cols-4 gap-3">
                                    {ACCENT_COLORS.map(c => (
                                        <button key={c.value} onClick={() => setConfig(p => ({ ...p, accentColor: c.value }))} className={`h-10 rounded-xl border-2 transition-all ${config.accentColor === c.value ? 'border-dark-900 scale-105 shadow-md' : 'border-transparent hover:scale-105'}`} style={{ background: c.value }} title={c.name} />
                                    ))}
                                </div>
                            </div>
                            {/* Font Family */}
                            <div>
                                <h3 className="font-semibold text-dark-900 mb-3 flex items-center gap-2"><Type size={18} /> Font Family</h3>
                                <div className="space-y-2">
                                    {FONTS.map(f => (
                                        <button key={f} onClick={() => setConfig(p => ({ ...p, fontFamily: f }))} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${config.fontFamily === f ? 'bg-dark-900 text-white border-dark-900' : 'bg-white text-dark-600 border-light-300 hover:bg-light-100'}`}>{f}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Dark Mode Toggle */}
                            <div className="flex items-center justify-between p-4 border border-light-200 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-dark-900 text-sm">Dark Mode</h4>
                                    <p className="text-xs text-dark-600">Use a dark background for the portfolio</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={config.darkMode} onChange={e => setConfig(p => ({ ...p, darkMode: e.target.checked }))} />
                                    <div className="w-11 h-6 bg-light-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dark-900"></div>
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="animate-slide-up space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-dark-600 mb-1">Subdomain</label>
                                <div className="flex items-center gap-1">
                                    <input type="text" className="input-field py-2 text-sm flex-1" value={config.subdomain} onChange={e => setConfig(p => ({ ...p, subdomain: e.target.value }))} placeholder="yourname" />
                                    <span className="text-sm text-dark-600 shrink-0">.portfolify.ai</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-light-200 bg-white flex gap-3">
                    <button className="btn-secondary py-3 px-4 flex-1 gap-2 flex items-center justify-center" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
                        {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
                    </button>
                    <button className="btn-primary py-3 px-4 flex-1 gap-2" onClick={handlePublish}>
                        <Globe size={16} /> {isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Live Preview */}
            <div className="hidden lg:flex w-[calc(100%-400px)] bg-light-300 flex-col relative items-center justify-center p-8">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 flex items-center gap-4 shadow-nav border border-light-300 z-10">
                    <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-full transition-colors ${previewMode === 'desktop' ? 'text-dark-900 bg-light-200' : 'text-dark-600 hover:bg-light-200 hover:text-dark-900'}`}><Monitor size={18} /></button>
                    <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-full transition-colors ${previewMode === 'mobile' ? 'text-dark-900 bg-light-200' : 'text-dark-600 hover:bg-light-200 hover:text-dark-900'}`}><Smartphone size={18} /></button>
                    <div className="w-px h-6 bg-light-300 mx-2"></div>
                    <button onClick={handleFullPreview} className="text-sm font-semibold flex items-center gap-2 text-dark-600 hover:text-dark-900"><Eye size={16} /> Full Preview</button>
                </div>

                <div className={`${previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'} h-[80%] bg-white rounded-t-xl rounded-b-lg shadow-2xl border border-light-400 overflow-hidden flex flex-col transition-all duration-500`}>
                    <div className="h-10 bg-light-200 border-b border-light-300 flex items-center px-4 gap-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                        </div>
                        <div className="flex-1 bg-white rounded-md h-6 border border-light-300 flex items-center justify-center">
                            <span className="text-[10px] font-medium text-dark-600 flex items-center gap-1"><Globe size={10} /> {config.subdomain || 'yourname'}.portfolify.ai</span>
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto ${config.darkMode ? 'bg-dark-900 text-white' : 'bg-white text-dark-900'}`} style={{ fontFamily: `'${config.fontFamily}', sans-serif` }}>
                        <nav className="p-8 flex justify-between items-center text-sm font-medium">
                            <div className="font-bold text-xl tracking-tighter">{portfolioTitle}.</div>
                            <div className={`flex gap-6 ${config.darkMode ? 'text-light-400' : 'text-dark-600'}`}>
                                <span className="hover:opacity-100 cursor-pointer opacity-70">Work</span>
                                <span className="hover:opacity-100 cursor-pointer opacity-70">About</span>
                                <span className="hover:opacity-100 cursor-pointer opacity-70">Contact</span>
                            </div>
                        </nav>

                        <header className={`px-8 py-20 ${previewMode === 'mobile' ? 'py-12' : ''} max-w-2xl`}>
                            <h1 className={`${previewMode === 'mobile' ? 'text-3xl' : 'text-5xl md:text-6xl'} font-extrabold tracking-tight leading-tight mb-6`}>{config.headline || 'Your Headline Here'}</h1>
                            <p className={`${previewMode === 'mobile' ? 'text-base' : 'text-xl'} mb-10 leading-relaxed font-normal opacity-60`}>{config.subheadline || 'Add a sub-headline describing what you do.'}</p>
                            <button className="px-6 py-3 rounded-full font-bold text-sm tracking-wide text-white transition-colors hover:opacity-90" style={{ background: config.accentColor }}>View Resume</button>
                        </header>

                        {config.projects.length > 0 && (
                            <section className={`px-8 py-12 rounded-t-[3rem] ${config.darkMode ? 'bg-dark-800' : 'bg-light-200'}`}>
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><CheckCircle2 size={24} style={{ color: config.accentColor }} /> Featured Work</h2>
                                <div className={`grid ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
                                    {config.projects.map((proj, idx) => (
                                        <div key={idx} className={`${config.darkMode ? 'bg-dark-700/50 border-dark-600 hover:border-light-400' : 'bg-white border-light-300 hover:border-dark-600'} border rounded-3xl h-64 p-6 transition-colors group cursor-pointer`}>
                                            <div className={`w-full h-32 ${config.darkMode ? 'bg-dark-900' : 'bg-light-200'} rounded-xl mb-4 overflow-hidden relative`}>
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:scale-105 transition-transform duration-500"></div>
                                            </div>
                                            <h3 className="font-bold text-lg mb-1">{proj.name || 'Project Name'}</h3>
                                            <p className="text-sm opacity-60">{proj.tech || 'Technologies'}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioBuilder;
