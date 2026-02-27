const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let res: Response;
    try {
        res = await fetch(`${API_BASE}${endpoint}`, {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
    } catch {
        throw new Error('Unable to connect to the server. Please ensure the backend is running.');
    }

    if (!res.ok) {
        let detail = `Request failed (${res.status})`;
        try {
            const errorBody = await res.json();
            if (typeof errorBody.detail === 'string') detail = errorBody.detail;
            else if (Array.isArray(errorBody.detail)) detail = errorBody.detail.map((d: any) => d.msg).join(', ');
        } catch { /* ignore parse errors */ }
        throw new Error(detail);
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

// Auth
export const authApi = {
    signup: (data: { email: string; full_name: string; password: string }) =>
        request<{ access_token: string; user: any }>('/auth/signup', { method: 'POST', body: data }),

    login: (data: { email: string; password: string }) =>
        request<{ access_token: string; user: any }>('/auth/login', { method: 'POST', body: data }),

    googleLogin: (data: { token: string }) =>
        request<{ access_token: string; user: any }>('/auth/google', { method: 'POST', body: data }),

    me: () => request<any>('/auth/me'),

    updateProfile: (data: { full_name?: string; email?: string }) =>
        request<any>('/auth/me', { method: 'PATCH', body: data }),
};

// Resumes
export const resumeApi = {
    list: () => request<any[]>('/resumes'),
    create: (data: { title: string; content: any }) =>
        request<any>('/resumes', { method: 'POST', body: data }),
    get: (id: string) => request<any>(`/resumes/${id}`),
    update: (id: string, data: any) =>
        request<any>(`/resumes/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) =>
        request<void>(`/resumes/${id}`, { method: 'DELETE' }),
    aiSummary: (id: string, data: { job_title: string; experience_summary: string }) =>
        request<{ summary: string }>(`/resumes/${id}/ai-summary`, { method: 'POST', body: data }),
    enhanceBullet: (data: { bullet: string; job_title?: string; company?: string }) =>
        request<{ enhanced: string }>('/resumes/enhance-bullet', { method: 'POST', body: data }),
    suggestSkills: (data: { job_title: string; current_skills: string[]; experience_summary?: string }) =>
        request<{ skills: string[] }>('/resumes/suggest-skills', { method: 'POST', body: data }),
};

// Portfolios
export const portfolioApi = {
    list: () => request<any[]>('/portfolios'),
    create: (data: { title: string; config: any }) =>
        request<any>('/portfolios', { method: 'POST', body: data }),
    get: (id: string) => request<any>(`/portfolios/${id}`),
    update: (id: string, data: any) =>
        request<any>(`/portfolios/${id}`, { method: 'PUT', body: data }),
    delete: (id: string) =>
        request<void>(`/portfolios/${id}`, { method: 'DELETE' }),
    generateBio: (data: { name: string; title: string; skills: string[]; experience?: string }) =>
        request<{ tagline: string; bio: string }>('/portfolios/generate-bio', { method: 'POST', body: data }),
};

// Case Studies
export const caseStudyApi = {
    list: () => request<any[]>('/case-studies'),
    create: (data: { title: string; inputs: any }) =>
        request<any>('/case-studies', { method: 'POST', body: data }),
    generate: (id: string) =>
        request<any>(`/case-studies/${id}/generate`, { method: 'POST' }),
};

// JD Analyzer
export const jdAnalyzerApi = {
    analyze: (data: { job_description: string; resume_id: string }) =>
        request<any>('/jd-analyzer/analyze', { method: 'POST', body: data }),
};

// Recommendations
export const recommendationsApi = {
    get: () => request<any>('/recommendations'),
};

// Cover Letter
export const coverLetterApi = {
    generate: (data: { resume_id: string; job_description: string; company_name?: string }) =>
        request<{ cover_letter: string }>('/cover-letter/generate', { method: 'POST', body: data }),
};
