import React from 'react';

export const Button = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseStyles = 'px-6 py-2.5 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm';
    const variants = {
        primary: 'money-gradient text-white shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 border-none',
        secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-sm border border-white/5',
        outline: 'border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white',
        ghost: 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

export const Input = ({ label, icon, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>}
        <div className="relative flex items-center group">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none z-10">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
            )}
            <input
                className={`premium-input ${icon ? 'pl-11' : ''} ${className}`}
                {...props}
            />
        </div>
    </div>
);

export const Select = ({ label, icon, children, className = '', ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>}
        <div className="relative flex items-center group">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors pointer-events-none z-10">
                    {React.cloneElement(icon, { size: 18 })}
                </div>
            )}
            <select
                className={`premium-input ${icon ? 'pl-11' : ''} pr-10 appearance-none cursor-pointer ${className}`}
                {...props}
            >
                {children}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
        </div>
    </div>
);

export const Card = ({ children, className = '', ...props }) => (
    <div className={`glass-card p-6 rounded-2xl ${className}`} {...props}>
        {children}
    </div>
);
