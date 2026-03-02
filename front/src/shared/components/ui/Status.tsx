import { DangerCircle } from '@mynaui/icons-react'

interface statusProps {
  label: 'À venir' | 'Terminé' | 'Complété' | 'En chantier' | 'À compléter'
}

const Status = ({ label }: statusProps) => {

  const variant = label === 'Complété' && 'bg-bg-primary text-green-700 border-green-200'
    || label === 'Terminé' && 'bg-bg-primary text-green-500 border-green-500'
    || label === 'En chantier' && 'bg-bg-primary text-orange-500 border-orange-500'
    || label === 'À venir' && 'bg-bg-primary text-blue-500 border-blue-500'
    || label === 'À compléter' && 'bg-bg-primary text-red-500 border-red-500'

  return (
    <div className='flex items-center'>
      {label === 'À compléter' && <DangerCircle size={16} className='text-red-500 bg-bg-primary mr-1.5' />}
      <span className={`px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap bg-bg-primary ${variant}`}>
        {label}
      </span>
    </div>
  )
}

export default Status