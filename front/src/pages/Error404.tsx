import { useNavigate } from 'react-router-dom';
import Erreur from '../assets/Erreur404.png'
import logo from '../assets/Logo.svg'

export default function Error404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold mt-4 mb-6">Page non trouvée</h2>
        <p className="text-gray-600 mb-8"> */}
        <div className="flex flex-col items-center mb-10">
            <img src={logo} alt="" width={60}/>
            <h3 className="text-4xl font-bold mt-2">Bati’parti</h3>
        </div>

        <img src={Erreur} className="w-[50vw]" />
          {/* Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p> */}
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