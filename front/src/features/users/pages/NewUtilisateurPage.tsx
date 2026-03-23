
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
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card'


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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erreur lors de la création'
      addToast(msg, 'error')
    }
  }

  return (
    <div className="p-6 h-full flex flex-col max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <H1 className="mb-2">Nouvel utilisateur</H1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Identifiants et rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                type="text"
                name="prenom"
                placeholder="John"
                register={register('prenom')}
                error={errors.prenom?.message}
                required
              />

              <Input
                label="Nom"
                type="text"
                name="nom"
                placeholder="Doe"
                register={register('nom')}
                error={errors.nom?.message}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Login"
                type="text"
                name="login"
                register={register('login')}
                onChange={() => setIsLoginEdited(true)}
                error={errors.login?.message}
                required
              />

              <Input
                label="Mot de passe"
                type="password"
                name="password"
                register={register('password')}
                error={errors.password?.message}
                required
              />
            </div>

            <Select
              name="role"
              label="Rôle"
              options={roles}
              register={register('role')}
              error={errors.role?.message}
              required
              info
              message="Le rôle définit les droits d'accès de l'utilisateur aux différentes sections de l'application."
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
              <Button 
                variant="Secondary" 
                type="button"
                size="md"
                onClick={() => navigate('/admin/utilisateurs')}
              >
                Annuler
              </Button>
              <Button 
                variant="Primary" 
                type="submit" 
                size="md"
                loading={isSubmitting}
              >
                Créer l'utilisateur
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
