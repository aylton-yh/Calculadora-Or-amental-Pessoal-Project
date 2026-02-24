import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '../components/ui';
import {
    TrendingUp,
    User,
    Mail,
    Lock,
    Sparkles,
    Phone,
    IdCard,
    MapPin,
    Users,
    Heart,
    Camera,
    ChevronRight,
    AtSign,
    Eye,
    EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import logo from '../assets/logo.png';
import { useUI } from '../context/UIContext';
import '../styles/pages/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        contact: '',
        gender: '',
        maritalStatus: '',
        idNumber: '',
        address: '',
        password: '',
        confirmPassword: ''
    });
    const [photo, setPhoto] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const { startProcessing, stopProcessing } = useUI();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password.length !== 8) {
            setError('A palavra-passe deve ter exatamente 8 dígitos.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('As palavras-passe não coincidem.');
            return;
        }

        startProcessing('Criando o seu perfil de elite...');
        try {
            const res = await api.post('/auth/register', { ...formData, photo });
            navigate('/login');
        } catch (err) {
            console.error('Registration Error:', err);
            const backendError = err.response?.data?.error || err.response?.data?.message;
            const status = err.response?.status;
            const statusText = err.response?.statusText;

            if (status === 413) {
                setError('A foto é muito grande. Por favor, escolha uma imagem menor.');
            } else if (backendError) {
                setError(backendError);
            } else {
                setError(`Erro ${status || 'Conexão'}: ${statusText || 'Não foi possível completar o registo. Verifique o servidor.'}`);
            }
        } finally {
            stopProcessing();
        }
    };

    return (
        <div className="auth-container hero-pattern py-20">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
                {/* Top Banner Gradient */}
                <div className="absolute top-0 left-0 right-0 h-2 money-gradient"></div>

                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-money/30 overflow-hidden">
                        <img src={logo} alt="Real Balance Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="auth-title">Criar Conta</h1>
                    <p className="text-slate-500 font-bold">Junte-se à gestão financeira premium em Angola</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-sm font-black border border-red-100 flex items-center gap-2"
                    >
                        <span>⚠️</span> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Photo Section */}
                    <div className="flex flex-col items-center mb-12">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-money group-hover:bg-money/5">
                                {photo ? (
                                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <Camera className="mx-auto text-slate-300 group-hover:text-money transition-colors" size={32} />
                                        <p className="text-[10px] uppercase font-black text-slate-400 group-hover:text-money mt-2">Foto Perfil</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handlePhotoChange}
                                accept="image/*"
                            />
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 money-gradient rounded-xl flex items-center justify-center text-white shadow-lg border-4 border-white">
                                <Plus size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Form Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            label="Nome Completo"
                            name="name"
                            placeholder="Ex: Manuel dos Santos"
                            icon={<User size={20} />}
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Nome de Usuário"
                            name="username"
                            placeholder="@manuel_santos"
                            icon={<AtSign size={20} />}
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="seu@email.com"
                            icon={<Mail size={20} />}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Contacto"
                            name="contact"
                            placeholder="+244 9XX XXX XXX"
                            icon={<Phone size={20} />}
                            value={formData.contact}
                            onChange={handleChange}
                            required
                        />

                        <div className="flex flex-col gap-2">
                            <Select
                                label="Sexo"
                                name="gender"
                                icon={<Users size={20} />}
                                value={formData.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecionar...</option>
                                <option value="male">Masculino</option>
                                <option value="female">Feminino</option>
                                <option value="other">Outro</option>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Select
                                label="Estado Civil"
                                name="maritalStatus"
                                icon={<Heart size={20} />}
                                value={formData.maritalStatus}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecionar...</option>
                                <option value="single">Solteiro(a)</option>
                                <option value="married">Casado(a)</option>
                                <option value="divorced">Divorciado(a)</option>
                                <option value="widowed">Viúvo(a)</option>
                            </Select>
                        </div>

                        <Input
                            label="Nº do BI (Identidade)"
                            name="idNumber"
                            placeholder="00XXXXXXXXLA0XX"
                            icon={<IdCard size={20} />}
                            value={formData.idNumber}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Endereço"
                            name="address"
                            placeholder="Rua, Bairro, Luanda"
                            icon={<MapPin size={20} />}
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Senha (8 dígitos)"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                icon={<Lock size={20} />}
                                value={formData.password}
                                onChange={handleChange}
                                maxLength={8}
                                required
                                className="input-premium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-[52px] text-slate-400 hover:text-money transition-colors z-10"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <div className="relative">
                            <Input
                                label="Confirmar Senha"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                icon={<Lock size={20} />}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                maxLength={8}
                                required
                                className="input-premium"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-5 top-[52px] text-slate-400 hover:text-money transition-colors z-10"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <Button
                        className="w-full py-5 text-xl font-black money-gradient rounded-[1.5rem] shadow-2xl shadow-money/30 border-none group shimmer mt-8"
                        type="submit"
                    >
                        Criar Conta Agora <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </form>

                <p className="mt-10 text-center text-slate-500 font-bold border-t border-slate-50 pt-8">
                    Já faz parte da elite? <Link to="/login" className="text-money hover:text-money-dark transition-colors ml-1 underline decoration-2 underline-offset-4">Fazer Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

const Plus = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default Register;
