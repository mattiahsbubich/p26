import type { StopKind } from '../types';

export const stopKindLabels: Record<StopKind, string> = {
  meal: 'Pasto',
  transport: 'Spostamento',
  lodging: 'Alloggio',
  free: 'Altro',
};
