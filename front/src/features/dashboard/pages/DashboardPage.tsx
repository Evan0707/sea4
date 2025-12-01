// import { useToast } from "@/shared/hooks/useToast";
// import { useState } from "react";
import { H1 } from "@/shared/components/ui/Typography";
// import FilterPopover from "@/shared/components/ui/FilterPopover";
// import Button from "@/shared/components/ui/Button";
// import Popover from "@/shared/components/ui/Popover";
// import { DotsVerticalSolid, Edit, Trash } from "@mynaui/icons-react";

export const DashboardPage = () => {
  // const {addToast} = useToast()
  // const [status, setStatus] = useState('all')
  // const [premium, setPremium] = useState(false)
  // const [price, setPrice] = useState(50)

  return (
    <div className="p-8">
      <H1 className="mb-6">Tableau de bord</H1>
      {/* <FilterPopover
        trigger={<Button variant="Primary">Filtres</Button>}
        onApply={() => console.log('Apply')}
        onReset={() => { setStatus('all'); setPremium(false); setPrice(50) }}
      >
        <FilterPopover.Radio
          label="Statut"
          name="status"
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'active', label: 'Actif' },
            { value: 'inactive', label: 'Inactif' }
          ]}
          value={status}
          onChange={setStatus}
        />

        <FilterPopover.Checkbox
          label="Premium uniquement"
          checked={premium}
          onChange={setPremium}
        />

        <FilterPopover.Range
          label="Prix maximum"
          min={0}
          max={100}
          value={price}
          onChange={setPrice}
        />
      </FilterPopover> */}



      
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