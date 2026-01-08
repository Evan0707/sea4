import { Text } from '@/shared/components/ui/Typography'
import DateInput from '@/shared/components/ui/DateInput'
import NumInput from '@/shared/components/ui/NumInput'
import type { Etape } from '@/shared/types/dossier'
import Checkbox from '@/shared/components/ui/Checkbox'
import Input from '@/shared/components/ui/Input'
import { ChevronDown, ChevronUp } from '@mynaui/icons-react'
import Button from '@/shared/components/ui/Button'

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

// Fonction pour afficher un item d'etape
const EtapeItem: React.FC<Props> = ({ e, artisans, onChange, onOpenAvailability, hasError }) => {
  const update = (patch: Partial<EtapeState>) => onChange(e.noEtape, patch)

  // Recuperation de l'artisan selectionne
  const selectedArtisan = artisans.find(art => art.noArtisan === e.artisanId)
  const artisanLabel = selectedArtisan
    ? `${selectedArtisan.prenomArtisan ?? ''} ${selectedArtisan.nomArtisan}`.trim()
    : 'Sélectionner un artisan...'

  const basePrice = e.montantTheorique ?? 0
  const supplement = e.supplement ?? 0
  const reduction = e.reduction ?? 0
  const total = basePrice + supplement - reduction

  return (
    <div
      className={`
        p-4 bg-bg-primary transition-colors duration-200 
        border-b border-border last:border-0
        ${hasError ? 'bg-red-50 ring-1 ring-red-300' : 'hover:bg-bg-secondary/30'}
        ${e.reservee ? 'opacity-60' : ''}
      `}
    >
      {/* Ligne principale : Nom | Artisan | Date | Prix */}
      <div className="grid grid-cols-12 gap-3 items-center">

        {/* Nom de l'étape + Checkbox Réservé */}
        <div className="col-span-12 md:col-span-3 flex items-center gap-2">
          <span className="font-semibold text-sm text-text-primary truncate flex-1" title={e.nomEtape}>
            {e.nomEtape}
          </span>
          {e.reservable && (
            <Checkbox
              label="Réservé"
              name={`reserve-${e.noEtape}`}
              checked={!!e.reservee}
              onChange={(val) => update({ reservee: val })}
            />
          )}
        </div>

        {/* Sélection Artisan */}
        <div className="col-span-12 md:col-span-3">
          {!e.reservee ? (
            <button
              type="button"
              onClick={() => onOpenAvailability(e)}
              className={`
                w-full flex items-center justify-between gap-2 px-3 py-2 
                text-sm bg-bg-secondary border border-border rounded-md 
                cursor-pointer hover:border-primary transition-colors text-left
                ${!e.artisanId ? 'text-placeholder' : 'text-text-primary'}
              `}
            >
              <span className="truncate">{artisanLabel}</span>
              {/* <Calendar className="w-4 h-4 shrink-0 text-text-secondary" /> */}
            </button>
          ) : (
            <div className="px-3 py-2 bg-bg-secondary/50 border border-border rounded-md text-text-disabled text-sm italic">
              Réservé client
            </div>
          )}
        </div>

        {/* Date théorique */}
        <div className="col-span-6 md:col-span-2">
          <DateInput
            label="Date"
            size="small"
            name={`date-${e.noEtape}`}
            value={e.dateTheorique ?? ''}
            onChange={(ev) => update({ dateTheorique: ev.target.value })}
          />
        </div>

        {/* Total */}
        <div className="col-span-6 md:col-span-2 text-right">
          <Text className="text-[10px] uppercase tracking-wide text-text-tertiary">Total</Text>
          <div className="font-mono font-semibold text-text-primary">
            € {total.toFixed(2)}
          </div>
        </div>

        {/* Bouton Ajuster */}
        <div className="col-span-12 md:col-span-2 flex justify-end">
          <Button
            variant="Secondary"
            size="sm"
            onClick={() => update({ openSupp: !e.openSupp })}
          >
            {e.openSupp ? 'Fermer' : 'Ajuster'}
            {e.openSupp ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Section Ajustements (collapsible) */}
      {e.openSupp && (
        <div className="mt-4 pt-4 border-t border-dashed border-border grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <NumInput
              name={`supp-${e.noEtape}`}
              label="Supplément (€)"
              value={supplement}
              onChange={(val) => {
                const max = basePrice * 0.3
                update({ supplement: Math.min(val, max) })
              }}
              placeholder="0.00"
            />
            {basePrice > 0 && (
              <Text className="text-[10px] text-text-tertiary mt-1">
                Max: €{(basePrice * 0.3).toFixed(2)} (30%)
              </Text>
            )}
          </div>

          <div>
            <NumInput
              name={`red-${e.noEtape}`}
              label="Réduction (€)"
              value={reduction}
              onChange={(val) => {
                const max = basePrice * 0.3
                update({ reduction: Math.min(val, max) })
              }}
              placeholder="0.00"
            />
          </div>

          <div>
            <Input
              type="text"
              label="Justification"
              name={`supp-desc-${e.noEtape}`}
              value={e.supplementDesc ?? ''}
              onChange={(ev) => update({ supplementDesc: ev.target.value || null })}
              placeholder="Raison de l'ajustement..."
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EtapeItem
