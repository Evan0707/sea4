import React from 'react';

type StatusVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
 status: string;
 variant?: StatusVariant;
 className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
 default: 'bg-gray-50 text-gray-700 border-gray-200',
 success: 'bg-green-50 text-green-700 border-green-200',
 warning: 'bg-orange-50 text-orange-700 border-orange-200',
 danger: 'bg-red-50 text-red-700 border-red-200',
 info: 'bg-blue-50 text-blue-700 border-blue-200',
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
