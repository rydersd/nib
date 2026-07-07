/**
 * nib-react — hooks. Thin readers over NibContext.
 */
import { useContext } from 'react';
import { NibContext } from './context.js';

export function useNib() {
  const ctx = useContext(NibContext);
  if (!ctx) throw new Error('nib-react: wrap your tree in <NibProvider>');
  return ctx;
}

/** [fidelity, setFidelity] — 'napkin' | 'blueprint' | 'polished' */
export function useFidelity() {
  const { fidelity, setFidelity } = useNib();
  return [fidelity, setFidelity];
}

/** { themeId, themes, setThemeOverride } */
export function useTheme() {
  const { themeId, themes, setThemeOverride } = useNib();
  return { themeId, themes, setThemeOverride };
}
