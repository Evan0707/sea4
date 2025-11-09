import { useToast } from "../../context/useToast";
// import Popover from "../../components/Popover";
// import { DotsVerticalSolid, Edit, Trash } from "@mynaui/icons-react";

export const DashboardPage = () => {
  const {addToast} = useToast()
  
 
  return (
    <div className="p-8">
      <h1 onClick={()=>addToast('Notif box','info')} className="text-2xl font-bold mb-6">Tableau de bord</h1>
        {/* <Popover icon={DotsVerticalSolid} iconSize={28}>
          <Popover.Item icon={Edit} onClick={() => console.log('Éditer')}>
            Éditer
          </Popover.Item>
          <Popover.Item icon={Trash} variant="destructive" onClick={() => console.log('Supprimer')}>
            Supprimer
          </Popover.Item>
        </Popover> */}
    </div>
  );
};