import React, { ReactNode } from 'react';

interface SectionWrapperProps {
    children: ReactNode;
    className?: string;
    id?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, className = '', id }) => {
    return (
        <section id={id} className={`py-24 md:py-32 overflow-hidden ${className}`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {children}
            </div>
        </section>
    );
};

export default SectionWrapper;
