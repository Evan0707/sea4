import React from 'react'
import { H3, Text } from '@/shared/components/ui/Typography'
import Select from '@/shared/components/ui/Select'
import DateInput from '@/shared/components/ui/DateInput'
import NumInput from '@/shared/components/ui/NumInput'
import type { Etape } from '@/shared/types/dossier'
import Checkbox from '@/shared/components/ui/Checkbox'
import Input from '@/shared/components/ui/Input'

export interface EtapeState extends Etape {
  artisanId?: number | null
  dateTheorique?: string | null
  montantTheorique?: number | null
  reservee?: boolean
  openSupp?: boolean
  supplement?: number | null
  reduction?: number | null
  supplementDesc?: string | null
}

type Props = {
  e: EtapeState
  artisans: Array<{ noArtisan: number; nomArtisan: string; prenomArtisan?: string }>
  onChange: (noEtape: number, patch: Partial<EtapeState>) => void
}

const EtapeItem: React.FC<Props> = ({ e, artisans, onChange }) => {
  const update = (patch: Partial<EtapeState>) => onChange(e.noEtape, patch)

  return (
    <div className="p-4 bg-bg-primary rounded-lg">
      <div className=" items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-row items-center justify-between pr-[8%]">
            <H3 className="text-sm w-1/8 truncate">{e.nomEtape}</H3>

            <Select
                size='small'
                label="Artisan"
                className='w-[20%]'
                name={`artisan-${e.noEtape}`}
                options={[{ value: '', label: 'Aucun' }, ...artisans.map(a => ({ value: String(a.noArtisan), label: `${a.prenomArtisan ?? ''} ${a.nomArtisan}` }))]}
                value={e.artisanId ? String(e.artisanId) : ''}
                onChange={(val: string) => update({ artisanId: val ? parseInt(val) : null })}
            />


            <DateInput
                size='small'
                label="Date théo."
                className='flex w-1/5'
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
                <NumInput
                  name={`supp-${e.noEtape}`}
                  label="Supplément"
                  value={e.supplement ?? 0}
                  onChange={(val) => update({ supplement: val })}
                  placeholder="0"
                />
              </div>

              <div>
                <NumInput
                  name={`red-${e.noEtape}`}
                  label="Réduction"
                  value={e.reduction ?? 0}
                  onChange={(val) => update({ reduction: val })}
                  placeholder="0"
                />
              </div>

              <div>
                <Input
                    label='Description'
                    name={`supp-desc-${e.noEtape}`}
                    type='text'
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
