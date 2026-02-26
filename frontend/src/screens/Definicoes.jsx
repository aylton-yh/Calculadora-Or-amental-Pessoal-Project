import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Button, Card } from '../components/ui';
import {
    User,
    Shield,
    Globe,
    Landmark,
    Settings as SettingsIcon,
    Bell,
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    AlertTriangle,
    Key,
    Loader2,
    Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

// ─────────────────────────────────────────────────────────
// Campo de senha reutilizável com botão mostrar/ocultar
// ─────────────────────────────────────────────────────────
const PasswordField = ({ id, label, value, onChange, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Lock size={10} /> {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete="new-password"
                    className="w-full bg-slate-900/60 border border-white/10 text-white font-bold rounded-2xl px-4 py-3.5 pr-12 outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-600 text-sm"
                />
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShow(s => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// Barra de força da senha
// ─────────────────────────────────────────────────────────
const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
        { score: 0, label: '', color: '' },
        { score: 1, label: 'Fraca', color: 'bg-red-500' },
        { score: 2, label: 'Razoável', color: 'bg-amber-500' },
        { score: 3, label: 'Boa', color: 'bg-yellow-400' },
        { score: 4, label: 'Forte', color: 'bg-emerald-500' },
    ];
    return map[score];
};

// ─────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────
const Definicoes = () => {
    const { user, updatePreferences } = useBudget();

    // Estado do formulário de senha
    const [senhaActual, setSenhaActual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [prefLoading, setPrefLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [prefMsg, setPrefMsg] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Estados das preferências
    const [moeda, setMoeda] = useState(user?.moeda_padrao || 'Kz');
    const [idioma, setIdioma] = useState(user?.idioma || 'pt-AO');

    const strength = getPasswordStrength(novaSenha);

    const resetForm = () => {
        setSenhaActual('');
        setNovaSenha('');
        setConfirmarSenha('');
        setFieldErrors({});
    };

    // Validação local antes de chamar a API
    const validar = () => {
        const erros = {};
        if (!senhaActual) erros.senhaActual = 'Introduza a senha actual.';
        if (!novaSenha) erros.novaSenha = 'Introduza a nova senha.';
        else if (novaSenha.length < 6) erros.novaSenha = 'A nova senha deve ter pelo menos 6 caracteres.';
        if (!confirmarSenha) erros.confirmarSenha = 'Confirme a nova senha.';
        else if (novaSenha !== confirmarSenha) erros.confirmarSenha = 'As senhas não coincidem.';
        if (senhaActual && novaSenha && senhaActual === novaSenha)
            erros.novaSenha = 'A nova senha não pode ser igual à actual.';
        return erros;
    };

    const handleAlterarSenha = async (e) => {
        e.preventDefault();
        setSuccessMsg('');
        setErrorMsg('');

        const erros = validar();
        if (Object.keys(erros).length > 0) {
            setFieldErrors(erros);
            return;
        }
        setFieldErrors({});
        setLoading(true);

        try {
            await api.put('/auth/change-password', { senhaActual, novaSenha });
            setSuccessMsg('Palavra-passe alterada e guardada com sucesso!');
            resetForm();
            setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Erro ao alterar a senha. Tente novamente.';
            if (err?.response?.status === 401) {
                setFieldErrors({ senhaActual: msg });
            } else {
                setErrorMsg(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSalvarPreferencias = async () => {
        setPrefLoading(true);
        setPrefMsg('');
        const res = await updatePreferences({
            moeda_padrao: moeda,
            idioma: idioma
        });
        if (res.success) {
            setPrefMsg('Preferências guardadas com sucesso!');
            setTimeout(() => setPrefMsg(''), 5000);
        } else {
            setPrefMsg('Erro ao guardar preferências.');
        }
        setPrefLoading(false);
    };


    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                        <SettingsIcon size={36} className="text-secondary" />
                        Configurações
                    </h1>
                    <p className="text-slate-400 font-medium tracking-tight">Personalize sua experiência no Real Balance para melhores resultados.</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8 pb-20">
                <div className="lg:col-span-12 space-y-8">

                    {/* ── Perfil do Usuário ── */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="bg-slate-900/40 border-white/5 p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-3xl rounded-full -mr-32 -mt-32" />

                            <div className="flex items-center gap-2 mb-10 relative z-10">
                                <User className="text-secondary" size={24} />
                                <h2 className="text-xl font-black text-white">Perfil do Usuário</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-400 font-bold cursor-not-allowed">
                                        {user?.nome_completo}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome de Usuário</label>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-400 font-bold cursor-not-allowed">
                                        {user?.nome_usuario}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-2 relative z-10">
                                <Shield size={14} className="text-emerald-500" />
                                <p className="text-xs text-slate-500 font-medium">
                                    Seus dados estão protegidos por criptografia de ponta a ponta.
                                </p>
                            </div>
                        </Card>
                    </motion.div>

                    {/* ── Alterar Palavra-passe ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                    >
                        <Card className="bg-slate-900/40 border-white/5 p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-500/5 blur-3xl rounded-full -ml-36 -mt-36 pointer-events-none" />

                            <div className="flex items-center gap-3 mb-8 relative z-10">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                    <Key size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Alterar Palavra-passe</h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        Verificada contra o banco de dados. O histórico de alterações é registado.
                                    </p>
                                </div>
                            </div>

                            {/* Mensagens de feedback */}
                            <AnimatePresence>
                                {successMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-bold"
                                    >
                                        <CheckCircle size={18} />
                                        <span className="flex-1">{successMsg}</span>
                                        <span className="text-[10px] flex items-center gap-1 text-emerald-500/50 font-bold uppercase tracking-wider">
                                            <Database size={10} /> DB Actualizado
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <AnimatePresence>
                                {errorMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm font-bold"
                                    >
                                        <AlertTriangle size={18} /> {errorMsg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleAlterarSenha} className="space-y-5 relative z-10" noValidate>

                                {/* Senha Actual */}
                                <div>
                                    <PasswordField
                                        id="senhaActual"
                                        label="Senha Actual"
                                        value={senhaActual}
                                        onChange={e => { setSenhaActual(e.target.value); setFieldErrors(p => ({ ...p, senhaActual: '' })); }}
                                        placeholder="Introduza a sua senha actual"
                                    />
                                    <AnimatePresence>
                                        {fieldErrors.senhaActual && (
                                            <motion.p
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-1.5 text-xs text-red-400 font-bold flex items-center gap-1.5 ml-1"
                                            >
                                                <AlertTriangle size={11} /> {fieldErrors.senhaActual}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="border-t border-white/5 pt-5 grid md:grid-cols-2 gap-5">
                                    {/* Nova Senha */}
                                    <div className="space-y-2">
                                        <PasswordField
                                            id="novaSenha"
                                            label="Nova Senha"
                                            value={novaSenha}
                                            onChange={e => { setNovaSenha(e.target.value); setFieldErrors(p => ({ ...p, novaSenha: '' })); }}
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                        {/* Barra de força */}
                                        {novaSenha && (
                                            <div className="flex items-center gap-3 mt-2">
                                                <div className="flex-1 grid grid-cols-4 gap-1">
                                                    {[1, 2, 3, 4].map(i => (
                                                        <div
                                                            key={i}
                                                            className={`h-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-800'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${strength.score >= 3 ? 'text-emerald-400' : strength.score === 2 ? 'text-amber-400' : 'text-red-400'
                                                    }`}>
                                                    {strength.label}
                                                </span>
                                            </div>
                                        )}
                                        <AnimatePresence>
                                            {fieldErrors.novaSenha && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-xs text-red-400 font-bold flex items-center gap-1.5 ml-1"
                                                >
                                                    <AlertTriangle size={11} /> {fieldErrors.novaSenha}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Confirmar Nova Senha */}
                                    <div>
                                        <PasswordField
                                            id="confirmarSenha"
                                            label="Confirmar Nova Senha"
                                            value={confirmarSenha}
                                            onChange={e => { setConfirmarSenha(e.target.value); setFieldErrors(p => ({ ...p, confirmarSenha: '' })); }}
                                            placeholder="Repita a nova senha"
                                        />
                                        {/* Indicador de correspondência */}
                                        {confirmarSenha && (
                                            <p className={`mt-2 text-[10px] font-black uppercase tracking-widest ml-1 flex items-center gap-1.5 ${novaSenha === confirmarSenha ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {novaSenha === confirmarSenha
                                                    ? <><CheckCircle size={11} /> Senhas coincidem</>
                                                    : <><AlertTriangle size={11} /> Senhas não coincidem</>
                                                }
                                            </p>
                                        )}
                                        <AnimatePresence>
                                            {fieldErrors.confirmarSenha && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-xs text-red-400 font-bold flex items-center gap-1.5 ml-1"
                                                >
                                                    <AlertTriangle size={11} /> {fieldErrors.confirmarSenha}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Dicas */}
                                <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Dicas para uma senha forte</p>
                                    <ul className="space-y-1">
                                        {[
                                            ['Mínimo 8 caracteres', novaSenha.length >= 8],
                                            ['Pelo menos uma letra maiúscula', /[A-Z]/.test(novaSenha)],
                                            ['Pelo menos um número', /[0-9]/.test(novaSenha)],
                                            ['Pelo menos um símbolo (!, @, #...)', /[^A-Za-z0-9]/.test(novaSenha)],
                                        ].map(([tip, met]) => (
                                            <li key={tip} className={`text-xs flex items-center gap-2 font-medium ${met ? 'text-emerald-400' : 'text-slate-600'}`}>
                                                <CheckCircle size={11} className={met ? 'text-emerald-500' : 'text-slate-700'} />
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Acções */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 h-11 rounded-2xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5 transition-all"
                                    >
                                        Limpar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-black shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <><Loader2 size={16} className="animate-spin" /> A verificar...</>
                                        ) : (
                                            <><Key size={16} /> Guardar Senha</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>

                    {/* ── Sistema & Preferências ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.16 }}
                    >
                        <Card className="bg-slate-900/40 border-white/5 p-8">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-2">
                                    <Globe className="text-secondary" size={24} />
                                    <h2 className="text-xl font-black text-white">Sistema &amp; Preferências</h2>
                                </div>
                                <AnimatePresence>
                                    {prefMsg && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="text-xs font-bold text-emerald-400 flex items-center gap-2"
                                        >
                                            <CheckCircle size={14} /> {prefMsg}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-6">

                                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-secondary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-secondary transition-colors">
                                                <Landmark size={22} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">Moeda</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Padrão: Kwanza</p>
                                            </div>
                                        </div>
                                        <select
                                            value={moeda}
                                            onChange={e => setMoeda(e.target.value)}
                                            className="bg-slate-900 border border-white/10 p-2 px-4 rounded-xl font-bold text-slate-200 outline-none focus:border-secondary transition-all cursor-not-allowed"
                                            disabled
                                        >
                                            <option value="Kz">Kwanza (AOA)</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-secondary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-secondary transition-colors">
                                                <Globe size={22} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200">Idioma</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Padrão: Português</p>
                                            </div>
                                        </div>
                                        <select
                                            value={idioma}
                                            onChange={e => setIdioma(e.target.value)}
                                            className="bg-slate-900 border border-white/10 p-2 px-4 rounded-xl font-bold text-slate-200 outline-none focus:border-secondary transition-all cursor-not-allowed"
                                            disabled
                                        >
                                            <option value="pt-AO">Português (AO)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleSalvarPreferencias}
                                        disabled={prefLoading}
                                        className="px-8 h-12 rounded-2xl bg-secondary text-white text-sm font-black shadow-lg shadow-secondary/20 hover:shadow-secondary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {prefLoading ? (
                                            <><Loader2 size={16} className="animate-spin" /> A guardar...</>
                                        ) : (
                                            <><CheckCircle size={16} /> Guardar Preferências</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Definicoes;
