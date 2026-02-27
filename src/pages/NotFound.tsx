import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const NotFound = () => {
    return (
        <div className="flex flex-col min-h-screen bg-light-200">
            <Navbar />
            <main className="grow flex items-center justify-center p-6 mt-24 w-full">
                <div className="max-w-md w-full text-center animate-slide-up bg-white p-12 rounded-3xl border border-light-300 shadow-sm">
                    <div className="w-20 h-20 bg-dark-900 rounded-3xl mx-auto flex items-center justify-center text-white mb-8 shadow-md">
                        <FileQuestion size={40} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-dark-900 mb-2">404</h1>
                    <h2 className="text-xl font-bold text-dark-900 mb-4">Page not found</h2>
                    <p className="text-dark-600 mb-8">
                        We can't seem to find the page you're looking for. It might have been moved or deleted.
                    </p>
                    <Link to="/" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                        <ArrowLeft size={18} /> Back to Homepage
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default NotFound;
