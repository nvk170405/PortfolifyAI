import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layout, FileText, BarChart3, Target, Zap, CheckCircle2 } from 'lucide-react';
import SectionWrapper from '../components/layout/SectionWrapper';

const Landing = () => {
  return (
    <div className="bg-light-200">
      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background Blurs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-light-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gray-200 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-float delay-200"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-light-400 mb-8 shadow-sm">
            <Sparkles size={16} className="text-dark-600" />
            <span className="text-sm font-medium text-dark-800">AI-Powered Portfolio Builder</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-dark-900 mb-8 leading-[1.1]">
            Your Career Story <br className="hidden md:block" />
            <span className="text-dark-600">Built in Seconds.</span>
          </h1>

          <p className="text-xl md:text-2xl text-dark-600 max-w-3xl mx-auto mb-12">
            Automatically generate professional portfolios, resumes, and case studies using state-of-the-art AI. Stand out without the struggle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
              Get Started <ArrowRight size={20} />
            </Link>
            <a href="#features" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 text-center">
              See How It Works
            </a>
          </div>

          {/* Floating Hero UI Elements (Mockups) */}
          <div className="mt-20 relative h-[400px] md:h-[600px] w-full max-w-5xl mx-auto">
            {/* Main Mockup Center */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-2xl h-full bg-white rounded-[2rem] border border-light-400 shadow-2xl overflow-hidden animate-slide-up delay-200">
              <div className="h-12 border-b border-light-200 flex items-center px-6 gap-2 bg-light-100">
                <div className="w-3 h-3 rounded-full bg-light-400"></div>
                <div className="w-3 h-3 rounded-full bg-light-400"></div>
                <div className="w-3 h-3 rounded-full bg-light-400"></div>
              </div>
              <div className="flex items-center justify-center h-[calc(100%-3rem)] bg-[#F8FAFC] overflow-hidden">
                <img src="/education.svg" alt="Education Illustration" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Floating Glass Panels */}
            <div className="hidden md:block absolute left-0 top-1/4 w-64 glass-card p-4 animate-float delay-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-dark-900 rounded-full flex items-center justify-center text-white"><CheckCircle2 size={24} /></div>
                <div>
                  <div className="font-semibold text-dark-900">ATS Optimized</div>
                  <div className="text-sm text-dark-600">Score: 98/100</div>
                </div>
              </div>
            </div>

            <div className="hidden md:block absolute right-0 top-1/3 w-72 glass-card p-6 animate-float delay-300">
              <h4 className="font-semibold text-dark-900 mb-4">AI Recommendations</h4>
              <div className="space-y-3">
                <div className="h-3 bg-light-300 rounded w-full"></div>
                <div className="h-3 bg-light-300 rounded w-5/6"></div>
                <div className="h-3 bg-light-300 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Preview */}
      <SectionWrapper id="features" className="bg-white rounded-t-[3rem] -mt-8 relative z-20">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-6">Everything you need to land your next role</h2>
          <p className="text-xl text-dark-600">Stop wrestling with formatting and layout. Let our AI build perfect, recruiter-ready documents.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <FileText size={24} />, title: 'Smart Resume AI', desc: 'Transform your brain-dump into an ATS-friendly, highly targeted resume in seconds.' },
            { icon: <Layout size={24} />, title: '1-Click Portfolio', desc: 'Instantly generate a beautiful, responsive portfolio website hosted on a custom subdomain.' },
            { icon: <BarChart3 size={24} />, title: 'Case Study Generator', desc: 'Input raw project details and get compelling, structured case studies outlining your impact.' },
            { icon: <Target size={24} />, title: 'JD Analyzer', desc: 'Paste a job description and automatically tailor your resume to match the exact requirements.' },
            { icon: <Sparkles size={24} />, title: 'Smart Recs', desc: 'Receive real-time AI suggestions on how to improve bullet points and highlight key skills.' },
            { icon: <Zap size={24} />, title: 'Instant Export', desc: 'Download pixel-perfect PDFs or publish your live site instantly without touching code.' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-light-100 p-8 rounded-3xl border border-light-300 hover:shadow-card transition-all duration-300 group">
              <div className="w-14 h-14 bg-white rounded-2xl border border-light-300 flex items-center justify-center text-dark-900 mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-dark-900 mb-3">{feature.title}</h3>
              <p className="text-dark-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* 4. Pricing Preview */}
      <SectionWrapper id="pricing" className="bg-light-200">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-6">Simple, transparent pricing</h2>
          <p className="text-xl text-dark-600">Start for free, upgrade when you need more power.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white p-10 rounded-3xl border border-light-300 shadow-sm flex flex-col">
            <h3 className="text-xl font-semibold text-dark-900 mb-2">Free</h3>
            <p className="text-dark-600 mb-6">Perfect for quick updates.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-dark-900">$0</span>
              <span className="text-dark-600">/month</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['1 AI Resume', 'Basic Templates', 'PDF Export with Watermark'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-dark-800">
                  <CheckCircle2 size={18} className="text-dark-900" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="btn-secondary w-full">Get Started</Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-dark-900 p-10 rounded-3xl border border-dark-800 shadow-xl flex flex-col transform md:-translate-y-4 text-white relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-dark-900 px-4 py-1 rounded-full text-sm font-bold tracking-wide">RECOMMENDED</div>
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <p className="text-dark-600 mb-6 text-light-400">Everything you need to land the job.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold">$12</span>
              <span className="text-light-400">/month</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['Unlimited Resumes', 'Full Portfolio Builder', 'Advanced AI Rewriting', 'Custom Themes & Subdomain', 'No Watermark'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-light-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="btn-primary bg-white text-dark-900 hover:bg-light-200 hover:text-dark-900 w-full">Go Pro</Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white p-10 rounded-3xl border border-light-300 shadow-sm flex flex-col">
            <h3 className="text-xl font-semibold text-dark-900 mb-2">Enterprise</h3>
            <p className="text-dark-600 mb-6">For teams and organizations.</p>
            <div className="mb-8">
              <span className="text-5xl font-bold text-dark-900">$49</span>
              <span className="text-dark-600">/month</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['Everything in Pro', 'Team Usage & Analytics', 'Bulk Generation', 'API Access', 'Dedicated Support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-dark-800">
                  <CheckCircle2 size={18} className="text-dark-900" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="btn-secondary w-full">Contact Sales</Link>
          </div>
        </div>
      </SectionWrapper>

      {/* 5. Testimonials CTA */}
      <SectionWrapper className="bg-white text-center pb-32">
        <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-8 max-w-3xl mx-auto">Ready to build your ultimate portfolio?</h2>
        <p className="text-xl text-dark-600 mb-10 max-w-2xl mx-auto">Join thousands of professionals landing their dream jobs with PortfolifyAI.</p>
        <Link to="/signup" className="btn-primary inline-flex text-lg px-10 py-5">
          Start Building Free
        </Link>
      </SectionWrapper>
    </div>
  );
};

export default Landing;
