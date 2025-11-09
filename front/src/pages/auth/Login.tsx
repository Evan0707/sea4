import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { jwtDecode } from 'jwt-decode';
import type { JWTPayload } from '../../types/auth';
import logo from '../../assets/Logo.svg'
import { Link } from "react-router-dom";

const loginSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type LoginForm = z.infer<typeof loginSchema>;

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
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
          navigate(path);
          break;
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center mb-10">
        <img src={logo} alt="" width={60}/>
        <h3 className="text-4xl font-bold mt-2">Bati’parti</h3>
      </div>
      <div className="max-w-[500px] w-full flex justify-center flex-col relative p-8 bg-white rounded-[14px] shadow-lg">
        <h2 className="text-3xl font-bold items-center text-center text-gray-800 mb-4">Autentifiez -vous a Bati’Parti</h2>
        <p className="text-placeholder text-center text-lg mb-8">Autentifiez -vous à Bati’Parti</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Email"
            type="email"
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
          <Link to={'/login'} className="text-sm text-primary font-bold w-full">{'Identifant oublié ? Contactez l’administrateur >'}</Link>
          <Button
            variant="Primary"
            classname="w-full mt-4"
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Se connecter
          </Button>
        </form>
      </div>
    </div>
  );
};