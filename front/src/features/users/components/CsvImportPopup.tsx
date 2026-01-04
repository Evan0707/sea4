import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X } from '@mynaui/icons-react';
import { H1, Text } from '@/shared/components/ui/Typography';
import Button from '@/shared/components/ui/Button';

export interface CsvArtisan {
  nom: string;
  prenom: string;
  adresse: string;
  cp: string;
  ville: string;
  email?: string;
  tel?: string;
  qualifications: string;
}

interface Etape {
  noEtape: number;
  nomEtape: string;
}

interface CsvImportPopupProps {
  artisans: CsvArtisan[];
  onClose: () => void;
  onConfirm: (artisans: CsvArtisan[]) => void;
}

interface EtapeSelectorProps {
  etapes: Etape[];
  onSelect: (etape: Etape) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const EtapeSelector: React.FC<EtapeSelectorProps> = ({ etapes, onSelect, onClose, position }) => {
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filtered = etapes.filter(e =>
    e.nomEtape.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={ref}
      className="fixed bg-bg-primary border border-border rounded-lg shadow-xl z-[100] w-64 max-h-80 flex flex-col"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-2 border-b border-border">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full px-2 py-1.5 text-sm placeholder:text-placeholder text-text-primary border border-border rounded focus:outline-none focus:border-primary"
          autoFocus
        />
      </div>
      <div className="overflow-auto flex-1">
        {filtered.length > 0 ? filtered.map(etape => (
          <button
            key={etape.noEtape}
            onClick={() => onSelect(etape)}
            className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-secondary transition-colors"
          >
            {etape.nomEtape}
          </button>
        )) : (
          <div className="px-3 py-2 text-sm text-placeholder">Aucune étape trouvée</div>
        )}
      </div>
    </div>
  );
};

interface QualificationTagEditableProps {
  label: string;
  isValid: boolean;
  onRemove: () => void;
  onReplace: (newLabel: string) => void;
  etapes: Etape[];
}

const QualificationTagEditable: React.FC<QualificationTagEditableProps> = ({
  label, isValid, onRemove, onReplace, etapes
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tagRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isValid) {
      onRemove();
    } else {
      const rect = tagRef.current?.getBoundingClientRect();
      if (rect) {
        setPosition({ top: rect.bottom + 4, left: rect.left });
      }
      setShowSelector(true);
    }
  };

  return (
    <>
      <button
        ref={tagRef}
        onClick={handleClick}
        className={`px-2.5 py-1 text-xs font-medium rounded-full border cursor-pointer transition-all hover:opacity-80 ${isValid
          ? 'bg-primary/10 text-primary border-primary/20'
          : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}
        title={isValid ? 'Cliquer pour modifier' : 'Cliquer pour supprimer'}
      >
        {label}
        {!isValid && <span className="ml-1">×</span>}
      </button>
      {showSelector && (
        <EtapeSelector
          etapes={etapes}
          position={position}
          onClose={() => setShowSelector(false)}
          onSelect={(etape) => {
            onReplace(etape.nomEtape);
            setShowSelector(false);
          }}
        />
      )}
    </>
  );
};

const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

const isQualificationValid = (qual: string, etapes: Etape[]): boolean => {
  const normalizedQual = normalizeString(qual);
  return etapes.some(etape => {
    const normalizedEtape = normalizeString(etape.nomEtape);
    return normalizedEtape.includes(normalizedQual) || normalizedQual.includes(normalizedEtape);
  });
};

interface ExistingArtisan {
  nom: string;
  prenom: string;
}

const CsvImportPopup: React.FC<CsvImportPopupProps> = ({ artisans: initialArtisans, onClose, onConfirm }) => {
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [existingArtisans, setExistingArtisans] = useState<ExistingArtisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editableArtisans, setEditableArtisans] = useState<CsvArtisan[]>(initialArtisans);
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [etapesRes, artisansRes] = await Promise.all([
          axios.get('http://localhost:8000/api/etapes', { params: { limit: 1000 } }),
          axios.get('http://localhost:8000/api/artisan')
        ]);
        setEtapes(etapesRes.data || []);

        const existing = (artisansRes.data || []).map((a: any) => ({
          nom: normalizeString(a.nomArtisan || ''),
          prenom: normalizeString(a.prenomArtisan || '')
        }));
        setExistingArtisans(existing);

        // Auto-select artisans not already in DB
        const autoSelected = new Set<number>();
        initialArtisans.forEach((artisan, idx) => {
          const normNom = normalizeString(artisan.nom);
          const normPrenom = normalizeString(artisan.prenom);
          const exists = existing.some((e: ExistingArtisan) => e.nom === normNom && e.prenom === normPrenom);
          if (!exists) {
            autoSelected.add(idx);
          }
        });
        setSelectedIndexes(autoSelected);
      } catch (e) {
        console.error('Erreur lors du chargement', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialArtisans]);

  const isArtisanDuplicate = (artisan: CsvArtisan): boolean => {
    const normNom = normalizeString(artisan.nom);
    const normPrenom = normalizeString(artisan.prenom);
    return existingArtisans.some(e => e.nom === normNom && e.prenom === normPrenom);
  };

  const toggleSelection = (idx: number) => {
    setSelectedIndexes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIndexes.size === editableArtisans.length) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(editableArtisans.map((_, i) => i)));
    }
  };

  const parseQualifications = (qualStr: string): string[] => {
    if (!qualStr) return [];
    return qualStr.split(/[,;]/).map(q => q.trim()).filter(Boolean);
  };

  const updateArtisanQualifications = (artisanIdx: number, newQuals: string[]) => {
    setEditableArtisans(prev => prev.map((a, i) =>
      i === artisanIdx ? { ...a, qualifications: newQuals.join(', ') } : a
    ));
  };

  const removeQualification = (artisanIdx: number, qualIdx: number) => {
    const quals = parseQualifications(editableArtisans[artisanIdx].qualifications);
    quals.splice(qualIdx, 1);
    updateArtisanQualifications(artisanIdx, quals);
  };

  const replaceQualification = (artisanIdx: number, qualIdx: number, newLabel: string) => {
    const quals = parseQualifications(editableArtisans[artisanIdx].qualifications);
    quals[qualIdx] = newLabel;
    updateArtisanQualifications(artisanIdx, quals);
  };

  const getInvalidCount = (): number => {
    let count = 0;
    editableArtisans.forEach(artisan => {
      const quals = parseQualifications(artisan.qualifications);
      quals.forEach(qual => {
        if (!isQualificationValid(qual, etapes)) count++;
      });
    });
    return count;
  };

  const invalidCount = loading ? 0 : getInvalidCount();

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-bg-primary rounded-xl border border-border max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <H1 className="text-xl">Import d'artisans</H1>
            <div className="flex items-center gap-3 mt-1">
              <Text className="text-sm text-placeholder">
                {editableArtisans.length} artisan{editableArtisans.length > 1 ? 's' : ''} trouvé{editableArtisans.length > 1 ? 's' : ''}
              </Text>
              {!loading && invalidCount > 0 && (
                <Text className="text-sm text-red-500">
                  • {invalidCount} qualification{invalidCount > 1 ? 's' : ''} non reconnue{invalidCount > 1 ? 's' : ''}
                </Text>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-placeholder hover:text-text-primary transition-colors p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {editableArtisans.map((artisan, idx) => {
                const isDuplicate = isArtisanDuplicate(artisan);
                const isSelected = selectedIndexes.has(idx);
                return (
                  <div
                    key={idx}
                    className={`p-4 transition-colors ${isDuplicate ? 'bg-red-500/5' : 'hover:bg-bg-secondary'}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(idx)}
                        className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <div className="flex items-start justify-between gap-4 flex-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Text className="font-semibold text-base">
                              {artisan.nom || 'Sans nom'} {artisan.prenom}
                            </Text>
                            {isDuplicate && (
                              <span className="px-2 py-0.5 text-xs rounded bg-red-500/10 text-red-500">
                                Déjà existant
                              </span>
                            )}
                          </div>
                          <Text className="text-sm text-placeholder">
                            {[artisan.adresse, artisan.cp, artisan.ville].filter(Boolean).join(', ') || 'Adresse non renseignée'}
                          </Text>
                          {(artisan.email || artisan.tel) && (
                            <Text className="text-xs text-placeholder mt-0.5">
                              {[artisan.email, artisan.tel].filter(Boolean).join(' • ')}
                            </Text>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-w-[300px] justify-end">
                          {parseQualifications(artisan.qualifications).length > 0 ? (
                            parseQualifications(artisan.qualifications).map((qual, qIdx) => (
                              <QualificationTagEditable
                                key={qIdx}
                                label={qual}
                                isValid={isQualificationValid(qual, etapes)}
                                etapes={etapes}
                                onRemove={() => removeQualification(idx, qIdx)}
                                onReplace={(newLabel) => replaceQualification(idx, qIdx, newLabel)}
                              />
                            ))
                          ) : (
                            <span className="px-2.5 py-1 text-xs rounded-full bg-bg-secondary text-placeholder">
                              Aucune qualification
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center gap-3 p-5 border-t border-border bg-bg-secondary rounded-b-xl">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIndexes.size === editableArtisans.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
              <Text className="text-sm text-placeholder">Tout sélectionner</Text>
            </label>
            <Text className="text-sm text-placeholder">
              • {selectedIndexes.size} sélectionné{selectedIndexes.size > 1 ? 's' : ''}
            </Text>
          </div>
          <div className="flex gap-3">
            <Button variant='Secondary' onClick={onClose} size='sm'>Annuler</Button>
            <Button
              variant='Primary'
              onClick={() => onConfirm(editableArtisans.filter((_, i) => selectedIndexes.has(i)))}
              disabled={selectedIndexes.size === 0}
              size='sm'
            >
              Importer {selectedIndexes.size} artisan{selectedIndexes.size > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvImportPopup;
