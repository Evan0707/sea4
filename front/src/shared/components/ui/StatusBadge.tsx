import React from 'react';

type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
 status: string;
 variant?: StatusVariant;
 className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
 default: 'bg-bg-primary text-text-primary border-gray-500',
 success: 'bg-bg-primary text-green-500 border-green-500',
 warning: 'bg-bg-primary text-blue-500 border-blue-500',
 danger: 'bg-bg-primary text-red-600 border-red-500',
 info: 'bg-bg-primary text-blue-500 border-blue-500',
};

// Helper function to guess variant from status text if not provided
const getVariantFromStatus = (status: string): StatusVariant => {
 const s = status.toLowerCase();
 if (s.includes('terminé') || s.includes('validé') || s.includes('complété')) return 'success';
 if (s.includes('cours') || s.includes('attente')) return 'info';
 if (s.includes('retard') || s.includes('erreur') || s.includes('annulé')) return 'danger';
 if (s.includes('venir') || s.includes('démarrage')) return 'warning';
 return 'default';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
 status,
 variant,
 className = ''
}) => {
 const finalVariant = variant || getVariantFromStatus(status);

 return (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variantStyles[finalVariant]} ${className}`}>
   {status}
  </span>
 );
};
