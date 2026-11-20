import { EstadoCargando } from '@/components/EstadoCargando';
import { PanelPermiso } from '@/components/PanelPermiso';
import { TEXTOS_PERMISO } from '@/constants/permisos';
import { usePermiso } from '@/hooks/usePermiso';
import type { RecursoPermiso } from '@/types';

type Props = {
  recurso: RecursoPermiso;
  onCerrar: () => void;
};

/** Pantalla previa al diálogo del sistema: un beneficio en una frase y una única acción. */
export function ContenidoPermiso({ recurso, onCerrar }: Props) {
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);
  const textos = TEXTOS_PERMISO[recurso];
  const icono = recurso === 'camara' ? 'camera-outline' : 'notifications-outline';

  async function continuar() {
    await pedir();
    onCerrar();
  }

  switch (estado) {
    case 'cargando':
      return <EstadoCargando mensaje="Consultando el permiso…" />;
    case 'preguntable':
      return (
        <PanelPermiso
          icono={icono}
          titulo={textos.titulo}
          texto={textos.beneficio}
          textoBoton="Continuar"
          onPress={continuar}
        />
      );
    case 'bloqueado':
      return (
        <PanelPermiso
          icono={icono}
          titulo={textos.titulo}
          texto={textos.bloqueado}
          textoBoton="Abrir Ajustes"
          onPress={abrirAjustes}
        />
      );
    case 'concedido':
      return (
        <PanelPermiso
          icono={icono}
          titulo={textos.titulo}
          texto="¡Listo! El permiso ya está habilitado."
          textoBoton="Continuar"
          onPress={onCerrar}
        />
      );
  }
}
