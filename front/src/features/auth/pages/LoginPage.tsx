
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/shared/components/ui/Input";
import Button from "@/shared/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useToast } from "@/shared/hooks/useToast";
import { jwtDecode } from 'jwt-decode';
import type { JWTPayload } from '@/shared/types/auth';
import logo from '@/shared/assets/Logo.svg'
import { loginSchema, type LoginFormData } from "@/shared/utils/validators";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/shared/components/ui/Card';
import apiClient from '@/shared/api/client';
import { motion } from 'framer-motion';


export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Fonction de soumission du formulaire
  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await apiClient.post('/login_check', {
        username: data.email,
        password: data.password,
      });

      const { token } = response.data;
      login(token);

      const decodedToken = jwtDecode<JWTPayload>(token);
      const roleRedirects = {
        'ROLE_ADMIN': '/admin',
        'ROLE_COMMERCIAL': '/commercial',
        'ROLE_MAITRE_OEUVRE': '/maitre-doeuvre'
      };

      for (const [role, path] of Object.entries(roleRedirects)) {
        if (decodedToken.roles.includes(role)) {
          addToast('Connexion réussie', 'success');
          navigate(path);
          break;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Login error:", error);
      addToast(error.response?.data?.message || 'Identifiants incorrects', 'error');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Geometric Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] dark:opacity-[0.25]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--color-border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 0%, transparent 80%)'
          }}
        />
      </div>
      <div className="relative z-10 w-full max-w-[440px] px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-16 h-16 bg-bg-secondary/50 backdrop-blur-md dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-none flex items-center justify-center p-3 mb-4 border border-border/50 dark:border-white/10">
            <img src={logo} alt="Bati'Parti Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-white tracking-tight">Bati’parti</h1>
          <p className="text-text-secondary dark:text-slate-400 text-sm mt-1">Gestion de chantiers simplifiée</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card variant="glass" className="overflow-hidden shadow-2xl dark:shadow-black/50">
            <CardHeader className="pt-8 pb-4">
              <CardTitle className="text-2xl text-center text-text-primary dark:text-white">Bienvenue</CardTitle>
              <CardDescription className="text-center text-text-secondary dark:text-slate-400">
                Connectez-vous à votre compte pour continuer
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Nom d'utilisateur"
                  name="email"
                  type="text"
                  placeholder="Identifiant"
                  register={register('email')}
                  error={errors.email?.message}
                  required
                />

                <div className="space-y-1">
                  <Input
                    label="Mot de passe"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    register={register('password')}
                    error={errors.password?.message}
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline transition-all"
                      onClick={() => addToast('Veuillez contacter votre administrateur', 'info')}
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                </div>

                <Button
                  variant="Primary"
                  className="w-full mt-2 shadow-lg shadow-primary/20"
                  size="md"
                  type="submit"
                  loading={isSubmitting}
                >
                  Se connecter
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-text-secondary text-xs mt-8"
        >
          © {new Date().getFullYear()} Bati’parti. Tous droits réservés.
        </motion.p>
      </div>
    </div>
  );
};