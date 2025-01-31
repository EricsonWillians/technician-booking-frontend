// src/theme/index.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getInitialThemeMode = (): 'light' | 'dark' => 
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: { main: '#2563eb', contrastText: '#ffffff' },
    secondary: { main: '#6366f1', contrastText: '#ffffff' },
    background: {
      default: mode === 'light' ? '#f3f4f6' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? '#111827' : '#f8fafc',
      secondary: mode === 'light' ? '#4b5563' : '#94a3b8',
    },
    divider: mode === 'light' ? '#e5e7eb' : '#334155',
  },
  typography: {
    fontFamily: '"Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.3,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1.125rem',
      fontWeight: 500,
      letterSpacing: '-0.015em',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      letterSpacing: '-0.015em',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0',
      lineHeight: 1.5,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.5,
    },
  },
  shape: { 
    borderRadius: 6  // Reduced from 12
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,  // Reduced from 12
          boxShadow: mode === 'light' 
            ? '0 1px 2px 0 rgb(0 0 0 / 0.05)'
            : '0 1px 2px 0 rgb(0 0 0 / 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 6,  // Added explicit border radius
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 4,  // Reduced from 8
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,  // Added for consistency
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 8,  // Slightly rounder for FAB
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,  // Consistent with buttons
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode: 'light' | 'dark') => 
  createTheme(getDesignTokens(mode));