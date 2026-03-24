import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Text, H1 } from '@/shared/components/ui/Typography';
import { StatusBadge } from '@/shared/components/ui/StatusBadge';
import Button from '@/shared/components/ui/Button';
import { formatDate } from '@/shared/utils/dateFormatter';
import { usePageHeader } from '@/shared/context/LayoutContext';
import apiClient from '@/shared/api/client';
import { ArrowLeft } from '@mynaui/icons-react';

interface EtapeChantier {
    noEtape: number;
    nomEtape: string;
    dateDebut?: string;
    dateFin?: string;
    status: string;
}

interface ChantierDetail {
    noChantier: number;
    nomChantier: string;
    adresse: string;
    cp: string;
    ville: string;
    dateDebut: string;
    dateFin?: string;
    status: string;
    etapes: EtapeChantier[];
}

export const ArtisanChantierPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [chantier, setChantier] = useState<ChantierDetail | null>(null);
    const [loading, setLoading] = useState(true);

    usePageHeader('Détail du projet');

    useEffect(() => {
        const fetchChantier = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/artisan/mes-chantiers/${id}`);
                setChantier(response.data);
            } catch (err) {
                console.error('Erreur lors de la récupération du chantier', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchChantier();
    }, [id]);

    if (loading) {
        return (
            <div className="p-4 md:p-8 flex items-center justify-center h-full">
                <Text className="text-placeholder">Chargement...</Text>
            </div>
        );
    }

    if (!chantier) {
        return (
            <div className="p-4 md:p-8 flex flex-col items-center justify-center h-full gap-4">
                <Text className="text-placeholder">Chantier introuvable.</Text>
                <Button variant="Secondary" icon={ArrowLeft} onClick={() => navigate('/artisan')}>
                    Retour
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 h-full flex flex-col gap-6">

            {/* Bouton retour */}
            <Button
                variant="Secondary"
                icon={ArrowLeft}
                onClick={() => navigate('/artisan')}
                className="self-start"
            >
                Retour aux projets
            </Button>

            {/* Infos générales */}
            <div className="bg-bg-secondary rounded-lg border border-border p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <H1>{chantier.nomChantier}</H1>
                    <StatusBadge status={chantier.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Text className="text-xs text-placeholder uppercase tracking-wide mb-1">
                            Adresse
                        </Text>
                        <Text className="text-sm">
                            {chantier.adresse}, {chantier.cp} {chantier.ville}
                        </Text>
                    </div>
                    <div>
                        <Text className="text-xs text-placeholder uppercase tracking-wide mb-1">
                            Date de début
                        </Text>
                        <Text className="text-sm font-mono">{formatDate(chantier.dateDebut)}</Text>
                    </div>
                    {chantier.dateFin && (
                        <div>
                            <Text className="text-xs text-placeholder uppercase tracking-wide mb-1">
                                Date de fin
                            </Text>
                            <Text className="text-sm font-mono">{formatDate(chantier.dateFin)}</Text>
                        </div>
                    )}
                </div>
            </div>

            {/* Étapes du chantier */}
            <div className="bg-bg-secondary rounded-lg border border-border p-6 flex flex-col gap-4">
                <Text className="font-semibold text-base">Mes étapes sur ce chantier</Text>

                {chantier.etapes.length === 0 ? (
                    <Text className="text-placeholder text-sm">Aucune étape assignée.</Text>
                ) : (
                    <div className="flex flex-col divide-y divide-border">
                        {chantier.etapes.map((etape) => (
                            <div
                                key={etape.noEtape}
                                className="flex items-center justify-between py-3"
                            >
                                <Text className="text-sm font-medium">{etape.nomEtape}</Text>
                                <div className="flex items-center gap-4">
                                    {etape.dateDebut && (
                                        <Text className="text-sm text-placeholder font-mono">
                                            {formatDate(etape.dateDebut)}
                                            {etape.dateFin ? ` → ${formatDate(etape.dateFin)}` : ''}
                                        </Text>
                                    )}
                                    <StatusBadge status={etape.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default ArtisanChantierPage;