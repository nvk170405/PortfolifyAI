import { useState, useEffect } from 'react';
import { FileText, Sparkles, Loader2, Copy, Download, Check, X } from 'lucide-react';
import { resumeApi, coverLetterApi } from '../services/api';

const CoverLetter = () => {
    const [resumes, setResumes] = useState<any[]>([]);
    const [selectedResume, setSelectedResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    useEffect(() => {
        resumeApi.list().then(setResumes).catch(() => { });
    }, []);

    const handleGenerate = async () => {
        if (!selectedResume) { showToast('Select a resume first'); return; }
        if (!jobDescription.trim()) { showToast('Paste a job description'); return; }
        setGenerating(true);
        try {
            const result = await coverLetterApi.generate({
                resume_id: selectedResume,
                job_description: jobDescription,
                company_name: companyName,
            });
            setCoverLetter(result.cover_letter);
            showToast('Cover letter generated!');
        } catch (e: any) {
            showToast(e.message || 'Generation failed — check your API key');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExportPDF = () => {
        const w = window.open('', '_blank');
        if (!w) { showToast('Please allow popups'); return; }
        w.document.write(`
            <!DOCTYPE html><html><head><title>Cover Letter</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; padding: 60px; max-width: 800px; margin: 0 auto; line-height: 1.8; font-size: 14px; }
                p { margin-bottom: 16px; }
                @media print { body { padding: 0.75in; } @page { size: A4; margin: 0; } }
            </style></head><body>
            ${coverLetter.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')}
            </body></html>
        `);
        w.document.close();
        setTimeout(() => w.print(), 500);
    };

    return (
        <div className="flex absolute inset-0 animate-slide-up bg-white">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-dark-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up">
                    <span className="text-sm font-medium">{toast}</span>
                    <button onClick={() => setToast(null)} className="text-white/60 hover:text-white"><X size={16} /></button>
                </div>
            )}

            {/* Left: Inputs */}
            <div className="w-full lg:w-[400px] flex flex-col bg-white border-r border-light-300 relative z-10">
                <div className="p-6 border-b border-light-200 bg-white sticky top-0 z-20">
                    <h2 className="text-xl font-bold text-dark-900 flex items-center gap-2"><FileText size={20} /> AI Cover Letter</h2>
                    <p className="text-sm text-dark-600 mt-1">Generate a tailored cover letter from your resume + job description</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Resume Selector */}
                    <div>
                        <label className="block text-sm font-semibold text-dark-800 mb-2">Select Resume</label>
                        <select
                            value={selectedResume}
                            onChange={e => setSelectedResume(e.target.value)}
                            className="input-field py-3"
                        >
                            <option value="">Choose a resume...</option>
                            {resumes.map(r => (
                                <option key={r.id} value={r.id}>{r.title}</option>
                            ))}
                        </select>
                        {resumes.length === 0 && <p className="text-xs text-dark-600 mt-1">No resumes found. Create one first.</p>}
                    </div>

                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-semibold text-dark-800 mb-2">Company Name <span className="text-dark-600 font-normal">(optional)</span></label>
                        <input
                            type="text"
                            className="input-field py-3"
                            value={companyName}
                            onChange={e => setCompanyName(e.target.value)}
                            placeholder="Google, Amazon, etc."
                        />
                    </div>

                    {/* Job Description */}
                    <div>
                        <label className="block text-sm font-semibold text-dark-800 mb-2">Job Description</label>
                        <textarea
                            className="input-field py-3 min-h-[200px] resize-y text-sm"
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here..."
                        />
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-sm"
                    >
                        {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Cover Letter</>}
                    </button>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="hidden lg:flex flex-1 bg-light-200 flex-col relative">
                {coverLetter && (
                    <div className="h-16 flex items-center justify-end gap-2 px-6 bg-light-200 border-b border-light-300 absolute top-0 left-0 right-0 z-10">
                        <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-white border border-light-300 rounded-lg text-sm font-medium hover:bg-light-100 transition-colors shadow-sm text-dark-800">
                            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-white border border-light-300 rounded-lg text-sm font-medium hover:bg-light-100 transition-colors shadow-sm text-dark-800">
                            <Download size={16} /> Export PDF
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-12 pt-24 pb-12 flex justify-center items-start">
                    {coverLetter ? (
                        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-light-300 p-12 animate-slide-up">
                            <div className="prose prose-sm max-w-none text-dark-800 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", fontSize: '14px', lineHeight: '1.8' }}>
                                {coverLetter}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-dark-600 mt-32">
                            <div className="w-20 h-20 bg-light-300 rounded-3xl mx-auto flex items-center justify-center mb-6">
                                <FileText size={40} className="text-dark-600" />
                            </div>
                            <h3 className="text-xl font-bold text-dark-900 mb-2">Your cover letter will appear here</h3>
                            <p className="text-sm max-w-sm mx-auto">Select a resume, paste a job description, and click Generate to create a tailored cover letter powered by AI.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CoverLetter;
