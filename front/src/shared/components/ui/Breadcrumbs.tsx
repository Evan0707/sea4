import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from '@mynaui/icons-react';

export interface BreadcrumbItem {
 label: string;
 path?: string;
}

interface BreadcrumbsProps {
 items?: BreadcrumbItem[];
 home?: boolean;
}

const ROUTE_LABELS: Record<string, string> = {
 admin: 'Tableau de bord',
 commercial: 'Tableau de bord',
 dashboard: 'Tableau de bord',
 users: 'Utilisateurs',
 utilisateurs: 'Utilisateurs',
 artisans: 'Artisans',
 chantiers: 'Chantiers',
 dossiers: 'Dossiers',
 clients: 'Clients',
 factures: 'Factures',
 settings: 'Paramètres',
 profile: 'Profil',
 new: 'Nouveau',
 edit: 'Modification',
 maitre_doeuvre: 'Tableau de bord',
 'maitre-doeuvre': 'Tableau de bord',
};

// Paths that should not be clickable (likely redirecting roots)
const NON_CLICKABLE_PATHS = ['/admin', '/commercial', '/maitre-doeuvre'];

export const Breadcrumbs = ({ items, home = true }: BreadcrumbsProps) => {
 const location = useLocation();

 const breadcrumbs = items || (() => {
  const pathnames = location.pathname.split('/').filter((x) => x);
  return pathnames.map((value, index) => {
   const to = `/${pathnames.slice(0, index + 1).join('/')}`;
   const isLast = index === pathnames.length - 1;

   let label = ROUTE_LABELS[value.toLowerCase()] || value;

   if (!ROUTE_LABELS[value.toLowerCase()]) {
    if (!isNaN(Number(value))) {
     label = `#${value}`;
    } else {
     label = value.charAt(0).toUpperCase() + value.slice(1);
    }
   }

   // Check if path is in non-clickable list
   const isClickable = !isLast && !NON_CLICKABLE_PATHS.includes(to);

   return { label, path: isClickable ? to : undefined };
  });
 })();

 return (
  <nav aria-label="Breadcrumb" className="flex items-center text-sm text-placeholder">
   <ol className="flex items-center gap-1.5 flex-wrap">
    {home && (
     <li>
      <Link
       to="/"
       className="flex items-center hover:text-primary transition-colors"
       title="Accueil"
      >
       <Home className="w-4 h-4" />
      </Link>
     </li>
    )}

    {breadcrumbs.map((item, index) => (
     <li key={index} className="flex items-center gap-1.5">
      {(home || index > 0) && (
       <ChevronRight className="w-3 h-3 text-placeholder/50" />
      )}
      {item.path ? (
       <Link
        to={item.path}
        className="hover:text-primary transition-colors"
       >
        {item.label}
       </Link>
      ) : (
       <span className="text-text-primary font-medium" aria-current="page">
        {item.label}
       </span>
      )}
     </li>
    ))}
   </ol>
  </nav>
 );
};
