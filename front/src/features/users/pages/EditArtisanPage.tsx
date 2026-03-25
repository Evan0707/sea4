import { useState, useEffect } from 'react';
import Skeleton from '@/shared/components/ui/Skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import apiClient from '@/shared/api/client';
import Input from '@/shared/components/ui/Input';
import { usePageHeader } from '@/shared/context/LayoutContext';
import { Text, H1 } from '@/shared/components/ui/Typography';
import { AddressAutocomplete } from '@/shared/components/ui/AddressAutocomplete';
import Button from '@/shared/components/ui/Button';
import EtapeMultiSelect from '@/shared/components/ui/EtapeMultiSelect';
import { useToast } from '@/shared/hooks/useToast';
import { artisanSchema, type ArtisanFormData } from '@/shared/utils/validators';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';

interface Etape { noEtape: number; nomEtape: string }

const EditArtisanPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [etapes, setEtapes] = useState<Etape[]>([]);
    const [nomDisplay, setNomDisplay] = useState('...');
    // ✅ AJOUT : état pour afficher/masquer la section mot de passe
    const [showPasswordSection, setShowPasswordSection] = useState(false);

    usePageHeader(
        "Modifier l'Artisan",
        null,
        `Édition des informations de ${nomDisplay}`
    );

    const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<ArtisanFormData>({
        resolver: zodResolver(artisanSchema),
        defaultValues: {
            nomArtisan: '',
            prenomArtisan: '',
            emailArtisan: '',
            telArtisan: '',
            adresseArtisan: '',
            cpArtisan: '',
            villeArtisan: '',
            // ✅ AJOUT
            newPassword: '',
            confirmPassword: '',
        }
    });

    const adresseArtisan = watch('adresseArtisan');

    useEffect(() => {
        const fetch = async () => {
            if (!id || isNaN(Number(id))) {
                toast.addToast('Identifiant invalide', 'error');
                navigate('/admin/artisans');
                return;
            }
            try {
                const res = await apiClient.get(`/artisan/${id}`);
                const a = res.data;
                reset({
                    nomArtisan: a.nomArtisan || '',
                    prenomArtisan: a.prenomArtisan || '',
                    emailArtisan: a.emailArtisan || '',
                    telArtisan: a.telArtisan || '',
                    adresseArtisan: a.adresseArtisan || '',
                    cpArtisan: a.cpArtisan || '',
                    villeArtisan: a.villeArtisan || '',
                    newPassword: '',
                    confirmPassword: '',
                });
                setEtapes(a.etapes || []);
                setNomDisplay(`${a.prenomArtisan || ''} ${a.nomArtisan || ''}`.trim());
            } catch {
                toast.addToast("Impossible de récupérer les informations de l'artisan", 'error');
                navigate('/admin/artisans');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id, navigate, toast, reset]);

    const onSubmit = async (data: ArtisanFormData) => {
        if (!id || isNaN(Number(id))) return;
        try {
            await apiClient.put(`/artisan/${id}/edit`, {
                nomArtisan: data.nomArtisan,
                prenomArtisan: data.prenomArtisan || undefined,
                emailArtisan: data.emailArtisan || undefined,
                telArtisan: data.telArtisan || undefined,
                adresseArtisan: data.adresseArtisan || undefined,
                cpArtisan: data.cpArtisan || undefined,
                villeArtisan: data.villeArtisan || undefined,
                etapes,
                // ✅ AJOUT : on n'envoie le mot de passe que s'il est renseigné
                ...(data.newPassword ? { newPassword: data.newPassword } : {}),
            });
            toast.addToast('Artisan mis à jour avec succès', 'success');
            navigate('/admin/artisans');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            toast.addToast(err.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto w-full">
                <div className="mb-6 space-y-2">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-[var(--radius-lg)]" />
            </div>
        );
    }

    return (
        <div className="p-6 h-full flex flex-col max-w-4xl mx-auto w-full overflow-y-auto">
            <div className="mb-6">
                <H1>Modifier l'artisan</H1>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Détails de {nomDisplay}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="text"
                                label="Nom"
                                name="nomArtisan"
                                register={register('nomArtisan')}
                                error={errors.nomArtisan?.message}
                                required
                            />
                            <Input
                                type="text"
                                label="Prénom"
                                name="prenomArtisan"
                                register={register('prenomArtisan')}
                                error={errors.prenomArtisan?.message}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="email"
                                label="Email"
                                name="emailArtisan"
                                placeholder="contact@artisan.com"
                                register={register('emailArtisan')}
                                error={errors.emailArtisan?.message}
                            />
                            <Input
                                type="tel"
                                label="Téléphone"
                                name="telArtisan"
                                placeholder="06 12 34 56 78"
                                register={register('telArtisan')}
                                error={errors.telArtisan?.message}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Text variant="small" className="font-semibold text-text-primary uppercase tracking-wider">Localisation</Text>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                            <div>
                                <AddressAutocomplete
                                    label="Adresse"
                                    value={adresseArtisan}
                                    onChange={(value) => setValue('adresseArtisan', value)}
                                    onAddressSelect={(address) => {
                                        setValue('adresseArtisan', address.label);
                                        setValue('cpArtisan', address.postcode);
                                        setValue('villeArtisan', address.city);
                                    }}
                                    info
                                    message="Commencez à taper l'adresse pour voir les suggestions de localisation précise."
                                    placeholder="123 rue de la Paix"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    type="text"
                                    label="Code postal"
                                    name="cpArtisan"
                                    register={register('cpArtisan')}
                                    error={errors.cpArtisan?.message}
                                    required
                                />
                                <Input
                                    type="text"
                                    label="Ville"
                                    name="villeArtisan"
                                    register={register('villeArtisan')}
                                    error={errors.villeArtisan?.message}
                                    required
                                />
                            </div>
                        </div>

                        {/* Section mot de passe */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Text variant="small" className="font-semibold text-text-primary uppercase tracking-wider">Sécurité</Text>
                                <div className="h-px flex-1 bg-border" />
                                <Button
                                    type="button"
                                    variant="Secondary"
                                    size="sm"
                                    onClick={() => {
                                        setShowPasswordSection((prev) => !prev);
                                        if (showPasswordSection) {
                                            setValue('newPassword', '');
                                            setValue('confirmPassword', '');
                                        }
                                    }}
                                >
                                    {showPasswordSection ? 'Annuler' : 'Modifier le mot de passe'}
                                </Button>
                            </div>

                            {showPasswordSection && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        type="password"
                                        label="Nouveau mot de passe"
                                        name="newPassword"
                                        placeholder="••••••••"
                                        register={register('newPassword')}
                                        error={errors.newPassword?.message}
                                        required
                                    />
                                    <Input
                                        type="password"
                                        label="Confirmer le mot de passe"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        register={register('confirmPassword')}
                                        error={errors.confirmPassword?.message}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Text variant="small" className="font-semibold text-text-primary uppercase tracking-wider">Qualifications</Text>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                            <EtapeMultiSelect
                                label="Domaines d'intervention"
                                value={etapes}
                                onChange={(items) => setEtapes(items)}
                                info
                                message="Sélectionnez les étapes ou corps de métier sur lesquels cet artisan intervient par défaut."
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                            <Button
                                type="button"
                                variant="Secondary"
                                size="md"
                                onClick={() => navigate('/admin/artisans')}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="Primary"
                                size="md"
                                loading={isSubmitting}
                            >
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditArtisanPage;