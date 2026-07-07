/**
 * nib-react — shared context. One provider (NibProvider) owns the shell
 * state; ContextBar / NavDrawer / hooks read it from here.
 */
import { createContext } from 'react';

export const NibContext = createContext(null);
