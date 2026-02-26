import React, { useState } from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen bg-[#020617]">
            {/* Backdrop: aparece apenas em telas pequenas quando o menu não está colapsado */}
            {!isSidebarCollapsed && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[40] md:hidden"
                    onClick={() => setIsSidebarCollapsed(true)}
                />
            )}

            <Sidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />

            <main className={`flex-1 transition-all duration-300 p-4 md:p-8 overflow-x-hidden ${isSidebarCollapsed ? 'ml-0 md:ml-20' : 'ml-0 md:ml-64'
                }`}>
                <div className="w-full animate-fade-in relative">
                    {/* Gatilho Mobile: aparece apenas quando o menu está colapsado em mobile */}
                    <div className="md:hidden mb-6 flex justify-start">
                        <button
                            onClick={() => setIsSidebarCollapsed(false)}
                            className="p-3 bg-slate-900/50 rounded-2xl border border-white/5 text-emerald-500 shadow-xl backdrop-blur-md"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
