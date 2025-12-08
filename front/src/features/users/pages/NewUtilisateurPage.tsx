import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '@/shared/components/ui/Input'
import Button from '@/shared/components/ui/Button'
import { H1 } from '@/shared/components/ui/Typography'
import axios from 'axios'
import { useToast } from '@/shared/hooks/useToast'
import Select from '@/shared/components/ui/Select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserFormData } from '@/shared/utils/validators'
import Popover from '@/shared/components/ui/Popover'

const roles = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'maitre_oeuvre', label: 'Maître d\'œuvre' },
]

export default function NewUtilisateurPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { prenom: '', nom: '', login: '', password: '', role: 'admin' }
  })
  const [isLoginEdited, setIsLoginEdited] = useState(false)

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

  useEffect(() => {
    if (isLoginEdited) return
    const p = (prenom ?? '').trim()
    const n = (nom ?? '').trim()
    if (!p && !n) return
    const candidate = [p, n].filter(Boolean).map(slugify).join('.')
    setValue('login', candidate)
  }, [prenom, nom, isLoginEdited, setValue])

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await axios.post('/admin/utilisateurs', data)
      addToast('Utilisateur créé', 'success')
      navigate('/admin/utilisateurs')
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Erreur lors de la création'
      addToast(msg, 'error')
    }
  }

    {/* Ajouter un toast*/}
    const tipToast = () => {
      const tips = "Mettez un mot de passe fort s'il vous plaît !"
      addToast(tips, 'info');
      }
    
      {/* Ajouter un pop-up comme sur le filtre */}
      const tipPopoverPassword = () => {
        
      }
    

  return (
    <div className="p-8 h-screen flex flex-col">
      <H1 className="mb-6">Nouvel utilisateur</H1>

          {/*Début du formulaire*/}
    
    {
      /*
        Objectif :
        - Faire en sorte que le nom et le prénom sois
          côte à côte et que lorsque l'écran est trop petit, les
          mettre l'un au-dessus de l'autre
        
        - Faire en sorte que lorsque l'on saisi un mot de passe,
          un pop-up apparaît pour donner un conseil
      */
    }

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3/5 space-y-4 bg-bg-secondary p-6 rounded-lg">
        <Input
          label="Prénom"
          name="prenom"
          type="text"
          placeholder="Entrez votre nom s'il vous plaît"
          register={register('prenom')} error={errors.prenom?.message as string | undefined}
        />

        <Input
          label="Nom"
          name="nom"
          type="text"
          placeholder="Entrez votre prénom s'il vous plaît"
          register={register('nom')} error={errors.nom?.message as string | undefined}
        />

        <Input
          label="Login"
          name="login"
          type="text"
          register={register('login')} onChange={() => setIsLoginEdited(true)} error={errors.login?.message as string | undefined}
        />

        <Input
          label="Mot de passe"
          name="password"
          type="password"
          onFocus={tipToast}
          register={register('password')} error={errors.password?.message as string | undefined}
        />

        {/* Test pour le Popover */}

        <div className="relative">
          <div className="flex items-center gap-2">
            <Input 
              label="Mot de passe" 
              name="password" 
              type="password" 
              register={register('password')} 
              error={errors.password?.message as string | undefined} 
            />
            <Popover>
              <div className="p-3 bg-white rounded shadow-lg max-w-xs">
              <p className="font-semibold mb-2">Conseils pour un mot de passe fort :</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Au moins 12 caractères</li>
                  <li>Majuscules et minuscules</li>
                  <li>Chiffres et caractères spéciaux</li>
                  <li>Privilégiez quelque chose de long
                    plutôt que quelque chose de compliqué</li>
                </ul>
              </div>
            </Popover>
          </div>
        </div>

        {/* Fin de test pour le Popover */}


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
