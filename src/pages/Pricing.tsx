import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import SectionWrapper from '../components/layout/SectionWrapper';

const Pricing = () => {
    const [isAnnual, setIsAnnual] = useState(true);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div className="bg-light-200 min-h-screen">
            <section className="pt-32 pb-20 text-center animate-slide-up">
                <h1 className="text-5xl md:text-6xl font-bold text-dark-900 mb-6">Simple, transparent pricing</h1>
                <p className="text-xl text-dark-600 max-w-2xl mx-auto mb-12">
                    Choose the plan that fits your career goals.
                    <br className="hidden md:block" /> No hidden fees. Cancel anytime.
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 mb-20">
                    <span className={`text-sm font-medium ${!isAnnual ? 'text-dark-900' : 'text-dark-600'}`}>Monthly</span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="w-16 h-8 bg-dark-900 rounded-full flex items-center p-1 transition-colors"
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${isAnnual ? 'translate-x-8' : ''}`}></div>
                    </button>
                    <span className={`text-sm font-medium ${isAnnual ? 'text-dark-900' : 'text-dark-600'}`}>
                        Annually <span className="text-xs bg-light-300 px-2 py-0.5 rounded-full ml-1">Save 20%</span>
                    </span>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left px-6">
                    {/* Free Plan */}
                    <div className="bg-white p-10 rounded-3xl border border-light-300 hover:border-dark-600 transition-colors shadow-sm flex flex-col">
                        <h3 className="text-xl font-semibold text-dark-900 mb-2">Free</h3>
                        <p className="text-dark-600 mb-6 h-12">Perfect for quick resume updates and testing the waters.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-bold text-dark-900">$0</span>
                            <span className="text-dark-600">/month</span>
                        </div>
                        <Link to="/signup" className="btn-secondary w-full mb-10">Get Started for Free</Link>
                        <div className="space-y-4 flex-grow">
                            <p className="font-medium text-dark-900 text-sm">Included features:</p>
                            {['1 AI-generated Resume', 'Basic 3 Templates', 'PDF Export with Watermark', 'Standard Support'].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 text-dark-800 text-sm">
                                    <CheckCircle2 size={18} className="text-dark-900 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-dark-900 p-10 rounded-3xl border border-dark-800 shadow-xl flex flex-col transform md:-translate-y-4 text-white relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-dark-900 px-4 py-1 rounded-full text-sm font-bold tracking-wide shadow-sm">RECOMMENDED</div>
                        <h3 className="text-xl font-semibold mb-2">Pro</h3>
                        <p className="text-dark-600 mb-6 text-light-400 h-12">Everything you need to land the job and build your brand.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-bold">${isAnnual ? '12' : '15'}</span>
                            <span className="text-light-400">/month</span>
                            {isAnnual && <p className="text-sm text-light-400 mt-2">Billed $144 yearly</p>}
                        </div>
                        <Link to="/signup" className="btn-primary bg-white text-dark-900 hover:bg-light-200 hover:text-dark-900 w-full mb-10">Go Pro</Link>
                        <div className="space-y-4 flex-grow">
                            <p className="font-medium text-white text-sm">Everything in Free, plus:</p>
                            {['Unlimited Resumes', 'Full Portfolio Builder', 'Custom Domain Hosting (.com)', 'Advanced AI Rewriting & JD Match', 'No Watermarks', 'Priority Support'].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm">
                                    <CheckCircle2 size={18} className="text-light-300 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white p-10 rounded-3xl border border-light-300 hover:border-dark-600 transition-colors shadow-sm flex flex-col">
                        <h3 className="text-xl font-semibold text-dark-900 mb-2">Enterprise</h3>
                        <p className="text-dark-600 mb-6 h-12">For bootcamp cohorts, universities, and teams.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-bold text-dark-900">${isAnnual ? '49' : '59'}</span>
                            <span className="text-dark-600">/seat/month</span>
                            {isAnnual && <p className="text-sm text-dark-600 mt-2">Billed $588 yearly</p>}
                        </div>
                        <Link to="/signup" className="btn-secondary w-full mb-10">Contact Sales</Link>
                        <div className="space-y-4 flex-grow">
                            <p className="font-medium text-dark-900 text-sm">Everything in Pro, plus:</p>
                            {['Team Analytics Dashboard', 'Bulk Account Creation', 'Custom Branding & Subdomains', 'API Access', 'SSO & Advanced Security', 'Dedicated Account Manager'].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 text-dark-800 text-sm">
                                    <CheckCircle2 size={18} className="text-dark-900 shrink-0" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <SectionWrapper className="bg-white rounded-t-[3rem] mt-12 pb-32">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-dark-900 mb-12 text-center">Frequently asked questions</h2>

                    <div className="space-y-6">
                        {[
                            { q: "Can I use my own domain for my portfolio?", a: "Yes, on the Pro and Enterprise plans you can connect any custom domain you own, or we can provide you with a free portfolify.io subdomain." },
                            { q: "How accurate is the AI JD matching?", a: "Our AI compares your experience with the job description across 50+ semantic points and typically improves ATS match rates by 40-60%. It highlights missing keywords and suggests how to naturally incorporate them." },
                            { q: "Can I cancel my subscription at any time?", a: "Yes. Your subscription will remain active until the end of your billing cycle, after which you will be downgraded to the Free tier. Your hosted portfolios will remain live for 30 days." },
                            { q: "What export formats are supported?", a: "Currently we support high-resolution PDF and HTML export for resumes, and one-click Vercel/Netlify deployment for portfolios. DOCX support is coming soon." }
                        ].map((faq, i) => (
                            <div key={i} className="border border-light-300 rounded-2xl p-6 hover:shadow-sm transition-shadow">
                                <div className="flex justify-between items-center cursor-pointer mb-2" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <h4 className="font-medium text-lg text-dark-900">{faq.q}</h4>
                                    <ChevronDown className={`text-dark-600 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                                </div>
                                {openFaq === i && (
                                    <p className="text-dark-600 pt-2 border-t border-light-200 mt-4 leading-relaxed animate-slide-up">{faq.a}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
};

export default Pricing;
