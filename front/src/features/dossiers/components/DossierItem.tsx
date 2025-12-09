import { DotsVertical, Edit, Trash } from '@mynaui/icons-react';
import { useState, useRef, useEffect } from 'react';
import Status from '@/shared/components/ui/Status';
import { Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import { formatDate } from '@/shared/utils/dateFormatter';
import { useNavigate } from 'react-router-dom';

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
  loading?: Boolean;
  noChantier?: number;
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
  loading = false,
  noChantier,
}: DossierItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        !loading ?
          <>
            <Text className="truncate w-[150px] font-medium">
              {nom} {prenom}
            </Text>
            <Text className="truncate w-[300px] text-placeholder">
              {address}, {cp} {ville}
            </Text>
            <Text className="truncate w-[100px] font-medium font-mono tabular-nums">{formatDate(start)}</Text>
            <div className="w-[120px] flex justify-end items-center gap-2">
              {
                status=='À venir'?
                  <Status label='À compléter' />
                :
                  <Status label={status} />
              }
            </div>
          </>
          :
          <>
            <Skeleton className="w-[150px] h-6" />
            <Skeleton className="w-[300px] h-6" />
            <Skeleton className="w-[100px] h-6" />
            <Skeleton className="w-[120px] h-6" />
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
                  } else if (noChantier) {
                    navigate(`/commercial/dossiers/${noChantier}/edit`);
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

export default DossierItem;