import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBudget } from '../context/BudgetContext';
import { Button, Input, Card } from '../components/ui';
import { Lock, AtSign, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import logo from '../assets/logo.png';
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
        startProcessing('Validando acesso seguro...');
        try {
            const res = await api.post('/auth/login', { nome_usuario: username, palavra_passe: password });
            console.log('Login Response:', res.data);
            if (!res.data.user) throw new Error('Dados do usuário ausentes na resposta do servidor.');
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            console.error('Full Login Error:', err);
            const backendError = err.response?.data?.error || err.response?.data?.message;
            const runtimeError = err.message;
            setError(backendError || runtimeError || 'Erro desconhecido ao entrar.');
        } finally {
            stopProcessing();
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full"></div>
            </div>

            <Link
                to="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-black text-xs uppercase tracking-[0.2em] z-50 bg-white/5 px-5 py-2.5 rounded-2xl backdrop-blur-xl border border-white/10"
            >
                <ArrowLeft size={16} /> Voltar
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="!p-10 border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl rounded-[2.5rem]">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 overflow-hidden">
                            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Bem-vindo</h2>
                        <p className="text-slate-400 font-medium">Acesse sua conta Real Balance</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-xs font-black flex items-center gap-3">
                            <span className="text-lg">⚠️</span> {error}
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
                                className="absolute right-5 top-[52px] text-slate-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-5 h-5 rounded-lg border-2 border-white/10 bg-white/5 checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer appearance-none"
                                    />
                                    {rememberMe && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white text-[10px] font-black">✓</div>}
                                </div>
                                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-widest">Lembrar-me</span>
                            </label>
                            <Link to="/recover" className="text-xs font-black text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest">
                                Recuperar conta
                            </Link>
                        </div>

                        <Button className="w-full h-14 text-lg font-black money-gradient shadow-emerald-500/20 group" type="submit">
                            Entrar na Conta <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </form>

                    <p className="mt-10 text-center text-slate-500 font-bold text-sm">
                        Ainda não tem conta? <Link to="/register" className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1 font-black">Registe-se aqui</Link>
                    </p>
                </Card>
            </motion.div>
        </div>
    );
};

export default Login;
