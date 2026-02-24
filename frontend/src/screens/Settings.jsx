import React from 'react';
import { useBudget } from '../context/BudgetContext';
import { Button, Card, Input } from '../components/ui';
import { User, Shield, Globe, Landmark, Settings as SettingsIcon, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/pages/Settings.css';

const Settings = () => {
    const { user } = useBudget();

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="settings-container">
                <header className="mb-12">
                    <div className="settings-header">
                        <div className="p-3 bg-money/10 rounded-2xl text-money">
                            <SettingsIcon size={32} />
                        </div>
                        <h1 className="text-4xl font-black text-trust">Configurações</h1>
                    </div>
                    <p className="text-slate-500 font-bold">Personalize sua experiência no Real Balance para melhores resultados.</p>
                </header>

                <div className="space-y-8 pb-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="settings-card">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-money/5 rounded-full -mr-16 -mt-16"></div>

                            <div className="flex items-center gap-2 mb-8">
                                <User className="text-money" size={24} />
                                <h2 className="text-2xl font-black text-trust">Perfil do Investidor</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Input label="Nome Completo" value={user?.name} readOnly className="input-premium bg-slate-50 cursor-not-allowed" />
                                <Input label="Email Institucional" value={user?.email} readOnly className="input-premium bg-slate-50 cursor-not-allowed" />
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                                <p className="text-sm text-slate-400 font-bold">Dados protegidos por criptografia de ponta.</p>
                                <Button variant="outline" className="rounded-xl font-bold border-2 hover:border-money hover:text-money">Alterar Palavra-passe</Button>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white glass-card">
                            <div className="flex items-center gap-2 mb-8">
                                <Globe className="text-money" size={24} />
                                <h2 className="text-2xl font-black text-trust">Preferências Regionais</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="settings-preference-item">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm"><Landmark size={20} className="text-money" /></div>
                                        <div>
                                            <p className="font-bold text-trust">Moeda de Referência</p>
                                            <p className="text-xs text-slate-400">Usada para todos os cálculos</p>
                                        </div>
                                    </div>
                                    <select className="bg-white border-2 border-slate-200 p-2 px-4 rounded-xl font-bold text-trust outline-none focus:border-money">
                                        <option>Kwanza (AOA)</option>
                                        <option>Dólar (USD)</option>
                                        <option>Euro (EUR)</option>
                                    </select>
                                </div>

                                <div className="settings-preference-item">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm"><Globe size={20} className="text-money" /></div>
                                        <div>
                                            <p className="font-bold text-trust">Idioma do Sistema</p>
                                            <p className="text-xs text-slate-400">Interface e notificações</p>
                                        </div>
                                    </div>
                                    <select className="bg-white border-2 border-slate-200 p-2 px-4 rounded-xl font-bold text-trust outline-none focus:border-money">
                                        <option>Português (Angola)</option>
                                        <option>English (US)</option>
                                    </select>
                                </div>

                                <div className="settings-preference-item">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm"><Bell size={20} className="text-money" /></div>
                                        <div>
                                            <p className="font-bold text-trust">Notificações Push</p>
                                            <p className="text-xs text-slate-400">Avisos de gastos excessivos</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="settings-toggle"></div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
