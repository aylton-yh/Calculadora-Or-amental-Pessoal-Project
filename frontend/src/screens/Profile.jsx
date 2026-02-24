import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { useUI } from '../context/UIContext';
import { Card, Input, Button } from '../components/ui';
import {
    User,
    Mail,
    Phone,
    AtSign,
    IdCard,
    MapPin,
    Users,
    Heart,
    Shield,
    Camera,
    Calendar,
    ArrowLeft,
    Check,
    X,
    Trash2,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/pages/Profile.css';

const Profile = () => {
    const { user, login, logout } = useBudget();
    const { startProcessing, stopProcessing } = useUI();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (user) {
            setEditedUser({
                name: user.name,
                username: user.username,
                email: user.email,
                contact: user.contact || '',
                gender: user.gender || '',
                maritalStatus: user.marital_status || '',
                idNumber: user.id_number || '',
                address: user.address || ''
            });
            setPhoto(user.photo);
        }
    }, [user]);

    if (!user) return <div className="p-20 text-center font-black text-trust text-2xl animate-pulse">Carregando o seu perfil...</div>;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
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

    const handleSave = async () => {
        startProcessing('Atualizando o seu perfil premium...');
        setLoading(true);
        setError('');
        try {
            const res = await api.put('/auth/profile', { ...editedUser, photo });
            // Update local user and token in context
            login(res.data.user, res.data.token);
            setIsEditing(false);
        } catch (err) {
            console.error('Update Profile Error:', err);
            const detail = err.response?.data?.detail;
            const message = typeof detail === 'string' ? detail : (err.response?.data?.message || err.message);
            setError(message || 'Erro ao atualizar perfil. Tente uma foto menor ou verifique os dados.');
        } finally {
            setLoading(false);
            stopProcessing();
        }
    };

    const handleDeleteAccount = async () => {
        startProcessing('Eliminando a sua conta permanentemente...');
        setShowDeleteConfirm(false);
        setLoading(true);
        try {
            await api.delete('/auth/profile');
            logout();
            navigate('/');
        } catch (err) {
            console.error('Delete Account Error:', err);
            setError('Falha ao eliminar a conta. Tente novamente.');
        } finally {
            setLoading(false);
            stopProcessing();
        }
    };

    const infoGroups = [
        {
            title: "DADOS PESSOAIS E CONTA",
            items: [
                { id: "name", label: "Nome Completo", value: user.name, icon: <User size={20} /> },
                { id: "username", label: "Usuário", value: `@${user.username}`, icon: <AtSign size={20} /> },
                { id: "email", label: "Email", value: user.email, icon: <Mail size={20} /> },
                { id: "contact", label: "Contacto", value: user.contact || "Não informado", icon: <Phone size={20} /> },
                { id: "gender", label: "Sexo", value: user.gender === 'male' ? 'Masculino' : user.gender === 'female' ? 'Feminino' : 'Outro', icon: <Users size={20} /> },
                { id: "maritalStatus", label: "Estado Civil", value: user.marital_status || "Não informado", icon: <Heart size={20} /> },
                { id: "idNumber", label: "Nº do BI", value: user.id_number || "Não informado", icon: <IdCard size={20} /> },
                { id: "address", label: "Endereço", value: user.address || "Não informado", icon: <MapPin size={20} /> },
            ]
        }
    ];

    return (
        <div className="profile-container">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-money/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="mb-8 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-money font-bold transition-colors">
                        <ArrowLeft size={20} /> Voltar ao Painel
                    </Link>
                    <div className="flex gap-3">
                        {isEditing && (
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-wider border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 shadow-sm"
                            >
                                <X size={14} /> Cancelar
                            </button>
                        )}
                        <div className="px-5 py-2 bg-money/10 text-money rounded-2xl text-xs font-black uppercase tracking-widest border border-money/20 shadow-sm">
                            Perfil Membro Premium
                        </div>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-[2rem] flex items-center gap-4 font-black text-sm shadow-xl shadow-red-500/5"
                    >
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-red-500 shrink-0">
                            <AlertTriangle size={20} />
                        </div>
                        {error}
                    </motion.div>
                )}

                <div className="grid lg:grid-cols-12 gap-10">
                    {/* Left Column: Photo & Brief */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-4 space-y-8"
                    >
                        <Card className="profile-photo-card">
                            <div className="h-40 money-gradient relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl -mr-20 -mt-20 anim-pulse"></div>
                            </div>
                            <div className="px-8 pb-10 -mt-20 flex flex-col items-center">
                                <div className="relative">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className="profile-photo-container"
                                    >
                                        {photo ? (
                                            <img src={photo} alt="Profile" className="w-full h-full object-cover rounded-[2.5rem]" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                                                <User size={80} />
                                            </div>
                                        )}
                                    </motion.div>
                                    <label className="absolute bottom-2 -right-2 w-12 h-12 money-gradient rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-2xl cursor-pointer hover:scale-110 transition-transform z-20">
                                        <Camera size={20} />
                                        <input type="file" onChange={handlePhotoChange} className="hidden" accept="image/*" />
                                    </label>
                                </div>
                                <div className="mt-8 text-center">
                                    <h3 className="text-3xl font-black text-trust leading-tight px-2">{user.name}</h3>
                                    <p className="text-money font-black text-base mt-1">@{user.username}</p>
                                </div>

                                <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                                    <div className="bg-white/80 p-5 rounded-[2rem] text-center border border-slate-100 shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-money/10 text-money flex items-center justify-center mx-auto mb-3">
                                            <Shield size={16} />
                                        </div>
                                        <p className="text-[10px] uppercase font-black text-slate-400">Verificado</p>
                                    </div>
                                    <div className="bg-white/80 p-5 rounded-[2rem] text-center border border-slate-100 shadow-sm">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                                            <Calendar size={16} />
                                        </div>
                                        <p className="text-[10px] uppercase font-black text-slate-400">Premium</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="glass-card border-none p-10 rounded-[3.5rem] shadow-xl bg-trust/5 backdrop-blur-3xl">
                            <h4 className="font-black text-sm uppercase tracking-[0.2em] text-trust mb-6 flex items-center gap-3">
                                <div className="w-2 h-2 bg-money rounded-full shadow-lg shadow-money/40"></div>
                                Segurança e Acesso
                            </h4>
                            <div className="space-y-4">
                                <button className="w-full py-4 bg-white text-trust font-black text-sm rounded-2xl hover:bg-slate-50 transition-all border border-slate-100 shadow-sm active:scale-95 transition-transform">
                                    Alterar Palavra-passe
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full py-4 bg-red-50 text-red-500 font-black text-sm rounded-2xl hover:bg-red-100 transition-all border border-red-100 flex items-center justify-center gap-3 active:scale-95 transition-transform"
                                >
                                    <Trash2 size={16} /> Eliminar Conta
                                </button>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Right Column: Detailed Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-8 space-y-8"
                    >
                        {infoGroups.map((group, idx) => (
                            <Card key={idx} className="profile-info-card">
                                <div className="absolute top-12 left-12 w-1 h-3 bg-money rounded-full"></div>
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12 ml-4">
                                    {group.title}
                                </h4>
                                <div className="grid sm:grid-cols-2 gap-y-12 gap-x-16">
                                    {group.items.map((item, i) => (
                                        <div key={i} className="flex flex-col gap-3">
                                            <span className="text-[11px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                                                {item.icon} {item.label}
                                            </span>
                                            {isEditing ? (
                                                <div className="relative group/input">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-money transition-colors pointer-events-none z-10">
                                                        {React.cloneElement(item.icon, { size: 20 })}
                                                    </div>
                                                    {item.id === 'gender' ? (
                                                        <select
                                                            name="gender"
                                                            value={editedUser.gender}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-slate-50/50 border-2 border-slate-100 pl-14 pr-10 py-4.5 rounded-[1.8rem] font-bold text-trust outline-none focus:border-money focus:bg-white transition-all appearance-none shadow-sm relative z-0 cursor-pointer"
                                                        >
                                                            <option value="male">Masculino</option>
                                                            <option value="female">Feminino</option>
                                                            <option value="other">Outro</option>
                                                        </select>
                                                    ) : item.id === 'maritalStatus' ? (
                                                        <select
                                                            name="maritalStatus"
                                                            value={editedUser.maritalStatus}
                                                            onChange={handleInputChange}
                                                            className="w-full bg-slate-50/50 border-2 border-slate-100 pl-14 pr-10 py-4.5 rounded-[1.8rem] font-bold text-trust outline-none focus:border-money focus:bg-white transition-all appearance-none shadow-sm relative z-0 cursor-pointer"
                                                        >
                                                            <option value="single">Solteiro(a)</option>
                                                            <option value="married">Casado(a)</option>
                                                            <option value="divorced">Divorciado(a)</option>
                                                            <option value="widowed">Viúvo(a)</option>
                                                        </select>
                                                    ) : (
                                                        <input
                                                            name={item.id}
                                                            value={editedUser[item.id] || ''}
                                                            onChange={handleInputChange}
                                                            placeholder={item.label}
                                                            className="w-full bg-slate-50/50 border-2 border-slate-100 pl-14 pr-6 py-4.5 rounded-[1.8rem] font-bold text-trust outline-none focus:border-money focus:bg-white transition-all shadow-sm relative z-0"
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4 bg-white/50 p-5 rounded-[2.2rem] border border-white shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                        {item.icon}
                                                    </div>
                                                    <p className="text-trust font-black text-lg tracking-tight truncate">{item.value}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        ))}

                        <div className="flex justify-end gap-5 pt-8">
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-14 py-6 money-gradient text-white font-black rounded-[2rem] shadow-2xl shadow-money/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-70 disabled:scale-100"
                                >
                                    <Check size={24} /> Guardar Alterações
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-14 py-6 money-gradient text-white font-black rounded-[2rem] shadow-2xl shadow-money/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                                >
                                    <Check size={24} /> Editar Perfil
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-trust/20 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-white max-w-lg w-full p-12 rounded-[4rem] shadow-2xl border border-red-50 flex flex-col items-center text-center relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>
                            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner shadow-red-200/50">
                                <AlertTriangle size={48} />
                            </div>
                            <h3 className="text-4xl font-black text-trust mb-6">Atenção Crítica</h3>
                            <p className="text-slate-500 font-bold mb-10 leading-relaxed text-lg">
                                Esta conta e todos os dados financeiros associados serão <span className="text-red-500">permanentemente eliminados</span>. Esta ação não pode ser desfeita.
                            </p>
                            <div className="grid grid-cols-2 gap-5 w-full">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="py-5 bg-slate-100 text-trust font-black rounded-[1.8rem] hover:bg-slate-200 transition-all text-lg shadow-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="py-5 bg-red-500 text-white font-black rounded-[1.8rem] shadow-2xl shadow-red-500/30 hover:bg-red-600 transition-all text-lg"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
