import React from 'react';

export const Button = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseStyles = 'px-6 py-2.5 rounded-xl font-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2';
    const variants = {
        primary: 'money-gradient text-white shadow-lg shadow-money/20 hover:shadow-money/30 border-none',
        secondary: 'bg-trust text-white hover:bg-trust-dark shadow-sm border-none',
        outline: 'border-2 border-trust/10 text-trust hover:bg-slate-50',
        ghost: 'text-slate-500 hover:bg-slate-50 hover:text-trust'
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const Input = ({ label, icon, className = '', ...props }) => (
    <div className="flex flex-col gap-2 w-full text-trust">
        {label && <label className="text-sm font-bold text-trust ml-1">{label}</label>}
        <div className="relative flex items-center">
            {icon && (
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-money transition-colors pointer-events-none z-10">
                    {React.cloneElement(icon, { size: 20 })}
                </div>
            )}
            <input
                className={`w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-money/10 focus:border-money focus:outline-none transition-all placeholder:text-slate-300 font-bold ${icon ? 'pl-14' : ''} ${className}`}
                {...props}
            />
        </div>
    </div>
);

export const Select = ({ label, icon, children, className = '', ...props }) => (
    <div className="flex flex-col gap-2 w-full text-trust font-bold">
        {label && <label className="text-sm font-bold text-trust ml-1">{label}</label>}
        <div className="relative flex items-center">
            {icon && (
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-money transition-colors pointer-events-none z-10">
                    {React.cloneElement(icon, { size: 20 })}
                </div>
            )}
            <select
                className={`w-full pl-14 pr-10 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-money/10 focus:border-money focus:outline-none transition-all appearance-none cursor-pointer ${className}`}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
        </div>
    </div>
);

export const Card = ({ children, className = '' }) => (
    <div className={`bg-white p-8 rounded-[2rem] shadow-xl border border-slate-50 ${className}`}>
        {children}
    </div>
);
