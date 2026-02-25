import { DangerCircle } from '@mynaui/icons-react'

interface statusProps {
  label: 'À venir' | 'Terminé' | 'Complété' | 'En chantier' | 'À compléter'
}

const Status = ({ label }: statusProps) => {

  const variant = label === 'Complété' && 'bg-bg-secondary text-green-700 border-green-200'
    || label === 'Terminé' && 'bg-gray-secondary text-green-700 border'
    || label === 'En chantier' && 'bg-bg-secondary text-orange-700 border'
    || label === 'À venir' && 'bg-bg-secondary text-blue-700 border'
    || label === 'À compléter' && 'bg-bg-secondary text-red-700 border'

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