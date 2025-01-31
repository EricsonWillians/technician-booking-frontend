import React, { useEffect, useState } from 'react';
import {
  Box, Container, createTheme, ThemeProvider, CssBaseline, IconButton, Tooltip, AppBar, Toolbar,
  Typography, Drawer, Fab, CircularProgress,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Analytics as AnalyticsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import ChatInterface from './components/ChatInterface';
import BookingAnalytics from './components/BookingAnalytics';
import { getAllBookings, processCommand, Booking } from './services/bookingApi';
import { createAppTheme, getInitialThemeMode } from './theme';
import { alpha } from '@mui/material/styles';

const DRAWER_WIDTH = 400;
const getInitialThemeMode = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const getDesignTokens = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    primary: { main: '#2563eb', contrastText: '#ffffff' },
    background: {
      default: mode === 'light' ? '#f3f4f6' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  shape: { borderRadius: 8 },
});

interface AnalyticsData {
  bookings: Booking[];
  nlpAnalysis: Array<{
    intent: string;
    confidence: number;
    assessment: string;
  }>;
}

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>(getInitialThemeMode());
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAnalysisUpdate = (data: AnalyticsData) => {
    setAnalysisData(data);
    setIsLoading(false);
  };

  const tooltipTitle = mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  useEffect(() => {
    if (isDrawerOpen && !analysisData) {
      setIsLoading(true);
      Promise.all([
        getAllBookings(),
        processCommand('analyze bookings')
      ]).then(([bookings, nlpResult]) => {
        handleAnalysisUpdate({
          bookings,
          nlpAnalysis: nlpResult.analysis || []
        });
      }).catch(error => {
        console.error('Error initializing analytics:', error);
        setIsLoading(false);
      });
    }
  }, [isDrawerOpen, analysisData]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
              Technician Booking Assistant
            </Typography>
            <Tooltip title={tooltipTitle}>
              <IconButton onClick={() => setMode(mode === 'light' ? 'dark' : 'light')} color="inherit">
                {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ flex: 1, py: 2 }}>
          <Box sx={{ height: '100%' }}>
            <ChatInterface onAnalysisUpdate={handleAnalysisUpdate} />
          </Box>
        </Container>

        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        >
          {isDrawerOpen ? <CloseIcon /> : <AnalyticsIcon />}
        </Fab>

        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{
            width: DRAWER_WIDTH,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.default'
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : analysisData && (
            <BookingAnalytics 
              bookings={analysisData.bookings} 
              nlpAnalysis={analysisData.nlpAnalysis}
            />
          )}
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}

export default App;