import { NavegacionRaiz } from '@/components/NavegacionRaiz';
import { BibliotecaProvider } from '@/context/BibliotecaContext';

// Un deep link a una ruta del Stack raíz (por ejemplo /buscar) deja las pestañas debajo.
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function LayoutRaiz() {
  return (
    <BibliotecaProvider>
      <NavegacionRaiz />
    </BibliotecaProvider>
  );
}
