import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Globe,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    Bell,
    Briefcase,
    Search,
    Lightbulb,
    PenLine
} from 'lucide-react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Resumes', href: '/resume-builder', icon: FileText },
        { name: 'Portfolios', href: '/portfolio-builder', icon: Globe },
        { name: 'Case Studies', href: '/case-studies', icon: Briefcase },
        { name: 'JD Analyzer', href: '/jd-analyzer', icon: Search },
        { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
        { name: 'Cover Letter', href: '/cover-letter', icon: PenLine },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-light-200 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-dark-900/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-light-300 z-50 transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-light-200">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-dark-900 flex items-center justify-center text-white font-bold text-xl">
                            P
                        </div>
                        <span className="font-bold text-xl tracking-tight text-dark-900">PortfolifyAI</span>
                    </Link>
                    <button
                        className="ml-auto lg:hidden text-dark-600 hover:text-dark-900"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActive
                                    ? 'bg-dark-900 text-white shadow-md'
                                    : 'text-dark-600 hover:bg-light-200 hover:text-dark-900'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-white' : 'text-dark-600'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile / Logout footer */}
                <div className="p-4 border-t border-light-200">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-dark-600 hover:bg-light-200 hover:text-dark-900 rounded-xl transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white border-b border-light-300 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-dark-600 hover:text-dark-900"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-semibold text-dark-900 hidden sm:block">
                            {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 border-l border-light-200 pl-4">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-dark-600 hover:text-dark-900 rounded-full hover:bg-light-200 transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-light-300 py-3 z-50 animate-slide-up">
                                    <h3 className="px-4 pb-2 font-bold text-dark-900 border-b border-light-200 text-sm">Notifications</h3>
                                    <div className="p-4 text-center text-sm text-dark-600">
                                        No new notifications
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-dark-900 flex items-center justify-center text-white font-bold text-sm">
                                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-sm font-medium text-dark-900 hidden md:block">{user?.full_name || 'User'}</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col relative bg-light-200">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
