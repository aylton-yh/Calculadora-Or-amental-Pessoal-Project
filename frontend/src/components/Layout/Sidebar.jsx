import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownLeft,
    User,
    Settings as SettingsIcon,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Wallet,
    BarChart3,
    Calculator
} from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import logo from '../../assets/logo.png';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const { user, logout } = useBudget();
    const location = useLocation();

    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Painel', path: '/dashboard' },
        { icon: <Wallet size={20} />, label: 'Minha Carteira', path: '/wallet' },
        { icon: <Calculator size={20} />, label: 'Calculadora', path: '/calculator' },
        { icon: <ArrowUpRight size={20} />, label: 'Receitas', path: '/income' },
        { icon: <ArrowDownLeft size={20} />, label: 'Despesas', path: '/expenses' },
        { icon: <BarChart3 size={20} />, label: 'Relatórios', path: '/reports' },
        { icon: <User size={20} />, label: 'Perfil', path: '/profile' },
        { icon: <SettingsIcon size={20} />, label: 'Definições', path: '/settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-white/5 transition-all duration-300 z-[50] flex flex-col 
            ${collapsed ? 'w-64 -translate-x-full md:translate-x-0 md:w-20' : 'w-64 translate-x-0'}
            `}
        >
            {/* Header */}
            <div className="p-6 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white/5 border border-white/10 p-1 backdrop-blur-sm">
                    <img src={logo} alt="RB" className="w-full h-full object-contain" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-black text-white tracking-tight">Real<span className="text-emerald-500">Balance</span></span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Premium Edition</span>
                    </div>
                )}
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-emerald-500 rounded-full hidden md:flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform active:scale-95 z-50 border-2 border-slate-900"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 px-3 mt-4 space-y-1 sidebar-scroll overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${isActive(item.path)
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                    >
                        <div className={`${isActive(item.path) ? 'text-white' : 'group-hover:text-emerald-500'} transition-colors`}>
                            {item.icon}
                        </div>
                        {!collapsed && (
                            <span className="text-sm font-bold tracking-wide">{item.label}</span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* User Profile Area */}
            <div className="p-4 border-t border-white/5">
                <div className={`flex items-center gap-4 p-2 rounded-xl transition-all ${collapsed ? 'justify-center' : 'bg-white/5'}`}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        {user?.photo ? (
                            <img
                                src={user.photo}
                                alt="U"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-emerald-500 font-extrabold text-sm">{user?.name?.[0] || 'U'}</span>
                        )}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{user?.nome_completo}</p>
                            <p className="text-[10px] text-slate-500 truncate">@{user?.nome_usuario || 'usuário'}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={logout}
                    className={`mt-4 w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm ${collapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={20} />
                    {!collapsed && <span>Sair da conta</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
