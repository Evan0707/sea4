import { useNavigate } from 'react-router-dom';
import Erreur from '@/shared/assets/Erreur404.png'
import logo from '@/shared/assets/Logo.svg'

export default function Error404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">

        <div className="flex flex-col items-center mb-10">
          <img src={logo} alt="" width={60} />
          <h3 className="text-4xl font-bold mt-2">Bati’parti</h3>
        </div>

        <img src={Erreur} className="w-[50vw]" />

        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 mt-10 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retourner en arrière
        </button>
      </div>
    </div>
  );
}