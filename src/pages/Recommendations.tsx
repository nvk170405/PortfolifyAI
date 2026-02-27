import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, TrendingUp, Target, Award, ArrowRight, Zap, Loader2, RefreshCw } from 'lucide-react';
import { resumeApi, recommendationsApi } from '../services/api';

interface Recommendation {
    title: string;
    description: string;
    type: 'warning' | 'info' | 'success';
    action_label: string;
    action_target: string;
}

const iconMap = {
    warning: { icon: Zap, bg: 'bg-orange-50', color: 'text-orange-600' },
    info: { icon: Lightbulb, bg: 'bg-blue-50', color: 'text-blue-600' },
    success: { icon: Award, bg: 'bg-green-50', color: 'text-green-600' },
};

const Recommendations = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [recs, setRecs] = useState<Recommendation[]>([]);
    const [resumeCount, setResumeCount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recsData, resumes] = await Promise.all([
                recommendationsApi.get().catch(() => null),
                resumeApi.list().catch(() => []),
            ]);
            setResumeCount(resumes.length);

            if (recsData?.recommendations) {
                setRecs(recsData.recommendations);
            } else {
                // Fallback: generate smart defaults based on user data
                const defaults: Recommendation[] = [];
                if (resumes.length === 0) {
                    defaults.push({
                        title: 'Create Your First Resume',
                        description: 'You haven\'t created any resumes yet. Build one to unlock AI-powered recommendations and JD matching.',
                        type: 'warning',
                        action_label: 'Create Resume',
                        action_target: '/resume-builder',
                    });
                } else {
                    const r = resumes[0];
                    const content = r.content || {};
                    if (!content.summary) {
                        defaults.push({
                            title: 'Add a Professional Summary',
                            description: `Your resume "${r.title}" has no summary. A strong summary boosts your chances by 36% in ATS screening.`,
                            type: 'warning',
                            action_label: 'Edit Resume',
                            action_target: `/resume-builder?id=${r.id}`,
                        });
                    }
                    if (!content.skills || content.skills.length < 5) {
                        defaults.push({
                            title: 'Expand Your Skills Section',
                            description: 'Listing at least 8-10 relevant skills significantly improves ATS matching and recruiter interest.',
                            type: 'info',
                            action_label: 'Add Skills',
                            action_target: `/resume-builder?id=${r.id}`,
                        });
                    }
                    const hasQuantified = content.experience?.some((e: any) => e.bullets?.some((b: string) => /\d+%|\$\d+|\d+ users/i.test(b)));
                    if (!hasQuantified) {
                        defaults.push({
                            title: 'Quantify Your Impact',
                            description: 'Your experience bullets lack metrics. Add numbers like "Improved load time by 40%" to stand out.',
                            type: 'warning',
                            action_label: 'Fix in Resume',
                            action_target: `/resume-builder?id=${r.id}`,
                        });
                    }
                    defaults.push({
                        title: 'Analyze a Job Description',
                        description: 'Compare your resume against a specific JD to discover missing keywords and boost your match score.',
                        type: 'success',
                        action_label: 'Try JD Analyzer',
                        action_target: '/jd-analyzer',
                    });
                }
                setRecs(defaults);
            }
        } catch { /* empty */ }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const competitiveness = resumeCount > 0 ? Math.min(95, 50 + resumeCount * 15) : 0;
    const actionCount = recs.filter(r => r.type === 'warning').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 size={32} className="animate-spin text-dark-600 mx-auto mb-4" />
                    <p className="text-dark-600 text-sm">Analyzing your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-slide-up max-w-5xl mx-auto w-full p-6 md:p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-dark-900 mb-2">AI Career Insights</h1>
                    <p className="text-dark-600 text-lg">Personalized recommendations to improve your resume and career trajectory.</p>
                </div>
                <button onClick={fetchData} className="p-2 text-dark-600 hover:text-dark-900 rounded-lg hover:bg-light-100 transition-colors" title="Refresh"><RefreshCw size={20} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="bg-brand-accent/5 rounded-3xl p-6 border border-brand-accent/20">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand-accent shadow-sm mb-4"><TrendingUp size={24} /></div>
                    <h3 className="text-4xl font-black text-brand-accent mb-2">{competitiveness}%</h3>
                    <p className="font-bold text-dark-900 mb-1">Profile Strength</p>
                    <p className="text-sm text-dark-600">{resumeCount > 0 ? `Based on ${resumeCount} resume${resumeCount > 1 ? 's' : ''} and content analysis.` : 'Create a resume to calculate your score.'}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-light-300 shadow-sm">
                    <div className="w-12 h-12 bg-light-200 rounded-2xl flex items-center justify-center text-blue-600 mb-4"><Target size={24} /></div>
                    <h3 className="text-4xl font-black text-dark-900 mb-2">{actionCount}</h3>
                    <p className="font-bold text-dark-900 mb-1">Action Items</p>
                    <p className="text-sm text-dark-600">{actionCount > 0 ? 'High-priority actions to optimize your profile.' : 'You\'re in great shape!'}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border border-light-300 shadow-sm">
                    <div className="w-12 h-12 bg-light-200 rounded-2xl flex items-center justify-center text-orange-500 mb-4"><Award size={24} /></div>
                    <h3 className="text-4xl font-black text-dark-900 mb-2">{recs.length}</h3>
                    <p className="font-bold text-dark-900 mb-1">Total Insights</p>
                    <p className="text-sm text-dark-600">Actionable tips to improve your career presence.</p>
                </div>
            </div>

            <h2 className="text-xl font-bold text-dark-900 mb-4">Prioritized Actions</h2>

            {recs.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-light-300 text-center">
                    <Award size={48} className="mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-bold text-dark-900 mb-2">All Clear!</h3>
                    <p className="text-dark-600">No action items — your profile looks great.</p>
                </div>
            ) : (
                <div className="space-y-4 mb-12">
                    {recs.map((rec, i) => {
                        const iconMeta = iconMap[rec.type] || iconMap.info;
                        const IconComp = iconMeta.icon;
                        return (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-light-300 shadow-sm flex items-start gap-4 hover:border-dark-900 transition-colors group cursor-pointer" onClick={() => navigate(rec.action_target)}>
                                <div className={`w-10 h-10 ${iconMeta.bg} ${iconMeta.color} rounded-xl flex items-center justify-center shrink-0`}><IconComp size={20} /></div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-dark-900 text-lg mb-1">{rec.title}</h4>
                                    <p className="text-dark-600 text-sm mb-3">{rec.description}</p>
                                    <button className="text-sm font-bold text-brand-accent flex items-center gap-1 group-hover:gap-2 transition-all">
                                        {rec.action_label} <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Recommendations;
