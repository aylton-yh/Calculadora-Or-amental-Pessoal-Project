import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('Processando...');

    const startProcessing = (message = 'Processando...') => {
        setProcessingMessage(message);
        setIsProcessing(true);
    };

    const stopProcessing = () => {
        setIsProcessing(false);
    };

    return (
        <UIContext.Provider value={{ isProcessing, processingMessage, startProcessing, stopProcessing }}>
            {children}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-trust/60 backdrop-blur-xl flex flex-col items-center justify-center text-white"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="bg-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center gap-6 border border-white/20"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 border-4 border-money/10 border-t-money rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="text-money animate-pulse" size={32} />
                                </div>
                            </div>
                            <div className="space-y-2 text-center">
                                <h3 className="text-2xl font-black text-trust tracking-tight">{processingMessage}</h3>
                                <p className="text-slate-400 font-bold text-sm tracking-wide uppercase">Por favor, aguarde um momento</p>
                            </div>

                            {/* Animated dots */}
                            <div className="flex gap-2">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        className="w-2 h-2 bg-money rounded-full"
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);
