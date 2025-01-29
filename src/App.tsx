// App.tsx
import React from 'react';
import {
  Box,
  Container,
  createTheme,
  ThemeProvider,
  CssBaseline,
  useMediaQuery,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import ChatInterface from './components/ChatInterface';
import BookingList from './components/BookingList';
import { Booking } from './services/bookingApi';

const getDesignTokens = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
    },
    warning: {
      main: '#d97706',
      light: '#f59e0b',
      dark: '#b45309',
    },
    info: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
    },
    success: {
      main: '#059669',
      light: '#10b981',
      dark: '#047857',
    },
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
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      color: 'text.primary', // Explicitly set color
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      color: 'text.primary', // Explicitly set color
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.025em',
      color: 'text.primary', // Explicitly set color
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: 'text.primary', // Explicitly set color
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: 'text.primary', // Explicitly set color
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: 'text.primary', // Explicitly set color
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      color: 'text.secondary', // Explicitly set color
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: 'text.secondary', // Explicitly set color
    },
    body1: {
      fontSize: '1rem',
      color: 'text.primary', // Explicitly set color
    },
    body2: {
      fontSize: '0.875rem',
      color: 'text.secondary', // Explicitly set color
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'light' ? '#f3f4f6' : '#0f172a',
          color: mode === 'light' ? '#111827' : '#f8fafc',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          color: 'text.primary', // Use theme's text.primary for AppBar text
          boxShadow: mode === 'light' 
            ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '0.375rem',
          padding: '0.5rem 1rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : '#1e293b',
            '&:hover fieldset': {
              borderColor: theme.palette.primary.main,
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 0 0 3px ${theme.palette.mode === 'light' 
                ? 'rgba(37, 99, 235, 0.1)' 
                : 'rgba(37, 99, 235, 0.2)'}`,
            },
          },
          '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' 
            ? theme.palette.grey[100]
            : theme.palette.grey[800],
        }),
        filled: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light'
            ? theme.palette.primary.main
            : theme.palette.primary.dark,
          color: '#ffffff',
        }),
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  ],
});

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode)),
    [mode]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleBookingSelect = (booking: Booking) => {
    console.log('Selected booking:', booking);
  };

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <AppBar 
          position="sticky" 
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <Typography
              variant="h6"
              component="h1"
              sx={{
                flex: 1,
                fontWeight: 600,
                letterSpacing: '-0.025em',
                color: 'text.primary', // Ensure text color matches theme
              }}
            >
              Technician Booking Assistant
            </Typography>
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton
                onClick={toggleColorMode}
                color="inherit"
                sx={{
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: mode === 'light' 
                      ? 'rgba(0, 0, 0, 0.04)'
                      : 'rgba(255, 255, 255, 0.08)',
                  },
                }}
                aria-label="Toggle dark/light mode"
              >
                {mode === 'light' ? (
                  <DarkModeIcon />
                ) : (
                  <LightModeIcon />
                )}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Container
          maxWidth="xl"
          sx={{
            flex: 1,
            py: 2, // Reduced vertical padding
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2, // Reduced gap between components
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ChatInterface />
          </Box>

          {!isMobile && (
            <Box
              sx={{
                width: { xs: '100%', sm: '350px' }, // Adjusted width for better responsiveness
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <BookingList onBookingSelect={handleBookingSelect} />
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
