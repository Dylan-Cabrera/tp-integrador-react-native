import { Platform } from 'react-native';

export const colores = {
  primario: '#1E3A8A',
  primarioSuave: '#DBEAFE',
  sobrePrimario: '#FFFFFF',
  fondo: '#F8FAFC',
  superficie: '#FFFFFF',
  borde: '#E2E8F0',
  texto: '#0F172A',
  textoSecundario: '#475569',
  exito: '#15803D',
  exitoSuave: '#DCFCE7',
  error: '#B91C1C',
  errorSuave: '#FEE2E2',
  aviso: '#B45309',
  avisoSuave: '#FEF3C7',
  deshabilitado: '#94A3B8',
  camaraFondo: '#000000',
} as const;

export const espacios = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const tamanios = {
  textoChico: 13,
  texto: 15,
  textoGrande: 18,
  titulo: 22,
  icono: 24,
  areaTactil: 44,
  alturaCamara: 320,
  bordeFino: 1,
} as const;

export const radios = {
  sm: 6,
  md: 10,
  lg: 16,
} as const;

export const fuentes = {
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
} as const;
