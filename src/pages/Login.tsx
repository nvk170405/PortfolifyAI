import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

declare global {
    interface Window { google: any; }
}

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, googleLogin, user } = useAuth();
    const googleBtnRef = useRef<HTMLDivElement>(null);

    // If already logged in, redirect
    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

    // Initialize Google Sign-In button
    useEffect(() => {
        if (window.google && googleBtnRef.current) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                callback: handleGoogleResponse,
            });
            window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: 'outline',
                size: 'large',
                width: googleBtnRef.current.offsetWidth,
                text: 'continue_with',
            });
        }
    }, []);

    const handleGoogleResponse = async (response: any) => {
        setError('');
        setLoading(true);
        try {
            await googleLogin(response.credential);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Google login failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-light-200">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-black text-white flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-dark-600 rounded-full mix-blend-screen filter blur-[120px] opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-dark-800 rounded-full mix-blend-screen filter blur-[100px] opacity-50"></div>
                <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col h-full">
                    <Link to="/" className="flex items-center gap-2 mb-20 text-white/50 hover:text-white transition-colors w-max">
                        <ArrowLeft size={16} /> Back to homepage
                    </Link>
                    <div className="mt-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-dark-800 bg-dark-900/50 backdrop-blur-sm mb-6">
                            <Sparkles size={14} className="text-light-200" />
                            <span className="text-xs font-medium text-light-200">Welcome Back</span>
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
                            Pick up where you left off.
                        </h2>
                        <p className="text-xl text-dark-600">
                            Your generated resumes and portfolios are waiting for you.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2 text-dark-600 hover:text-dark-900 transition-colors">
                    <ArrowLeft size={16} /> Back
                </Link>
                <div className="w-full max-w-md animate-slide-up">
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 rounded-xl bg-dark-900 mx-auto flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-md">P</div>
                        <h1 className="text-3xl font-bold text-dark-900 mb-2">Log in to your account</h1>
                        <p className="text-dark-600">Don't have an account? <Link to="/signup" className="text-dark-900 font-semibold hover:underline">Sign up</Link></p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">{error}</div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-dark-800 mb-2">Email address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="name@company.com" required />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-dark-800">Password</label>
                                <a href="#" onClick={(e) => { e.preventDefault(); setError('Password reset is not available yet. Please contact support.'); }} className="text-sm text-dark-600 hover:text-dark-900">Forgot password?</a>
                            </div>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
                        </div>
                        <button type="submit" className="btn-primary w-full py-4 mt-2 shadow-md flex items-center justify-center gap-2" disabled={loading}>
                            {loading ? <><Loader2 size={20} className="animate-spin" /> Logging in...</> : 'Log In'}
                        </button>
                    </form>

                    <div className="mt-8 relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-light-300"></div></div>
                        <span className="relative z-10 bg-light-200 px-4 text-sm text-dark-600">or continue with</span>
                    </div>

                    <div className="mt-8">
                        <div ref={googleBtnRef} className="w-full flex items-center justify-center"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
