import { H3, Text } from '@/shared/components/ui/Typography'
import DateInput from '@/shared/components/ui/DateInput'
import NumInput from '@/shared/components/ui/NumInput'
import type { Etape } from '@/shared/types/dossier'
import Checkbox from '@/shared/components/ui/Checkbox'
import Input from '@/shared/components/ui/Input'
import { Calendar } from '@mynaui/icons-react'

export interface EtapeState extends Etape {
  artisanId?: number | null
  dateTheorique?: string | null
  montantTheorique?: number | null
  reservee?: boolean
  openSupp?: boolean
  supplement?: number | null
  reduction?: number | null
  supplementDesc?: string | null
  nbJours?: number
}

type Props = {
  e: EtapeState
  artisans: Array<{ noArtisan: number; nomArtisan: string; prenomArtisan?: string }>
  onChange: (noEtape: number, patch: Partial<EtapeState>) => void
  onOpenAvailability: (e: EtapeState) => void
  hasError?: boolean
}

const EtapeItem: React.FC<Props> = ({ e, artisans, onChange, onOpenAvailability, hasError }) => {
  const update = (patch: Partial<EtapeState>) => onChange(e.noEtape, patch)

  return (
    <div className={`p-4 bg-bg-primary rounded-lg transition-colors duration-300 ${hasError ? 'ring-2 ring-red-500 bg-red-50' : ''}`}>
      <div className=" items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-row items-center justify-between pr-[8%]">
            <div className="w-1/8 truncate" title={e.nomEtape}>
              <H3 className="text-sm truncate">{e.nomEtape}</H3>
            </div>

            <div className="flex items-end gap-2 w-[25%]">
              <Input
                label="Artisan"
                className='flex-1 cursor-pointer'
                name={`artisan-${e.noEtape}`}
                type="text"
                value={(() => {
                  const a = artisans.find(art => art.noArtisan === e.artisanId);
                  return a ? `${a.prenomArtisan ?? ''} ${a.nomArtisan}` : '';
                })()}
                onChange={() => { }}
                readOnly
                onClick={() => onOpenAvailability(e)}
                rightIcon={<Calendar className="w-5 h-5 text-gray-500" />}
                placeholder="Sélectionner un artisan..."
              />
            </div>


            <DateInput
              size='small'
              label="Date théo."
              className={`flex w-1/5 ${hasError ? 'text-red-600' : ''}`}
              name={`date-${e.noEtape}`}
              value={e.dateTheorique ?? ''}
              onChange={(ev: React.ChangeEvent<HTMLInputElement>) => update({ dateTheorique: ev.target.value })}
            />

            {e.reservable && (
              <Checkbox
                className='absolute right-4'
                label='Réservé'
                name='reserve'
                checked={!!e.reservee}
                onChange={(ev) => update({ reservee: ev })}
              />

            )}

            <div className="mt-2 font-mono flex w-1/5 items-center text-text-primary text-lg">
              <Text variant='caption' className="text-sm mr-2">Sous-total</Text>
              € {(((e.montantTheorique ?? 0) + (e.supplement ?? 0) - (e.reduction ?? 0))).toFixed(2)}
            </div>
          </div>

          {e.openSupp && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <div className="flex justify-between">
                  <NumInput
                    name={`supp-${e.noEtape}`}
                    label="Supplément"
                    value={e.supplement ?? 0}
                    onChange={(val) => {
                      const max = (e.montantTheorique || 0) * 0.3;
                      update({ supplement: Math.min(val, max) });
                    }}
                    placeholder="0"
                  />
                  {e.montantTheorique && e.montantTheorique > 0 && (
                    <Text className="text-xs text-placeholder self-end mb-2 ml-2">
                      {((e.supplement ?? 0) / e.montantTheorique * 100).toFixed(1)}% (max 30%)
                    </Text>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <NumInput
                    name={`red-${e.noEtape}`}
                    label="Réduction"
                    value={e.reduction ?? 0}
                    onChange={(val) => {
                      const max = (e.montantTheorique || 0) * 0.3;
                      update({ reduction: Math.min(val, max) });
                    }}
                    placeholder="0"
                  />
                  {e.montantTheorique && e.montantTheorique > 0 && (
                    <Text className="text-xs text-placeholder self-end mb-2 ml-2">
                      {((e.reduction ?? 0) / e.montantTheorique * 100).toFixed(1)}% (max 30%)
                    </Text>
                  )}
                </div>
              </div>

              <div>
                <Input
                  label='Description'
                  name={`supp-desc-${e.noEtape}`}
                  type='text'
                  value={e.supplementDesc ?? ''}
                  onChange={(ev) => update({ supplementDesc: ev.target.value || null })}
                  placeholder="Description du supplément / réduction"
                />

              </div>
            </div>
          )}
        </div>
        <button className="text-sm text-primary" onClick={() => update({ openSupp: !e.openSupp })}>
          {e.openSupp ? 'Fermer' : 'Ajouter supplément / réduction'}
        </button>

      </div>
    </div>
  )
}

export default EtapeItem
