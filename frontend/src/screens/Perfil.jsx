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
    Check,
    X,
    Trash2,
    AlertTriangle
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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

    if (!user) return <div className="p-20 text-center font-black text-slate-400 text-2xl animate-pulse">Carregando perfil...</div>;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Compress image before setting it
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Resolução suficiente para perfil
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Converter para Base64 com compressão JPEG (0.7 qualidade)
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setPhoto(dataUrl);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        startProcessing('Atualizando o seu perfil...');
        setLoading(true);
        setError('');
        try {
            const profileData = {
                nome_completo: editedUser.name,
                nome_usuario: editedUser.username,
                email: editedUser.email,
                contacto: editedUser.contact,
                sexo: editedUser.gender === 'male' ? 'M' : editedUser.gender === 'female' ? 'F' : 'O',
                estado_civil: editedUser.maritalStatus,
                BI: editedUser.idNumber,
                endereço: editedUser.address,
                foto_perfil: photo
            };
            const res = await api.put('/auth/profile', profileData);
            login(res.data.user, null);
            setIsEditing(false);
        } catch (err) {
            console.error('Update Profile Error:', err);
            if (err.response?.status === 413) {
                setError('A imagem é demasiado grande. Por favor, escolha uma foto menor ou com menos resolução.');
            } else {
                const message = err.response?.data?.message;
                setError(typeof message === 'string' ? message : 'Erro ao atualizar. Verifique os dados.');
            }
        } finally {
            setLoading(false);
            stopProcessing();
        }
    };

    const handleDeleteAccount = async () => {
        startProcessing('Eliminando a sua conta...');
        setShowDeleteConfirm(false);
        setLoading(true);
        try {
            await api.delete('/auth/profile');
            logout();
            navigate('/');
        } catch (err) {
            console.error('Delete Account Error:', err);
            setError('Falha ao eliminar a conta.');
        } finally {
            setLoading(false);
            stopProcessing();
        }
    };

    const infoGroups = [
        {
            title: "Informações Pessoais",
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
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Meu Perfil</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Gerencie suas informações e segurança da conta.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="px-6">
                            <X size={18} /> Cancelar
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <Shield size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Conta Verificada</span>
                        </div>
                    )}
                </div>
            </header>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-3 text-sm font-bold">
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="!p-0 overflow-hidden border-white/5 bg-slate-900/40">
                        <div className="h-32 bg-slate-800 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-secondary/20"></div>
                        </div>
                        <div className="px-8 pb-10 flex flex-col items-center -mt-16 relative z-10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 p-1 border-4 border-slate-900 shadow-2xl overflow-hidden relative flex items-center justify-center">
                                    {photo ? (
                                        <img
                                            src={photo}
                                            alt="Profile"
                                            className="w-full h-full object-cover rounded-[2rem]"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600 rounded-[2rem]">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-1 right-1 w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white cursor-pointer shadow-xl hover:scale-110 transition-transform border-4 border-slate-900">
                                    <Camera size={18} />
                                    <input type="file" onChange={handlePhotoChange} className="hidden" accept="image/*" />
                                </label>
                            </div>

                            <div className="mt-6 text-center">
                                <h3 className="text-2xl font-black text-white tracking-tight">{user.name}</h3>
                                <p className="text-emerald-500 font-bold text-sm">@{user.username}</p>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-3 w-full">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                                    <p className="text-xs font-bold text-slate-300">Premium</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Membro</p>
                                    <p className="text-xs font-bold text-slate-300">{new Date(user.created_at || Date.now()).getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-900/40 border-white/5 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Shield size={12} /> Segurança
                        </h4>
                        <div className="space-y-3">
                            <Button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full justify-start text-sm bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                            >
                                <Trash2 size={16} /> Eliminar Conta
                            </Button>
                        </div>
                    </Card>

                </div>

                {/* Right Column */}
                <div className="lg:col-span-8 space-y-8">
                    {infoGroups.map((group, idx) => (
                        <Card key={idx} className="bg-slate-900/40 border-white/5 p-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-10 relative z-10">
                                {group.title}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 relative z-10">
                                {group.items.map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            {item.icon} {item.label}
                                        </span>
                                        {isEditing ? (
                                            <div className="relative">
                                                {item.id === 'gender' ? (
                                                    <select
                                                        name="gender"
                                                        value={editedUser.gender}
                                                        onChange={handleInputChange}
                                                        className="premium-input appearance-none"
                                                    >
                                                        <option value="male" className="bg-slate-900">Masculino</option>
                                                        <option value="female" className="bg-slate-900">Feminino</option>
                                                        <option value="other" className="bg-slate-900">Outro</option>
                                                    </select>
                                                ) : item.id === 'maritalStatus' ? (
                                                    <select
                                                        name="maritalStatus"
                                                        value={editedUser.maritalStatus}
                                                        onChange={handleInputChange}
                                                        className="premium-input appearance-none"
                                                    >
                                                        <option value="Solteiro" className="bg-slate-900">Solteiro(a)</option>
                                                        <option value="Casado" className="bg-slate-900">Casado(a)</option>
                                                        <option value="Divorciado" className="bg-slate-900">Divorciado(a)</option>
                                                        <option value="Viuvo" className="bg-slate-900">Viúvo(a)</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        name={item.id}
                                                        value={editedUser[item.id] || ''}
                                                        onChange={handleInputChange}
                                                        className="premium-input"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-slate-200 font-bold">{item.value}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}

                    <div className="flex justify-end gap-4 pt-4">
                        {isEditing ? (
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-10 h-14 money-gradient text-lg shadow-emerald-500/20"
                            >
                                <Check size={20} /> Guardar Alterações
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="px-10 h-14 money-gradient text-lg shadow-emerald-500/20"
                            >
                                <Check size={20} /> Editar Perfil
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowDeleteConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-slate-900 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl text-center"
                        >
                            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4">Atenção Crítica</h3>
                            <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                                Esta conta e todos os seus dados financeiros serão <span className="text-red-400 font-black underline">eliminados permanentemente</span>.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="h-12"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleDeleteAccount}
                                    className="h-12 bg-red-500 hover:bg-red-600 text-white border-none"
                                >
                                    Confirmar
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
