import { DangerCircle } from '@mynaui/icons-react'

interface statusProps{
    label:'À venir'|'Terminé'|'Complété'|'En chantier'|'À compléter'
}

const Status = ({label}:statusProps) => {

    const variant = label=='Complété'&&'border-[1.5px] border-[#85FA81] text-[#208900] bg-[#E9FFF0]'
    ||label=='Terminé'&&'border-[1.5px] border-[#85FA81] text-[#208900] bg-[#E9FFF0]'
    ||label=='En chantier'&&'border-[1.5px] border-[#FF6803] text-[#FF6803] bg-[#FF6803]/10'
    ||label=='À venir'&&'border-[1.5px] border-primary text-primary bg-primary/10'
    ||label=='À compléter'&&'border-[1.5px] border-red text-red bg-red-bg'

  return (
    <div className='flex items-center'>
        {label=='À compléter'&&<DangerCircle size={24} className='text-red mr-1'/>}
        <p className={`h-[24px] text-[12px] flex items-center justify-center w-[90px] rounded-2xl ${variant}`}>{label}</p>
    </div>
  )
}

export default Status