import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBudget } from '../context/BudgetContext';
import { Button, Input, Card } from '../components/ui';
import { TrendingUp, Lock, AtSign, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import logo from '../assets/logo.png';
import '../styles/pages/Auth.css';
import { useUI } from '../context/UIContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const { login } = useBudget();
    const { startProcessing, stopProcessing } = useUI();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length !== 8) {
            setError('A palavra-passe deve ter exatamente 8 dígitos.');
            return;
        }
        startProcessing('Validando as suas credenciais de elite...');
        try {
            const res = await api.post('/auth/login', { username, password });
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login Error:', err);
            const backendError = err.response?.data?.error || err.response?.data?.message;
            setError(backendError || 'Credenciais inválidas ou erro de conexão com o servidor.');
        } finally {
            stopProcessing();
        }
    };

    return (
        <div className="auth-container hero-pattern">
            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-money transition-colors font-black text-sm uppercase tracking-widest z-50 bg-white/5 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
            >
                <ArrowLeft size={18} /> Voltar
            </Link>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="auth-card"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-money/30 overflow-hidden">
                        <img src={logo} alt="Real Balance Logo" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="auth-title">Bem-vindo</h2>
                    <p className="text-slate-500 font-bold">Acesse sua conta Real Balance</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-black border border-red-100 animate-in fade-in slide-in-from-top-2">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Input
                        label="Usuário"
                        type="text"
                        placeholder="@seu_usuario"
                        icon={<AtSign size={20} />}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <div className="relative">
                        <Input
                            label="Palavra-passe (8 dígitos)"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            icon={<Lock size={20} />}
                            maxLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-[52px] text-slate-400 hover:text-money transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-2 border-white/20 bg-white/5 checked:bg-money checked:border-money focus:ring-2 focus:ring-money/20 transition-all cursor-pointer"
                            />
                            <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Lembrar-se de mim</span>
                        </label>
                        <Link to="/recover" className="text-sm font-bold text-money hover:text-money-light transition-colors">
                            Recuperar conta
                        </Link>
                    </div>

                    <Button className="w-full py-4 text-lg font-black money-gradient rounded-2xl shadow-xl shadow-money/20 group border-none shimmer" type="submit">
                        Entrar na Conta <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>

                <p className="mt-10 text-center text-slate-500 font-bold">
                    Ainda não tem conta? <Link to="/register" className="text-money hover:text-money-dark transition-colors ml-1">Registe-se aqui</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
