import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Globe, Plus, MoreVertical, Loader2, FolderOpen, Trash2, Pencil, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { resumeApi, portfolioApi } from '../services/api';

interface DocItem {
    id: string;
    title: string;
    type: 'resume' | 'portfolio';
    updated_at: string;
    is_published?: boolean;
}

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const firstName = user?.full_name?.split(' ')[0] || 'there';
    const [docs, setDocs] = useState<DocItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const [resumes, portfolios] = await Promise.all([resumeApi.list(), portfolioApi.list()]);
                const items: DocItem[] = [
                    ...resumes.map((r: any) => ({ id: r.id, title: r.title, type: 'resume' as const, updated_at: r.updated_at })),
                    ...portfolios.map((p: any) => ({ id: p.id, title: p.title, type: 'portfolio' as const, updated_at: p.updated_at, is_published: p.is_published })),
                ];
                items.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                setDocs(items.slice(0, 6));
            } catch { /* empty state */ }
            finally { setLoading(false); }
        };
        fetchDocs();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleDelete = async (doc: DocItem) => {
        setDeleting(doc.id);
        try {
            if (doc.type === 'resume') await resumeApi.delete(doc.id);
            else await portfolioApi.delete(doc.id);
            setDocs(prev => prev.filter(d => d.id !== doc.id));
            showToast(`"${doc.title}" deleted`);
        } catch { showToast('Failed to delete'); }
        finally { setDeleting(null); setMenuOpen(null); }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <div className="animate-slide-up p-6 md:p-8 max-w-6xl mx-auto w-full">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-dark-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up">
                    <span className="text-sm font-medium">{toast}</span>
                    <button onClick={() => setToast(null)} className="text-white/60 hover:text-white"><X size={16} /></button>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-dark-900 mb-2">Welcome back, {firstName}!</h1>
                <p className="text-dark-600 text-lg">Here's an overview of your career assets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Link to="/resume-builder" className="group glass-card p-6 border-2 border-transparent hover:border-dark-900 transition-all flex items-center justify-between bg-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-dark-900 rounded-2xl flex items-center justify-center text-white mb-4"><FileText size={24} /></div>
                        <h3 className="text-xl font-bold text-dark-900 mb-1">Create New Resume</h3>
                        <p className="text-dark-600">Tailor a resume for a specific job description instantly.</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-light-200 flex items-center justify-center text-dark-900 group-hover:bg-dark-900 group-hover:text-white transition-colors relative z-10 shrink-0"><Plus size={24} /></div>
                    <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-light-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 blur-2xl"></div>
                </Link>
                <Link to="/portfolio-builder" className="group glass-card p-6 border-2 border-transparent hover:border-dark-900 transition-all flex items-center justify-between bg-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-dark-900 rounded-2xl flex items-center justify-center text-white mb-4"><Globe size={24} /></div>
                        <h3 className="text-xl font-bold text-dark-900 mb-1">Build Portfolio</h3>
                        <p className="text-dark-600">Generate a live case-study website from your projects.</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-light-200 flex items-center justify-center text-dark-900 group-hover:bg-dark-900 group-hover:text-white transition-colors relative z-10 shrink-0"><Plus size={24} /></div>
                    <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-light-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 blur-2xl"></div>
                </Link>
            </div>

            <div>
                <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-dark-900">Recent Documents</h2></div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl p-6 border border-light-300 animate-pulse">
                                <div className="w-12 h-12 bg-light-200 rounded-2xl mb-6"></div>
                                <div className="h-5 bg-light-200 rounded-lg w-3/4 mb-3"></div>
                                <div className="h-4 bg-light-200 rounded-lg w-1/2 mb-4"></div>
                                <div className="h-6 bg-light-200 rounded-md w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : docs.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-light-300 text-center">
                        <div className="w-16 h-16 bg-light-200 rounded-2xl flex items-center justify-center text-dark-600 mx-auto mb-4"><FolderOpen size={32} /></div>
                        <h3 className="text-lg font-bold text-dark-900 mb-2">No documents yet</h3>
                        <p className="text-dark-600 mb-6">Create your first resume or portfolio to get started.</p>
                        <div className="flex items-center justify-center gap-4">
                            <Link to="/resume-builder" className="btn-primary px-6 py-3 text-sm">New Resume</Link>
                            <Link to="/portfolio-builder" className="btn-secondary px-6 py-3 text-sm">New Portfolio</Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {docs.map(doc => (
                            <div key={doc.id} className="bg-white rounded-3xl p-6 border border-light-300 shadow-sm hover:shadow-card transition-shadow relative group">
                                {/* Click area */}
                                <div className="cursor-pointer" onClick={() => navigate(doc.type === 'resume' ? `/resume-builder?id=${doc.id}` : `/portfolio-builder?id=${doc.id}`)}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${doc.type === 'portfolio' ? 'bg-dark-900 text-white' : 'bg-light-200 text-dark-600'}`}>
                                        {doc.type === 'resume' ? <FileText size={24} /> : <Globe size={24} />}
                                    </div>
                                    <h3 className="font-semibold text-dark-900 text-lg mb-1 truncate pr-8">{doc.title}</h3>
                                    <p className="text-sm text-dark-600 mb-4">Last edited {timeAgo(doc.updated_at)}</p>
                                    <div className="flex items-center gap-2">
                                        {doc.type === 'portfolio' && doc.is_published && <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md">Live</span>}
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-light-200 text-dark-600 rounded-md">{doc.type === 'resume' ? 'Resume' : 'Website'}</span>
                                    </div>
                                </div>

                                {/* Menu Button */}
                                <div className="absolute top-4 right-4" ref={menuOpen === doc.id ? menuRef : null}>
                                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === doc.id ? null : doc.id); }} className="p-2 text-light-400 hover:text-dark-900 rounded-full hover:bg-light-100 transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreVertical size={20} />
                                    </button>
                                    {menuOpen === doc.id && (
                                        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-light-300 py-1 w-44 z-30 animate-slide-up">
                                            <button onClick={() => { setMenuOpen(null); navigate(doc.type === 'resume' ? `/resume-builder?id=${doc.id}` : `/portfolio-builder?id=${doc.id}`); }} className="w-full text-left px-4 py-2.5 text-sm text-dark-800 hover:bg-light-100 flex items-center gap-2">
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(doc)} disabled={deleting === doc.id} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                {deleting === doc.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                {deleting === doc.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
