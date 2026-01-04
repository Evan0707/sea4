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


export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch('http://localhost:8000/api/login_check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.email,
          password: data.password
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        addToast(error.message || 'Identifiants incorrects', 'error');
        throw new Error(error.message || 'Échec de connexion');
      }

      const { token } = await response.json();
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
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error && !error.message.includes('Échec de connexion')) {
        addToast('Une erreur est survenue lors de la connexion', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center mb-10">
        <img src={logo} alt="" width={60} />
        <h3 className="text-4xl text-text-primary font-bold mt-2">Bati’parti</h3>
      </div>
      <Card className="max-w-[500px] w-full relative">
        <CardHeader>
          <CardTitle className="text-3xl text-center mb-2">Autentifiez -vous a Bati’Parti</CardTitle>
          <CardDescription className="text-center text-lg">Autentifiez -vous à Bati’Parti</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Login"
              type="text"
              name="email"
              register={register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Mot de passe"
              type="password"
              name="password"
              register={register("password")}
              error={errors.password?.message}
            />
            {/* <Link to={'/login'} className="text-sm text-primary font-bold w-full">{'Identifant oublié ? Contactez l’administrateur >'}</Link> */}
            <Button
              variant="Primary"
              classname="w-full mt-4"
              loading={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              Se connecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};