import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '@/shared/components/ui/Input'
import Button from '@/shared/components/ui/Button'
import { H1 } from '@/shared/components/ui/Typography'
import apiClient from '@/shared/api/client'
import { useToast } from '@/shared/hooks/useToast'
import Select from '@/shared/components/ui/Select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserFormData } from '@/shared/utils/validators'


const roles = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'maitre_oeuvre', label: 'Maître d\'œuvre' },
]

export default function NewUtilisateurPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Configuration du formulaire
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { prenom: '', nom: '', login: '', password: '', role: 'admin' }
  })
  const [isLoginEdited, setIsLoginEdited] = useState(false)

  // Fonction de transformation des caractères spéciaux
  const slugify = (s: string) => {
    return s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^\p{L}\p{N}]+/gu, '.')
      .replace(/(^\.|\.$)/g, '')
      .toLowerCase();
  }

  const prenom = watch('prenom')
  const nom = watch('nom')

  // Gestion de la modification du login
  useEffect(() => {
    if (isLoginEdited) return
    const p = (prenom ?? '').trim()
    const n = (nom ?? '').trim()
    if (!p && !n) return
    const candidate = [p, n].filter(Boolean).map(slugify).join('.')
    setValue('login', candidate)
  }, [prenom, nom, isLoginEdited, setValue])

  // Gestion de la soumission du formulaire
  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await apiClient.post('/admin/utilisateurs', data)
      addToast('Utilisateur créé', 'success')
      navigate('/admin/utilisateurs')
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erreur lors de la création'
      addToast(msg, 'error')
    }
  }



  return (
    <div className="p-4 md:p-8 h-screen flex flex-col">
      <H1 className="mb-6">Nouvel utilisateur</H1>

      {/*Début du formulaire*/}

      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl mx-auto space-y-4 bg-bg-secondary p-4 md:p-6 rounded-lg border border-border">
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
          onChange={() => setIsLoginEdited(true)}
          error={errors.login?.message as string | undefined}
        />

        <div className="relative">
          <Input
            label="Mot de passe"
            name="password"
            type="password"
            register={register('password')}
            error={errors.password?.message as string | undefined}
          />
          {/* Popover could be added here properly if needed, but removing broken test code for now */}
        </div>


        <div>
          <Select
            name="role"
            label="Rôle"
            options={roles}
            register={register('role')}
            error={errors.role?.message as string | undefined}
          />
        </div>

        <div className="flex justify-end pr-4 gap-2">
          <Button variant="Secondary" onClick={() => navigate('/admin/utilisateurs')}>Annuler</Button>
          <Button variant="Primary" type="submit" loading={isSubmitting}>Créer</Button>
        </div>
      </form>
    </div>
  )
}
