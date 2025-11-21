import { DotsVertical, Edit, Trash } from '@mynaui/icons-react';
import { useState, useRef, useEffect } from 'react';
import Status from '@/shared/components/ui/Status';
import { Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';

interface DossierItemProps {
  nom: string;
  prenom: string;
  address: string;
  cp: string;
  ville: string;
  start: string;
  status: 'À venir' | 'Terminé' | 'Complété' | 'En chantier' | 'À compléter';
  onEdit?: () => void;
  onDelete?: () => void;
  loading?:Boolean;
}

const DossierItem = ({
  nom,
  prenom,
  address,
  cp,
  ville,
  start,
  status,
  onEdit,
  onDelete,
  loading=false,
}: DossierItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div
      className="flex items-center justify-between py-3 pl-5 pr-15 w-full hover:bg-bg-secondary transition-colors cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {
        !loading?
        <>
          <Text className="truncate w-[150px] font-medium">
            {nom} {prenom}
          </Text>
          <Text className="truncate w-[300px] text-placeholder">
            {address}, {cp} {ville}
          </Text>
          <Text className="truncate w-[100px] font-medium">{start}</Text>
          <div className="w-[120px] flex justify-end items-center gap-2">
            <Status label={status} />
          </div>
        </>
        :
        <>
          <Skeleton className="w-[150px] h-[24px]" />
          <Skeleton className="w-[300px] h-[24px]" />
          <Skeleton className="w-[100px] h-[24px]" />
          <Skeleton className="w-[120px] h-[24px]" />
        </>
      }

      {isHovered && (
        <button
          ref={popoverRef}
          onClick={(e) => {
            e.stopPropagation();
            setIsPopoverOpen(!isPopoverOpen);
          }}
          className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <DotsVertical className="w-5 h-5 text-placeholder" />
        </button>
      )}

      {isPopoverOpen && (
        <div className="absolute right-5 top-full px-1 mt-1 w-44 bg-white rounded-lg shadow-lg border border-border z-50 py-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPopoverOpen(false);
              onEdit?.();
            }}
            className="w-full rounded px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">Éditer</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPopoverOpen(false);
              onDelete?.();
            }}
            className="w-full rounded px-4 py-2 text-left hover:bg-red-50 text-error flex items-center gap-2 transition-colors"
          >
            <Trash className="w-4 h-4 text-red" />
            <span className="text-sm text-red">Supprimer</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DossierItem;