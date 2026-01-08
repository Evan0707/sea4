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
import Skeleton from '@/shared/components/ui/Skeleton'
import { ArrowLeft } from '@mynaui/icons-react'

const roles = [
 { value: 'admin', label: 'Administrateur' },
 { value: 'commercial', label: 'Commercial' },
 { value: 'maitre_oeuvre', label: 'Maître d\'œuvre' },
]

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
  if (userData && !Array.isArray(userData)) {
   const user = userData as any;
   reset({
    prenom: user.prenom || '',
    nom: user.nom || '',
    login: user.login || '',
    role: user.role,
    password: ''
   })
  }
 }, [userData, reset])

 // Gestion de la soumission du formulaire
 const onSubmit = async (data: UpdateUserFormData) => {
  if (!id) return;

  const payload: any = {
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
  } catch (err: any) {
   console.error(err)
   const msg = err?.response?.data?.error || 'Erreur lors de la mise à jour'
   addToast(msg, 'error')
  }
 }

 if (loadingQuery) {
  return (
   <div className="p-4 md:p-8 h-screen flex flex-col">
    <Skeleton className="h-10 w-64 mb-6" />
    <Skeleton className="h-[400px] w-full max-w-3xl mx-auto rounded-lg bg-bg-secondary" />
   </div>
  )
 }

 if (!userData) {
  return (
   <div className="p-8 flex flex-col items-center justify-center">
    <Text>Utilisateur introuvable</Text>
    <Button variant="Secondary" classname="mt-4" onClick={() => navigate('/admin/utilisateurs')}>Retour</Button>
   </div>
  )
 }

 return (
  <div className="p-4 md:p-8 h-screen flex flex-col">
   <div className="flex items-center gap-4 mb-6">

    <H1>Modifier l'utilisateur</H1>
   </div>

   <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl mx-auto space-y-4 bg-bg-secondary p-4 md:p-6 rounded-lg border border-border">

    {/* Info Rôle Read-only */}
    <div className="bg-primary/5 border border-primary/20 p-4 rounded-md mb-4">
     <Text variant="small" className="text-primary font-medium">
      Le rôle de l'utilisateur ne peut pas être modifié.
     </Text>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
     <Input
      label="Prénom"
      name="prenom"
      type="text"
      placeholder="John"
      register={register('prenom')}
      error={errors.prenom?.message as string | undefined}
     />

     <Input
      label="Nom"
      name="nom"
      type="text"
      placeholder="Doe"
      register={register('nom')}
      error={errors.nom?.message as string | undefined}
     />
    </div>

    <Input
     label="Login"
     name="login"
     type="text"
     register={register('login')}
     error={errors.login?.message as string | undefined}
    />

    <div className="relative">
     <Input
      label="Nouveau mot de passe (optionnel)"
      name="password"
      type="password"
      placeholder="Laisser vide pour conserver le mot de passe actuel"
      register={register('password')}
      error={errors.password?.message as string | undefined}
     />
    </div>

    <div>
     {/* If Select doesn't support disabled, we render a disabled mock or use Input readOnly if Select is just for role which is now fixed */}
     {/* Let's try to see if I can simply render a readonly Input for Role instead of Select, since it's unchangeable */}
     <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">Rôle</label>
      <div className="flex h-10 w-full rounded-md border border-input bg-bg-primary px-3 py-2 text-sm text-text-secondary opacity-50 cursor-not-allowed">
       {roles.find(r => r.value === userData.role)?.label || userData.role}
      </div>
     </div>
     {/* Hidden input to keep form logic if needed, but we don't send role anyway */}
    </div>

    <div className="flex justify-end pr-4 gap-2 pt-4">
     <Button variant="Secondary" type="button" onClick={() => navigate('/admin/utilisateurs')}>Annuler</Button>
     <Button variant="Primary" type="submit" loading={isSubmitting}>Enregistrer</Button>
    </div>
   </form>
  </div>
 )
}
