import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

declare global {
    interface Window { google: any; }
}

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signup, googleLogin, user } = useAuth();
    const googleBtnRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) navigate('/dashboard', { replace: true });
    }, [user, navigate]);

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
                text: 'signup_with',
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
            setError(err.message || 'Google signup failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }
        setLoading(true);
        try {
            await signup(email, name, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-light-200">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex w-1/2 bg-dark-900 flex-col justify-between p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-dark-700 rounded-full mix-blend-screen filter blur-[150px] opacity-40"></div>
                <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-dark-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>
                <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col h-full">
                    <Link to="/" className="flex items-center gap-2 mb-20 text-white/50 hover:text-white transition-colors w-max">
                        <ArrowLeft size={16} /> Back to homepage
                    </Link>
                    <div className="mt-auto mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-dark-700 bg-white/5 backdrop-blur-sm mb-6">
                            <Zap size={14} className="text-light-200 text-yellow-500 font-bold" />
                            <span className="text-xs font-medium text-light-200">Start for Free</span>
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight mb-6 leading-tight text-white">
                            Launch your career <br /> into overdrive.
                        </h2>
                        <p className="text-xl text-dark-600">
                            Join thousands of professionals landing their dream jobs with PortfolifyAI.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-1 w-8 bg-white rounded-full"></div>
                        <div className="h-1 w-2 bg-dark-700 rounded-full"></div>
                        <div className="h-1 w-2 bg-dark-700 rounded-full"></div>
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
                        <h1 className="text-3xl font-bold text-dark-900 mb-2">Create your account</h1>
                        <p className="text-dark-600">Already have an account? <Link to="/login" className="text-dark-900 font-semibold hover:underline">Log in</Link></p>
                    </div>

                    {/* Google Sign-In */}
                    <div ref={googleBtnRef} className="w-full flex items-center justify-center mb-6"></div>

                    <div className="mb-6 relative flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-light-300"></div></div>
                        <span className="relative z-10 bg-light-200 px-4 text-sm text-dark-600">or sign up with email</span>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">{error}</div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-800 mb-2">Full name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field py-3.5" placeholder="John Doe" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-800 mb-2">Email address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field py-3.5" placeholder="name@company.com" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-800 mb-2">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field py-3.5" placeholder="Create a password" required minLength={8} />
                            <p className="text-xs text-dark-600 mt-2">Must be at least 8 characters long.</p>
                        </div>
                        <button type="submit" className="btn-primary w-full py-4 mt-4 shadow-md flex items-center justify-center gap-2" disabled={loading}>
                            {loading ? <><Loader2 size={20} className="animate-spin" /> Creating account...</> : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-xs text-center text-dark-600 mt-8 leading-relaxed">
                        By creating an account, you agree to our <br />
                        <a href="#" className="underline hover:text-dark-900">Terms of Service</a> and <a href="#" className="underline hover:text-dark-900">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
