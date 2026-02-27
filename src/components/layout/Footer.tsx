import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-dark-900 text-white pt-24 pb-12 rounded-t-[3rem] mt-24">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-dark-900 font-bold text-xl">
                                P
                            </div>
                            <span className="font-semibold text-xl tracking-tight text-white">PortfolifyAI</span>
                        </Link>
                        <p className="text-dark-600 mb-6 text-sm">
                            Empowering Every Step of Your Career with AI.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-dark-600">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium text-white mb-6">Resources</h4>
                        <ul className="space-y-4 text-sm text-dark-600">
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-dark-600">
                            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-dark-700/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-dark-600">
                    <p>© {new Date().getFullYear()} PortfolifyAI. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
