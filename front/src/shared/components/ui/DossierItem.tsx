import Status from './Status'

interface DossierItemProps{
    nom:string
    prenom:string
    address:string
    cp:string
    ville:string
    start:string
    status:'À venir'|'Terminé'|'Complété'|'En chantier'|'À compléter'
}

const DossierItem = ({nom,prenom,address,cp,ville,start,status}:DossierItemProps) => {
  return (
    <div className='flex items-center justify-between py-3 px-5 w-full bg-border/20 rounded-lg' >
        <p className='truncate w-[150px] font-medium' >{nom} {prenom}</p>
        <p className='truncate w-[300px] text-placeholder' >{address},{cp},{ville}</p>
        <p className='truncate w-[100px] font-medium' >{start}</p>
        <Status label={status} />
    </div>
  )
}

export default DossierItem