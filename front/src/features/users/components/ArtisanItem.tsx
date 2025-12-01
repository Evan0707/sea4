import { DotsVertical, Edit, Trash } from '@mynaui/icons-react';
import { useState, useRef, useEffect } from 'react';
import { Text } from '@/shared/components/ui/Typography';
import Skeleton from '@/shared/components/ui/Skeleton';
import { useNavigate } from 'react-router-dom';
import ConfirmPopover from '@/shared/components/ui/ConfirmPopover';

interface ArtisanItemProps {
  noArtisan?: number;
  nomArtisan?: string;
  prenomArtisan?: string;
  adresseArtisan?: string;
  cpArtisan?: string;
  villeArtisan?: string;
  etapes?: { noEtape: number; nomEtape: string }[];
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

const ArtisanItem = ({
  noArtisan,
  nomArtisan,
  prenomArtisan,
  adresseArtisan,
  cpArtisan,
  villeArtisan,
  etapes,
  onEdit,
  onDelete,
  loading = false,
}: ArtisanItemProps) => {
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

  useEffect(()=>{
    console.log(nomArtisan);
    
  },[])

  return (
    <div
      className="flex items-center justify-between py-3 pl-5 pr-15 w-full hover:bg-bg-secondary transition-colors cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {
        !loading ?
          <>
            <div className="flex flex-col">
              <Text className="truncate w-[200px] font-medium">
                {nomArtisan} {prenomArtisan}
              </Text>

              {etapes && etapes.length > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  {etapes.slice(0,2).map(e => (
                    <div key={e.noEtape} className="text-sm bg-bg-secondary border border-border rounded-md px-2 py-0.5 text-text-primary">
                      {e.nomEtape}
                    </div>
                  ))}
                  {etapes.length > 2 && (
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                      +{etapes.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Text className="truncate w-[400px] text-placeholder">
              {adresseArtisan}, {cpArtisan} {villeArtisan}
            </Text>
          </>
          :
          <>
            <Skeleton className="w-[200px] h-[24px]" />
            <Skeleton className="w-[400px] h-[24px]" />
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
              <ConfirmPopover title='Supprimer artisan' message='Êtes-vous sûr de vouloir supprimer cet artisan ? Cette action est irréversible.' onConfirm={() => {
                setIsPopoverOpen(false);
                onDelete?.();
              }} onCancel={() => navigate(-1)} >
                <button
                 
                  className="w-full rounded px-4 py-2 text-left hover:bg-red/15 text-error flex items-center gap-2 transition-colors"
                >
                  <Trash className="w-4 h-4 text-red" />
                  <span className="text-sm text-red">Supprimer</span>
                </button>
             </ConfirmPopover>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArtisanItem;
