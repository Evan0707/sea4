import { useNavigate } from 'react-router-dom';
import Button from '@/shared/components/ui/Button';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-primary relative overflow-hidden font-sans text-center">
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

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          {/* Large Background 403 */}
          <h1 className="text-[12rem] md:text-[20rem] font-black text-border/40 select-none leading-none tracking-tighter">
            403
          </h1>
          
          {/* Centered Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <h2 className="text-2xl md:text-5xl font-bold text-text-primary mb-10 tracking-tight px-4">
              Accès refusé.
            </h2>
            <Button
              variant="Secondary"
              size="lg"
              onClick={() => navigate('/')}
              className="px-10 py-6 text-base font-bold rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;