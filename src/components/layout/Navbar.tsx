import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl transition-all duration-300">
                <nav className="bg-[#1A1A1A] p-2 pr-2.5 rounded-full flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-[#2E2E2E]">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105 pl-1">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A1A1A] font-bold text-xl shrink-0">
                            P
                        </div>
                        <span className="text-white font-bold tracking-wide pr-2">PortfolifyAI</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-6 px-6">
                        <a href="/#features" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">Features</a>
                        <Link to="/pricing" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">Pricing</Link>
                        <Link to="/login" className="text-gray-300 hover:text-white font-medium text-sm transition-colors">Login</Link>
                    </div>

                    {/* CTA Button */}
                    <Link to="/signup" className="hidden md:block">
                        <button className="bg-white text-[#1A1A1A] hover:bg-gray-100 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm">
                            Get Started
                        </button>
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </nav>
            </div>

            {/* Mobile Nav Menu */}
            {mobileMenuOpen && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#1A1A1A] rounded-3xl p-6 flex flex-col gap-4 shadow-2xl z-40 border border-[#2E2E2E] animate-slide-up">
                    <a href="/#features" onClick={() => setMobileMenuOpen(false)} className="py-2 text-white font-medium text-center hover:bg-white/5 rounded-xl transition-colors">Features</a>
                    <Link to="/pricing" className="py-2 text-white font-medium text-center hover:bg-white/5 rounded-xl transition-colors">Pricing</Link>
                    <Link to="/login" className="py-2 text-white font-medium text-center hover:bg-white/5 rounded-xl transition-colors">Login</Link>
                    <Link to="/signup" className="mt-2 text-center w-full block">
                        <button className="w-full bg-white text-[#1A1A1A] rounded-xl py-3 font-semibold">Get Started</button>
                    </Link>
                </div>
            )}
        </>
    );
};

export default Navbar;
