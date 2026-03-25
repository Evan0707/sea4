import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataList, type Column } from '@/shared/components/ui/DataList';
import SearchBar from '@/shared/components/ui/SearchBar';
import Button from '@/shared/components/ui/Button';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import Popover from '@/shared/components/ui/Popover';
import { Text } from '@/shared/components/ui/Typography';
import { Eye, Download } from '@mynaui/icons-react';
import { formatDate } from '@/shared/utils/dateFormatter';
import { usePageHeader } from '@/shared/context/LayoutContext';
import apiClient from '@/shared/api/client';
import { exportToCSV, type CsvColumn } from '@/shared/utils/csvExporter';


// Type représentant un chantier vu par l'artisan
interface ChantierArtisan {
    noChantier: number;
    nomChantier: string;
    adresse: string;
    cp: string;
    ville: string;
    dateDebut: string;
    dateFin?: string;
    status: string;
    etape: string;
}

export const ArtisanDashboardPage = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [chantiers, setChantiers] = useState<ChantierArtisan[]>([]);
    const [loading, setLoading] = useState(true);

    const handleExport = useCallback(() => {
        const exportColumns: CsvColumn<ChantierArtisan>[] = [
        { key: 'noChantier', header: 'Numero Chantier' },
        { key: 'nomChantier', header: 'Nom Chantier' },
        { key: 'adresse', header: 'Adresse' },
        { key: 'cp', header: 'Code Postal' },
        { key: 'ville', header: 'Ville' },
        { key: 'dateDebut', header: 'Date debut'},
        { key: 'dateFin', header: 'Date fin' },
        { key: 'status', header: 'Statut' },
        { key: 'etape', header: 'Etape' },
        ];
        exportToCSV(chantiers, exportColumns, 'chantiers');
    }, [chantiers]);

    // Configuration des actions du header
    const headerActions = useMemo(() => (
        <Button variant="Secondary" icon={Download} onClick={handleExport}>
            Exporter CSV
        </Button>
    ), [handleExport, navigate]);

    usePageHeader('Mes Projets',
        headerActions
    );

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Récupération des chantiers de l'artisan connecté
    useEffect(() => {
        const fetchChantiers = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/artisan/mes-chantiers`, {
                    params: {
                        search: debouncedSearch,
                        sortOrder,
                    },
                });
                setChantiers(response.data.map((c: any) => ({ ...c, status: c.statut })));
            } catch (err) {
                console.error('Erreur lors de la récupération des chantiers', err);
            } finally {
                setLoading(false);
            }
        };

        fetchChantiers();
    }, [debouncedSearch, sortOrder]);

    // Filtrage côté client en complément
    const filteredChantiers = useMemo(() => {
        if (!debouncedSearch) return chantiers;
        const q = debouncedSearch.toLowerCase();
        return chantiers.filter(
            (c) =>
                c.nomChantier?.toLowerCase().includes(q) ||
                c.ville?.toLowerCase().includes(q) ||
                c.etape?.toLowerCase().includes(q)
        );
    }, [chantiers, debouncedSearch]);

    const columns: Column<ChantierArtisan>[] = [
        {
            key: 'nomChantier',
            header: 'Chantier',
            width: 'flex-1 md:w-[200px] md:flex-none',
            render: (c) => (
                <Text className="font-medium text-sm">
                    {c.nomChantier?.replace(/\s*\(.*?\)/g, '').trim()}
                </Text>
            ),
        },
        {
            key: 'adresse',
            header: 'Adresse',
            width: 'hidden md:block flex-1',
            render: (c) => (
                <Text className="text-sm text-placeholder truncate">
                    {c.adresse}, {c.cp} {c.ville}
                </Text>
            ),
        },
        {
            key: 'etape',
            header: 'Étape',
            width: 'hidden md:flex w-[180px]',
            render: (c) => (
                <Text className="text-sm text-placeholder">{c.etape}</Text>
            ),
        },
        {
            key: 'dateDebut',
            header: 'Date début',
            width: 'hidden md:flex w-[150px]',
            sortable: true,
            render: (c) => (
                <Text className="text-sm font-mono tabular-nums">
                    {formatDate(c.dateDebut)}
                </Text>
            ),
        },
        {
            key: 'status',
            header: 'statut',
            width: 'w-[150px]',
            align: 'right',
            render: (c) => <StatusBadge status={c.status} />,
        },
        {
            key: 'actions',
            header: '',
            width: 'w-[50px]',
            align: 'right',
            render: (c) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Popover>
                        <Popover.Item
                            onClick={() => navigate(`/artisan/${c.noChantier}`)}
                            icon={Eye}
                        >
                            Voir détails
                        </Popover.Item>
                    </Popover>
                </div>
            ),
        },
    ];

    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Rechercher par chantier, ville ou étape..."
                    width="w-full md:w-[350px]"
                    className="mb-5"
                />

            <DataList
                data={filteredChantiers}
                columns={columns}
                loading={loading}
                sortColumn="dateDebut"
                sortDirection={sortOrder}
                onSort={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                keyExtractor={(item) => `${item.noChantier}-${item.etape}`}
                onRowClick={(item) => navigate(`/artisan/${item.noChantier}`)}
                emptyMessage="Aucun projet trouvé"
            />
        </div>
    );
};

export default ArtisanDashboardPage;