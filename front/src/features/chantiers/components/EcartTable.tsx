import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import type { EtapeAnalyse } from '../types';

interface EcartTableProps {
  etapes: EtapeAnalyse[];
  onSelectEtape?: (etape: EtapeAnalyse) => void;
  selectedEtapeId?: number | null;
}

const EcartBadge = ({ value, suffix = '€' }: { value: number; suffix?: string }) => {
  if (value === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-bg-secondary/50 text-placeholder border border-border/50">
        0 {suffix}
      </span>
    );
  }
  const isNegative = value < 0;
  return (
    <span className={cn(
      'inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-md border transition-all',
      isNegative
        ? 'bg-green-500/8 text-green-600 border-green-500/15'
        : 'bg-red/8 text-red border-red/15'
    )}>
      {value > 0 ? '↑' : '↓'} {Math.abs(value).toLocaleString('fr-FR')} {suffix}
    </span>
  );
};

const PerformanceBadge = ({ theoretical, actual }: { theoretical: number; actual: number }) => {
  if (theoretical <= 0 || actual <= 0) return null;
  const ratio = (actual - theoretical) / theoretical;
  const percent = Math.round(ratio * 100);
  
  if (Math.abs(percent) < 1) return null;

  return (
    <span className={cn(
      "text-[9px] font-bold px-1 rounded-sm ml-1.5 uppercase tracking-tighter",
      percent <= 0 ? "text-green-500 bg-green-500/5 border border-green-500/10" : "text-red bg-red/5 border border-red/10"
    )}>
      {percent <= 0 ? '' : '+'}{percent}%
    </span>
  );
};

export const EcartTable = ({ etapes, onSelectEtape, selectedEtapeId }: EcartTableProps) => {
  const totalTheorique = etapes.reduce((acc, e) => acc + parseFloat(e.montantTheorique || '0'), 0);
  const totalReel = etapes.reduce((acc, e) => acc + parseFloat(e.montantReel || '0'), 0);
  const totalJoursPrevu = etapes.reduce((acc, e) => acc + (e.nbJoursPrevu ?? 0), 0);
  const totalJoursReel = etapes.reduce((acc, e) => acc + (e.nbJoursReel ?? 0), 0);

  const th = 'py-3 px-4 text-[11px] font-semibold uppercase tracking-wider text-placeholder select-none border-b border-border/40 bg-bg-secondary/20';

  return (
    <div className="overflow-x-auto rounded-[var(--radius)] border border-border/40 bg-bg-primary/30 backdrop-blur-xl">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr className="">
            <th className={cn(th, 'text-left rounded-tl-[var(--radius)]')}  >Étape</th>
            <th className={cn(th, 'text-left')}  >Artisan</th>
            <th className={cn(th, 'text-right')} >M. théorique</th>
            <th className={cn(th, 'text-right')} >M. réel</th>
            <th className={cn(th, 'text-center')}>Écart €</th>
            <th className={cn(th, 'text-right')} >J. prévus</th>
            <th className={cn(th, 'text-right')} >J. réels</th>
            <th className={cn(th, 'text-center')}>Écart j.</th>
            <th className={cn(th, 'text-center rounded-tr-[var(--radius)]')}>Factures</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20">
          {etapes.map((etape, idx) => {
            const ecartMontant = parseFloat(etape.ecartMontant || '0');
            const ecartJours = etape.ecartJours;
            const isSelected = selectedEtapeId === etape.noEtapeChantier;

            return (
              <motion.tr
                key={etape.noEtapeChantier}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, ease: 'easeOut' }}
                onClick={() => onSelectEtape?.(etape)}
                className={cn(
                  'transition-all duration-200 group',
                  onSelectEtape && 'cursor-pointer hover:bg-primary/3',
                  isSelected ? 'bg-primary/5 sticky z-10' : 'bg-transparent',
                )}
              >
                <td className={cn(
                  'py-3 px-4 font-semibold text-text-primary transition-all text-xs',
                  isSelected && 'text-primary'
                )}>
                  {etape.nomEtape}
                </td>
                <td className="py-3 px-4 text-[11px] text-text-secondary">
                  <div className="flex items-center">
                    {etape.artisan
                      ? `${etape.artisan.nom} ${etape.artisan.prenom}`
                      : <span className="italic opacity-30">Non assigné</span>}
                    {etape.artisan && (
                      <PerformanceBadge 
                        theoretical={parseFloat(etape.montantTheorique || '0')} 
                        actual={parseFloat(etape.montantReel)} 
                      />
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono text-[11px] text-text-placeholder">
                  {etape.montantTheorique
                    ? `${parseFloat(etape.montantTheorique).toLocaleString('fr-FR')} €`
                    : <span className="text-placeholder">—</span>}
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-text-primary text-[13px]">
                  {parseFloat(etape.montantReel) > 0
                    ? `${parseFloat(etape.montantReel).toLocaleString('fr-FR')} €`
                    : <span className="text-placeholder">—</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  {(parseFloat(etape.montantReel) > 0 || parseFloat(etape.montantTheorique || '0') > 0) ? (
                    <EcartBadge value={ecartMontant} suffix="€" />
                  ) : (
                    <span className="text-placeholder">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono text-[11px] text-text-secondary">
                  {etape.nbJoursPrevu != null ? `${etape.nbJoursPrevu} j` : <span className="text-placeholder">—</span>}
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-text-primary text-[13px]">
                  {etape.nbJoursReel > 0 ? `${etape.nbJoursReel} j` : <span className="text-placeholder">—</span>}
                </td>
                <td className="py-3 px-4 text-center">
                  {ecartJours != null && (etape.nbJoursReel > 0 || (etape.nbJoursPrevu ?? 0) > 0) ? (
                    <EcartBadge value={ecartJours} suffix="j" />
                  ) : (
                    <span className="text-placeholder">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={cn(
                    'inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[9px] font-bold border transition-all',
                    etape.factures.length > 0
                      ? 'bg-primary text-white border-primary/50'
                      : 'bg-bg-secondary/50 text-placeholder border-border/50'
                  )}>
                    {etape.factures.length}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-bg-secondary/30 border-t border-border/30 font-semibold text-text-primary">
            <td className="py-4 px-4 rounded-bl-[var(--radius)] text-xs tracking-widest uppercase opacity-70" colSpan={2}>Bilan Total</td>
            <td className="py-4 px-4 text-right font-mono text-[11px] text-text-secondary opacity-50">{totalTheorique.toLocaleString('fr-FR')} €</td>
            <td className="py-4 px-4 text-right font-mono text-primary font-bold text-sm tracking-tight">{totalReel.toLocaleString('fr-FR')} €</td>
            <td className="py-4 px-4 text-center"><EcartBadge value={totalReel - totalTheorique} suffix="€" /></td>
            <td className="py-4 px-4 text-right font-mono text-[11px] text-text-secondary opacity-50">{totalJoursPrevu} j</td>
            <td className="py-4 px-4 text-right font-mono text-primary font-bold text-sm tracking-tight">{totalJoursReel} j</td>
            <td className="py-4 px-4 text-center"><EcartBadge value={totalJoursReel - totalJoursPrevu} suffix="j" /></td>
            <td className="py-4 px-4 rounded-br-[var(--radius)]" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
