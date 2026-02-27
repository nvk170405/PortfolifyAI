import { useState, useEffect } from 'react';
import { Search, Briefcase, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { resumeApi, jdAnalyzerApi } from '../services/api';

interface AnalysisResult {
    match_score: number;
    matched_skills: string[];
    missing_skills: string[];
    suggestions: string[];
}

const JDAnalyzer = () => {
    const [jd, setJd] = useState('');
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        resumeApi.list().then(data => {
            setResumes(data);
            if (data.length > 0) setSelectedResume(data[0].id);
        }).catch(() => { /* ignore */ });
    }, []);

    const handleAnalyze = async () => {
        if (!jd.trim() || !selectedResume) return;
        setAnalyzing(true);
        setError('');
        try {
            const data = await jdAnalyzerApi.analyze({ job_description: jd, resume_id: selectedResume });
            setResult(data);
        } catch (e: any) {
            setError(e.message || 'Analysis failed');
        } finally {
            setAnalyzing(false);
        }
    };

    const scoreOffset = result ? 251 - (251 * result.match_score / 100) : 251;

    return (
        <div className="flex absolute inset-0 animate-slide-up bg-white">
            {/* Left Pane: Input */}
            <div className="w-full lg:w-1/2 flex flex-col bg-white border-r border-light-300 relative z-10">
                <div className="p-6 border-b border-light-200">
                    <h2 className="text-xl font-bold text-dark-900">Job Description Analyzer</h2>
                    <p className="text-sm text-dark-600">Compare a JD against your resumes to find the best match and missing keywords.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-dark-900 mb-2">Paste Job Description</label>
                        <textarea
                            className="w-full bg-light-100 border border-light-300 rounded-xl p-4 min-h-[300px] text-sm focus:ring-2 focus:ring-dark-900 focus:border-dark-900 outline-none resize-y"
                            placeholder="Paste the target job description here..."
                            value={jd}
                            onChange={e => setJd(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-dark-900 mb-2">Select Resume To Compare</label>
                        {resumes.length === 0 ? (
                            <p className="text-sm text-dark-600 p-3 bg-light-100 rounded-lg">No resumes yet. Create one in the Resume Builder first.</p>
                        ) : (
                            <select className="w-full input-field py-3 text-sm font-medium" value={selectedResume} onChange={e => setSelectedResume(e.target.value)}>
                                {resumes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                            </select>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

                    <button
                        className="btn-primary w-full py-4 text-base gap-2 mt-4 shadow-xl shadow-brand-accent/20 flex items-center justify-center"
                        onClick={handleAnalyze}
                        disabled={analyzing || !jd.trim() || !selectedResume}
                    >
                        {analyzing ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        {analyzing ? 'Analyzing...' : 'Analyze Match'}
                    </button>
                </div>
            </div>

            {/* Right Pane: Results */}
            <div className="hidden lg:flex w-1/2 bg-light-200 flex-col relative">
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    {!result ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Search size={48} className="mx-auto mb-4 text-light-400" />
                                <h3 className="text-lg font-bold text-dark-900 mb-2">No Analysis Yet</h3>
                                <p className="text-sm text-dark-600">Paste a job description and select a resume, then click "Analyze Match".</p>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
                            {/* Score */}
                            <div className="bg-white rounded-3xl p-8 border border-light-300 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-dark-900 mb-1">Match Score</h3>
                                    <p className="text-sm text-dark-600">Based on keyword extraction and semantic similarity.</p>
                                </div>
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="transform -rotate-90 w-24 h-24">
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-light-200" />
                                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251" strokeDashoffset={scoreOffset} className={result.match_score >= 70 ? 'text-green-500' : result.match_score >= 40 ? 'text-yellow-500' : 'text-red-500'} />
                                    </svg>
                                    <span className="absolute text-2xl font-black text-dark-900">{result.match_score}%</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl p-6 border border-light-300 shadow-sm">
                                    <h4 className="font-bold text-dark-900 flex items-center gap-2 mb-4"><CheckCircle2 size={18} className="text-green-500" /> Matched Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.matched_skills.length > 0 ? result.matched_skills.map(k => (
                                            <span key={k} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">{k}</span>
                                        )) : <p className="text-sm text-dark-600">None found</p>}
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border border-light-300 shadow-sm">
                                    <h4 className="font-bold text-dark-900 flex items-center gap-2 mb-4"><AlertCircle size={18} className="text-red-500" /> Missing Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missing_skills.length > 0 ? result.missing_skills.map(k => (
                                            <span key={k} className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200">{k}</span>
                                        )) : <p className="text-sm text-dark-600">None — great match!</p>}
                                    </div>
                                </div>
                            </div>

                            {result.suggestions.length > 0 && (
                                <div className="bg-white rounded-3xl p-6 border border-light-300 shadow-sm">
                                    <h4 className="font-bold text-dark-900 mb-4">Suggested Improvements</h4>
                                    <ul className="space-y-4">
                                        {result.suggestions.map((s, i) => (
                                            <li key={i} className="flex gap-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Briefcase size={16} /></div>
                                                <p className="text-sm text-dark-800">{s}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JDAnalyzer;
