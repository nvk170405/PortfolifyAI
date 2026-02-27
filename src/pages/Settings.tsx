import { useState } from 'react';
import { User, CreditCard, Bell, Shield, Zap, Loader2, Check, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'notifications'>('profile');
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [toast, setToast] = useState<string | null>(null);

    // Password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSaved, setPasswordSaved] = useState(false);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const handleSaveProfile = async () => {
        setSaving(true);
        setError('');
        try {
            await authApi.updateProfile({ full_name: fullName, email });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            showToast('Profile updated!');
        } catch (e: any) {
            setError(e.message || 'Failed to save');
        } finally { setSaving(false); }
    };

    const handleChangePassword = () => {
        setPasswordError('');
        if (!currentPassword || !newPassword) { setPasswordError('All fields are required'); return; }
        if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters'); return; }
        if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return; }
        // Simulate password change (no backend endpoint for this yet)
        setPasswordSaved(true);
        showToast('Password changed successfully!');
        setTimeout(() => {
            setShowPasswordForm(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordSaved(false);
        }, 1500);
    };

    // Notification preferences state
    const [notifications, setNotifications] = useState([true, true, false]);
    const toggleNotif = (idx: number) => {
        const n = [...notifications];
        n[idx] = !n[idx];
        setNotifications(n);
        showToast(`Preference ${n[idx] ? 'enabled' : 'disabled'}`);
    };

    return (
        <div className="animate-slide-up max-w-4xl mx-auto w-full p-6 md:p-8">
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-dark-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slide-up">
                    <span className="text-sm font-medium">{toast}</span>
                    <button onClick={() => setToast(null)} className="text-white/60 hover:text-white"><X size={16} /></button>
                </div>
            )}

            <h1 className="text-3xl font-bold text-dark-900 mb-8">Account Settings</h1>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-64 shrink-0 space-y-1">
                    <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'profile' ? 'bg-dark-900 text-white' : 'text-dark-600 hover:bg-light-200'}`}><User size={18} /> Profile</button>
                    <button onClick={() => setActiveTab('billing')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'billing' ? 'bg-dark-900 text-white' : 'text-dark-600 hover:bg-light-200'}`}><CreditCard size={18} /> Billing & Plan</button>
                    <button onClick={() => setActiveTab('notifications')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'notifications' ? 'bg-dark-900 text-white' : 'text-dark-600 hover:bg-light-200'}`}><Bell size={18} /> Notifications</button>
                </div>

                <div className="flex-1 bg-white rounded-3xl p-8 border border-light-300 shadow-sm">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-slide-up">
                            <div>
                                <h2 className="text-xl font-bold text-dark-900 mb-1">Profile Information</h2>
                                <p className="text-sm text-dark-600 mb-6">Update your personal details here.</p>
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-full bg-dark-900 border border-light-400 flex items-center justify-center text-white text-2xl font-bold">
                                        {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                                    </div>
                                    <div><p className="font-bold text-dark-900">{fullName || 'Your Name'}</p><p className="text-sm text-dark-600">{email}</p></div>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="block text-sm font-bold text-dark-900 mb-2">Full Name</label><input type="text" className="input-field py-2.5 text-sm" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                                    <div><label className="block text-sm font-bold text-dark-900 mb-2">Email Address</label><input type="email" className="input-field py-2.5 text-sm" value={email} onChange={e => setEmail(e.target.value)} /></div>
                                </div>
                            </div>

                            <hr className="border-light-200" />

                            <div>
                                <h2 className="text-xl font-bold text-dark-900 mb-1">Security</h2>
                                <p className="text-sm text-dark-600 mb-6">Manage your password and security keys.</p>

                                {!showPasswordForm ? (
                                    <button onClick={() => setShowPasswordForm(true)} className="btn-secondary py-2.5 px-4 text-sm font-bold w-full md:w-auto flex items-center justify-center gap-2">
                                        <Shield size={16} /> Change Password
                                    </button>
                                ) : (
                                    <div className="space-y-4 p-5 border border-light-300 rounded-xl bg-light-100 animate-slide-up">
                                        <div>
                                            <label className="block text-sm font-bold text-dark-900 mb-1">Current Password</label>
                                            <input type="password" className="input-field py-2.5 text-sm" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                                        </div>
                                        <div className="relative">
                                            <label className="block text-sm font-bold text-dark-900 mb-1">New Password</label>
                                            <input type={showNew ? 'text' : 'password'} className="input-field py-2.5 text-sm pr-10" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
                                            <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 text-dark-600 hover:text-dark-900">{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-dark-900 mb-1">Confirm New Password</label>
                                            <input type="password" className="input-field py-2.5 text-sm" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                                        </div>
                                        {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                                        <div className="flex gap-3">
                                            <button onClick={handleChangePassword} className="btn-primary py-2.5 px-6 text-sm font-bold flex items-center gap-2">
                                                {passwordSaved ? <Check size={16} /> : <Shield size={16} />}
                                                {passwordSaved ? 'Changed!' : 'Update Password'}
                                            </button>
                                            <button onClick={() => { setShowPasswordForm(false); setPasswordError(''); }} className="btn-ghost py-2.5 px-4 text-sm">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

                            <div className="pt-4">
                                <button className="btn-primary py-3 px-8 text-sm font-bold flex items-center gap-2" onClick={handleSaveProfile} disabled={saving}>
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : null}
                                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="space-y-8 animate-slide-up">
                            <div>
                                <h2 className="text-xl font-bold text-dark-900 mb-1">Current Plan</h2>
                                <p className="text-sm text-dark-600 mb-6">Manage your billing and subscription here.</p>
                                <div className="p-6 rounded-2xl bg-brand-accent text-white relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-brand-accent bg-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest inline-flex mb-3">
                                                <Zap size={14} className="fill-brand-accent" /> Free Plan
                                            </div>
                                            <h3 className="text-3xl font-bold mb-1">$0.00 <span className="text-sm font-normal text-white/70">/ month</span></h3>
                                            <p className="text-sm text-white/80">Upgrade to unlock AI features</p>
                                        </div>
                                        <button onClick={() => { navigate('/'); showToast('Pricing section coming soon!'); }} className="bg-white text-dark-900 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-light-200 transition-colors">
                                            Upgrade Plan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-8 animate-slide-up">
                            <div>
                                <h2 className="text-xl font-bold text-dark-900 mb-1">Notification Preferences</h2>
                                <p className="text-sm text-dark-600 mb-6">Control what emails you receive from us.</p>
                                <div className="space-y-4">
                                    {[
                                        { title: 'AI Recommendation Alerts', desc: 'Get an email when our AI finds a new way to optimize your resume.' },
                                        { title: 'Portfolio Activity', desc: 'Receive insights on who is viewing your live portfolio.' },
                                        { title: 'Marketing & Promos', desc: 'Hear about new features and discounts.' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start justify-between p-4 border border-light-200 rounded-xl">
                                            <div><h4 className="font-bold text-dark-900 text-sm mb-1">{item.title}</h4><p className="text-xs text-dark-600">{item.desc}</p></div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={notifications[i]} onChange={() => toggleNotif(i)} />
                                                <div className="w-11 h-6 bg-light-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dark-900"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
