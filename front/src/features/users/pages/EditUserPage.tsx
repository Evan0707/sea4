
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Input from '@/shared/components/ui/Input'
import Button from '@/shared/components/ui/Button'
import { H1, Text } from '@/shared/components/ui/Typography'
import apiClient from '@/shared/api/client'
import { useToast } from '@/shared/hooks/useToast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateUserSchema, type UpdateUserFormData } from '@/shared/utils/validators'
import { useUtilisateur } from '../hooks/useUtilisateurs'
import type { Utilisateur } from '../types'
import Skeleton from '@/shared/components/ui/Skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'


const roles = [
 { value: 'admin', label: 'Administrateur' },
 { value: 'commercial', label: 'Commercial' },
 { value: 'maitre_oeuvre', label: 'Maître d\'œuvre' },
]

const getSafeRole = (role: string | null | undefined): 'admin' | 'commercial' | 'maitre_oeuvre' => {
 if (role === 'admin' || role === 'commercial' || role === 'maitre_oeuvre') {
  return role
 }
 return 'admin'
}

export default function EditUserPage() {
 const { id } = useParams<{ id: string }>()
 const navigate = useNavigate()
 const { addToast } = useToast()

 const { data: userData, isLoading: loadingQuery } = useUtilisateur(id)

 // Configuration du formulaire
 const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateUserFormData>({
  resolver: zodResolver(updateUserSchema),
  defaultValues: { prenom: '', nom: '', login: '', password: '', role: 'admin' }
 })

 // Pré-remplissage du formulaire
 useEffect(() => {
    if (userData) {
     const user = userData as Utilisateur;
   reset({
    prenom: user.prenom || '',
    nom: user.nom || '',
    login: user.login || '',
    role: getSafeRole(user.role),
    password: ''
   })
  }
 }, [userData, reset])

 // Gestion de la soumission du formulaire
 const onSubmit = async (data: UpdateUserFormData) => {
  if (!id) return;

    const payload: {
     login: string;
     nom: string;
     prenom: string;
     password?: string;
    } = {
   login: data.login,
   nom: data.nom,
   prenom: data.prenom,
  }

  if (data.password) {
   payload.password = data.password
  }

  try {
   await apiClient.put(`/admin/utilisateurs/${id}`, payload)
   addToast('Utilisateur mis à jour', 'success')
   navigate('/admin/utilisateurs')
    } catch (err: unknown) {
   console.error(err)
     const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erreur lors de la mise à jour'
   addToast(msg, 'error')
  }
 }

 if (loadingQuery) {
  return (
   <div className="p-6 max-w-4xl mx-auto w-full">
    <Skeleton className="h-10 w-64 mb-6" />
    <Skeleton className="h-[400px] w-full rounded-[var(--radius-lg)]" />
   </div>
  )
 }

 if (!userData) {
  return (
   <div className="p-12 flex flex-col items-center justify-center">
    <Text color="text-secondary" className="mb-4">Utilisateur introuvable</Text>
    <Button variant="Secondary" size="md" onClick={() => navigate('/admin/utilisateurs')}>Retour à la liste</Button>
   </div>
  )
 }

 return (
  <div className="p-6 flex flex-col max-w-4xl mx-auto w-full">
    <div className="mb-6">
     <H1>Modifier l'utilisateur</H1>
    </div>

    <Card className="w-full">
      <CardHeader>
        <CardTitle>Détails du compte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Info Rôle Read-only */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-[var(--radius)]">
           <Text variant="small" className="text-primary font-medium">
            Le rôle de l'utilisateur ({roles.find(r => r.value === userData.role)?.label || userData.role}) ne peut pas être modifié.
           </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Input
            label="Prénom *"
            name="prenom"
            type="text"
            placeholder="John"
            register={register('prenom')}
            error={errors.prenom?.message}
           />

           <Input
            label="Nom *"
            name="nom"
            type="text"
            placeholder="Doe"
            register={register('nom')}
            error={errors.nom?.message}
           />
          </div>

          <Input
           label="Login *"
           name="login"
           type="text"
           register={register('login')}
           error={errors.login?.message}
          />

          <Input
           label="Nouveau mot de passe"
           name="password"
           type="password"
           placeholder="Laisser vide pour conserver l'actuel"
           register={register('password')}
           error={errors.password?.message}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
           <Button variant="Secondary" type="button" size="md" onClick={() => navigate('/admin/utilisateurs')}>Annuler</Button>
           <Button variant="Primary" type="submit" size="md" loading={isSubmitting}>Enregistrer les modifications</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
 )
}
