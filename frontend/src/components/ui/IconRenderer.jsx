import React from 'react';
import * as LucideIcons from 'lucide-react';

const IconRenderer = ({ iconName, size = 18, className = "" }) => {
    const Icon = LucideIcons[iconName] || LucideIcons.HelpCircle;
    return <Icon size={size} className={className} />;
};

export default IconRenderer;
