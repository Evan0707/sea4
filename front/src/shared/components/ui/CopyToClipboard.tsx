import { useState } from 'react';
import { Copy, Check } from '@mynaui/icons-react';
import { useToast } from '@/shared/hooks/useToast';

interface CopyToClipboardProps {
 text: string;
 className?: string;
 iconSize?: number;
}

const CopyToClipboard = ({ text, className, iconSize = 14 }: CopyToClipboardProps) => {
 const [copied, setCopied] = useState(false);
 const { addToast } = useToast();

 const handleCopy = async (e: React.MouseEvent) => {
  e.stopPropagation();
  try {
   await navigator.clipboard.writeText(text);
   setCopied(true);
   setTimeout(() => setCopied(false), 2000);
   addToast('Copié dans le presse-papier', 'success');
  } catch (err) {
   console.error('Failed to copy!', err);
   addToast('Erreur lors de la copie', 'error');
  }
 };

 return (
  <button
   onClick={handleCopy}
   className={`p-1.5 text-text-secondary hover:text-primary transition-colors rounded-md hover:bg-bg-secondary cursor-pointer ${className}`}
   title="Copier"
   type="button"
  >
   {copied ? <Check size={iconSize} className="text-green-600" /> : <Copy size={iconSize} />}
  </button>
 );
};

export default CopyToClipboard;
