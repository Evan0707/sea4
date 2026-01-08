import { useMemo, useCallback } from 'react';
import { useUtilisateur } from '../hooks/useUtilisateurs';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '@/shared/api/client';
import { Text } from '@/shared/components/ui/Typography';
import Button from '@/shared/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { ArrowLeft, Pencil, Trash, User, At, Shield } from '@mynaui/icons-react';
import { useToast } from '@/shared/hooks/useToast';
import { usePageHeader } from '@/shared/context/LayoutContext';
import ConfirmPopover from '@/shared/components/ui/ConfirmPopover';
import { motion } from 'framer-motion';
import Skeleton from '@/shared/components/ui/Skeleton';

interface UserDetail {
  noUtilisateur: number;
  login: string;
  nom: string;
  prenom: string;
  role: string;
}

// Fonction de récupération du style du badge en fonction du rôle
const getRoleBadgeStyle = (role: string) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'maitre_oeuvre':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'commercial':
      return 'bg-green-500/10 text-green-600 border-green-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
};

// Fonction de récupération des initiales
const getInitials = (prenom: string | null | undefined, nom: string | null | undefined) => {
  const first = prenom?.charAt(0)?.toUpperCase() || '';
  const last = nom?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
};

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: userData, isLoading: loading } = useUtilisateur(id);
  const user = (Array.isArray(userData) ? userData.find((u: any) => u.noUtilisateur === Number(id)) : userData) as UserDetail | undefined | null;

  // Gestion de la suppression de l'utilisateur
  const handleDelete = useCallback(async () => {
    try {
      await apiClient.delete(`/admin/utilisateurs/${id}`);
      addToast('Utilisateur supprimé', 'success');
      navigate('/admin/utilisateurs');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.details || error.response?.data?.error || "Erreur lors de la suppression";
      addToast(msg, "error");
    }
  }, [id, navigate, addToast]);

  // Gestion des actions dans le header
  const headerActions = useMemo(() => (
    <div className="flex gap-2">
      <ConfirmPopover
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible."
        onConfirm={handleDelete}
        confirmText="Supprimer"
      >
        <Button variant="Destructive" icon={Trash}>
          Supprimer
        </Button>
      </ConfirmPopover>
      <Button variant="Primary" icon={Pencil} onClick={() => navigate(`/admin/utilisateurs/${id}/edit`)}>
        Modifier
      </Button>
    </div>
  ), [id, navigate, handleDelete]);

  // Gestion de l'en-tête
  usePageHeader(
    user ? `${user.prenom || ''} ${user.nom || ''}`.trim() || user.login : 'Chargement...',
    headerActions,
    user?.role ? `Rôle : ${user.role.replace('_', ' ')}` : undefined
  );

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-40" />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="p-4 bg-bg-secondary rounded-full mb-4">
          <User className="w-12 h-12 text-placeholder" />
        </div>
        <Text className="text-xl font-semibold text-text-primary mb-2">Utilisateur introuvable</Text>
        <Text className="text-placeholder mb-6">L'utilisateur demandé n'existe pas ou a été supprimé.</Text>
        <Button variant="Secondary" icon={ArrowLeft} onClick={() => navigate('/admin/utilisateurs')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-8 max-w-3xl mx-auto space-y-6"
    >
      <Button variant="Secondary" icon={ArrowLeft} onClick={() => navigate('/admin/utilisateurs')}>
        Retour à la liste
      </Button>

      {/* Profile Card */}
      <Card>
        <CardHeader className="border-b border-border pb-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {getInitials(user.prenom, user.nom)}
            </div>

            {/* Name and Role */}
            <div className="flex-1">
              <CardTitle className="text-2xl mb-1">
                {user.prenom || user.nom ? `${user.prenom || ''} ${user.nom || ''}`.trim() : user.login}
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeStyle(user.role)}`}>
                  <Shield className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
                  {user.role?.replace('_', ' ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Login */}
            <div className="p-4 bg-bg-secondary/50 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <At className="w-4 h-4 text-placeholder" />
                <Text className="text-sm text-placeholder font-medium">Identifiant</Text>
              </div>
              <Text className="text-lg font-semibold text-text-primary">{user.login}</Text>
            </div>

            {/* User ID */}
            <div className="p-4 bg-bg-secondary/50 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-placeholder" />
                <Text className="text-sm text-placeholder font-medium">ID Utilisateur</Text>
              </div>
              <Text className="text-lg font-semibold text-text-primary font-mono">#{user.noUtilisateur}</Text>
            </div>

            {/* Prénom */}
            <div className="p-4 bg-bg-secondary/50 rounded-xl border border-border/50">
              <Text className="text-sm text-placeholder font-medium mb-2">Prénom</Text>
              <Text className="text-lg font-semibold text-text-primary">{user.prenom || <span className="text-placeholder">Non renseigné</span>}</Text>
            </div>

            {/* Nom */}
            <div className="p-4 bg-bg-secondary/50 rounded-xl border border-border/50">
              <Text className="text-sm text-placeholder font-medium mb-2">Nom</Text>
              <Text className="text-lg font-semibold text-text-primary">{user.nom || <span className="text-placeholder">Non renseigné</span>}</Text>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserDetailPage;

