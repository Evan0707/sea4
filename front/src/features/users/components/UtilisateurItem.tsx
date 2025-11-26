import { DotsVertical, Edit, Trash } from '@mynaui/icons-react';
import { useState, useRef, useEffect } from 'react';
import { Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';

interface UtilisateurItemProps {
  noUtilisateur?: number;
  login: string;
  nomRole: 'admin' | 'commercial' | 'maitre_oeuvre';
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

const UtilisateurItem = ({
  noUtilisateur,
  login,
  nomRole,
  onEdit,
  onDelete,
  loading = false,
}: UtilisateurItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  // Fermer le popover quand on quitte le hover
  useEffect(() => {
    if (!isHovered && isPopoverOpen) {
      setIsPopoverOpen(false);
    }
  }, [isHovered, isPopoverOpen]);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'commercial':
        return 'Commercial';
      case 'maitre_oeuvre':
        return 'Maître d\'œuvre';
      default:
        return role;
    }
  };

  return (
    <div
      className="flex items-center justify-between py-3 pl-5 pr-15 w-full hover:bg-bg-secondary transition-colors cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {
        !loading ?
          <>
            <Text className="truncate w-[300px] font-medium">
              {login}
            </Text>
            <Text className="truncate w-[200px] text-placeholder">
              {getRoleLabel(nomRole)}
            </Text>
          </>
          :
          <>
            <Skeleton className="w-[300px] h-[24px]" />
            <Skeleton className="w-[200px] h-[24px]" />
          </>
      }

      {isHovered && (
        <div ref={popoverRef} className="absolute right-5 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPopoverOpen(!isPopoverOpen);
            }}
            className="p-1 hover:bg-bg-primary rounded transition-colors"
          >
            <DotsVertical className="w-5 h-5 text-placeholder" />
          </button>

          {isPopoverOpen && (
            <div className="absolute right-0 top-full px-1 mt-1 w-44 bg-bg-primary rounded-lg shadow-lg border border-border py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) {
                    onEdit();
                    setIsPopoverOpen(false);
                  }
                }}
                className="w-full rounded px-4 py-2 text-left hover:bg-bg-secondary flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4 text-text-primary" />
                <span className="text-sm text-text-primary">Éditer</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPopoverOpen(false);
                  onDelete?.();
                }}
                className="w-full rounded px-4 py-2 text-left hover:bg-red/15 text-error flex items-center gap-2 transition-colors"
              >
                <Trash className="w-4 h-4 text-red" />
                <span className="text-sm text-red">Supprimer</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UtilisateurItem;
