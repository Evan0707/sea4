import { DangerCircle } from '@mynaui/icons-react'

interface statusProps {
  label: 'À venir' | 'Terminé' | 'Complété' | 'En chantier' | 'À compléter'
}

const Status = ({ label }: statusProps) => {

  const variant = label === 'Complété' && 'bg-green-50 text-green-700 border-green-200'
    || label === 'Terminé' && 'bg-green-50 text-green-700 border-green-200'
    || label === 'En chantier' && 'bg-orange-50 text-orange-700 border-orange-200'
    || label === 'À venir' && 'bg-blue-50 text-blue-700 border-blue-200'
    || label === 'À compléter' && 'bg-red-50 text-red-700 border-red-200'

  return (
    <div className='flex items-center'>
      {label === 'À compléter' && <DangerCircle size={16} className='text-red-700 mr-1.5' />}
      <span className={`px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${variant}`}>
        {label}
      </span>
    </div>
  )
}

export default Status