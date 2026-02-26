import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Card, Select } from '../components/ui';
import {
    User,
    Mail,
    Lock,
    Phone,
    IdCard,
    MapPin,
    Users,
    Heart,
    Camera,
    ChevronRight,
    AtSign,
    Eye,
    EyeOff,
    Plus,
    ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import logo from '../assets/logo.png';
import { useUI } from '../context/UIContext';

const Registar = () => {
    const [formData, setFormData] = useState({
        nome_completo: '',
        nome_usuario: '',
        email: '',
        contacto: '',
        sexo: '',
        estado_civil: '',
        BI: '',
        endereço: '',
        palavra_passe: '',
        confirmPassword: ''
    });
    const [photo, setPhoto] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
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

        if (formData.palavra_passe.length !== 8) {
            setError('A palavra-passe deve ter exatamente 8 dígitos.');
            return;
        }

        if (formData.palavra_passe !== formData.confirmPassword) {
            setError('As palavras-passe não coincidem.');
            return;
        }

        startProcessing('Criando o seu acesso de elite...');
        try {
            await api.post('/auth/register', { ...formData, foto_perfil: photo });
            navigate('/login');
        } catch (err) {
            console.error('Registration Error:', err);
            const backendError = err.response?.data?.error || err.response?.data?.message;
            setError(backendError || 'Erro ao criar conta. Verifique os dados ou tente uma foto menor.');
        } finally {
            stopProcessing();
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 py-20 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full"></div>
            </div>

            <Link
                to="/login"
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-black text-xs uppercase tracking-[0.2em] z-50 bg-white/5 px-5 py-2.5 rounded-2xl backdrop-blur-xl border border-white/10"
            >
                <ArrowLeft size={16} /> Voltar ao Login
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl relative z-10"
            >
                <Card className="!p-8 md:!p-12 border-white/5 bg-slate-900/40 backdrop-blur-2xl shadow-2xl rounded-[3rem]">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Criar Conta</h1>
                        <p className="text-slate-400 font-medium tracking-tight">Junte-se à gestão financeira premium em Angola</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-xs font-black flex items-center gap-3 animate-in slide-in-from-top-2">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Profile Photo Section (Optional) */}
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500/50 group-hover:bg-white/5 relative">
                                    {photo ? (
                                        <>
                                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setPhoto(null)}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="text-white" size={24} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <Camera className="mx-auto text-slate-500 group-hover:text-emerald-500 transition-colors" size={32} />
                                            <p className="text-[10px] uppercase font-black text-slate-500 group-hover:text-emerald-500 mt-2 tracking-widest">Foto (Opcional)</p>
                                        </div>
                                    )}
                                </div>
                                {!photo && (
                                    <>
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                            onChange={handlePhotoChange}
                                            accept="image/*"
                                        />
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-slate-900 z-10 transition-transform group-hover:scale-110">
                                            <Plus size={20} strokeWidth={3} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Form Grid */}
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                            <Input
                                label="Nome Completo"
                                name="nome_completo"
                                placeholder="Manuel dos Santos"
                                icon={<User />}
                                value={formData.nome_completo}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Nome de Usuário"
                                name="nome_usuario"
                                placeholder="@manuel_santos"
                                icon={<AtSign />}
                                value={formData.nome_usuario}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                icon={<Mail />}
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Contacto"
                                name="contacto"
                                placeholder="+244 9XX XXX XXX"
                                icon={<Phone />}
                                value={formData.contacto}
                                onChange={handleChange}
                                required
                            />

                            <Select
                                label="Sexo"
                                name="sexo"
                                icon={<Users />}
                                value={formData.sexo}
                                onChange={handleChange}
                                required
                            >
                                <option value="" className="bg-slate-900">Selecionar...</option>
                                <option value="M" className="bg-slate-900">Masculino</option>
                                <option value="F" className="bg-slate-900">Feminino</option>
                            </Select>

                            <Select
                                label="Estado Civil"
                                name="estado_civil"
                                icon={<Heart />}
                                value={formData.estado_civil}
                                onChange={handleChange}
                                required
                            >
                                <option value="" className="bg-slate-900">Selecionar...</option>
                                <option value="Solteiro" className="bg-slate-900">Solteiro(a)</option>
                                <option value="Casado" className="bg-slate-900">Casado(a)</option>
                                <option value="Divorciado" className="bg-slate-900">Divorciado(a)</option>
                                <option value="Viuvo" className="bg-slate-900">Viúvo(a)</option>
                            </Select>

                            <Input
                                label="Nº do BI"
                                name="BI"
                                placeholder="00XXXXXXXXLA0XX"
                                icon={<IdCard />}
                                value={formData.BI}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                label="Bairro / Cidade"
                                name="endereço"
                                placeholder="Maianga, Luanda"
                                icon={<MapPin />}
                                value={formData.endereço}
                                onChange={handleChange}
                                required
                            />

                            <div className="relative">
                                <Input
                                    label="Senha (8 dígitos)"
                                    name="palavra_passe"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    icon={<Lock />}
                                    value={formData.palavra_passe}
                                    onChange={handleChange}
                                    maxLength={8}
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

                            <div className="relative">
                                <Input
                                    label="Confirmar Senha"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    icon={<Lock />}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    maxLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-5 top-[52px] text-slate-500 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            className="w-full h-15 text-xl font-black money-gradient shadow-emerald-500/20 group mt-10"
                            type="submit"
                        >
                            Criar Conta <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={24} />
                        </Button>
                    </form>

                    <p className="mt-12 text-center text-slate-500 font-bold border-t border-white/5 pt-8">
                        Já faz parte da elite? <Link to="/login" className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1 font-black underline underline-offset-4">Fazer Login</Link>
                    </p>
                </Card>
            </motion.div>
        </div>
    );
};

export default Registar;
