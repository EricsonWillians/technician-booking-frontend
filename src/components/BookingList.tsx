// BookingList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Skeleton,
  Alert,
  IconButton,
  TablePagination,
  TextField,
  InputAdornment,
  useTheme,
  Chip,
  Tooltip,
  Stack,
} from '@mui/material';
import Grid from '@mui/material/Grid2'; // Correct import for Grid2 in MUI v6
import { 
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { getAllBookings, Booking, BookingApiError } from '../services/bookingApi';

interface BookingListProps {
  onBookingSelect?: (booking: Booking) => void;
  className?: string;
}

const BookingList: React.FC<BookingListProps> = ({ onBookingSelect, className }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllBookings();
      setBookings(data);
      setFilteredBookings(data);
    } catch (err) {
      const errorMessage = err instanceof BookingApiError
        ? `Failed to fetch bookings: ${err.message}`
        : 'An unexpected error occurred while fetching bookings';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchBookings();
  }, []);

  useEffect(() => {
    const filtered = bookings.filter(booking => 
      Object.values(booking).some(value =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredBookings(filtered);
    setPage(0);
  }, [searchQuery, bookings]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    void fetchBookings();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('default', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusChip = (booking: Booking) => {
    const now = new Date();
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

    if (now < startTime) {
      return (
        <Chip 
          size="small" 
          label="Upcoming" 
          sx={{
            bgcolor: theme.palette.info.main,
            color: theme.palette.getContrastText(theme.palette.info.main),
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      );
    } else if (now > endTime) {
      return (
        <Chip 
          size="small" 
          label="Completed" 
          sx={{
            bgcolor: theme.palette.success.main,
            color: theme.palette.getContrastText(theme.palette.success.main),
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      );
    } else {
      return (
        <Chip 
          size="small" 
          label="In Progress" 
          sx={{
            bgcolor: theme.palette.warning.main,
            color: theme.palette.getContrastText(theme.palette.warning.main),
            fontWeight: 600,
            fontSize: '0.75rem'
          }}
        />
      );
    }
  };

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={handleRefresh}
            aria-label="Refresh bookings"
          >
            <RefreshIcon />
          </IconButton>
        }
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    );
  }

  const renderLoadingState = () => (
    <Stack spacing={2} sx={{ p: 2 }}>
      {[...Array(3)].map((_, index) => (
        <Box key={index} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2 }}>
          <Skeleton animation="wave" height={24} width="40%" />
          <Skeleton animation="wave" height={16} width="30%" sx={{ mt: 1 }} />
          <Skeleton animation="wave" height={16} width="50%" sx={{ mt: 0.5 }} />
          <Skeleton animation="wave" height={16} width="45%" sx={{ mt: 0.5 }} />
        </Box>
      ))}
    </Stack>
  );

  const displayedBookings = useMemo(() => 
    filteredBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredBookings, page, rowsPerPage]
  );

  return (
    <Paper elevation={2} className={className} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between" spacing={2}>
          <Grid xs={12} sm="auto">
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Bookings
            </Typography>
          </Grid>
          <Grid xs={12} sm={6}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
              <TextField
                fullWidth
                size="small"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  sx: { backgroundColor: theme.palette.background.paper, borderRadius: 1 }
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    color: 'text.primary',
                  },
                }}
              />
              <Tooltip title="Refresh bookings">
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={isLoading} 
                  color="primary"
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                  aria-label="Refresh bookings"
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {isLoading ? (
        renderLoadingState()
      ) : (
        <>
          {filteredBookings.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2, color: 'text.primary', backgroundColor: theme.palette.background.paper }}>
              No bookings found matching your search criteria.
            </Alert>
          ) : (
            <>
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 100, color: 'text.primary' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 150, color: 'text.primary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PersonIcon fontSize="small" />
                          <Typography variant="subtitle2" color="text.primary">Customer</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 150, color: 'text.primary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <WorkIcon fontSize="small" />
                          <Typography variant="subtitle2" color="text.primary">Technician</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 120, color: 'text.primary' }}>Profession</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 180, color: 'text.primary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarIcon fontSize="small" />
                          <Typography variant="subtitle2" color="text.primary">Schedule</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedBookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        hover
                        onClick={() => onBookingSelect?.(booking)}
                        sx={{ 
                          cursor: onBookingSelect ? 'pointer' : 'default',
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell>{getStatusChip(booking)}</TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{booking.customer_name}</TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{booking.technician_name}</TableCell>
                        <TableCell sx={{ color: 'text.primary' }}>{booking.profession}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(booking.start_time)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(booking.end_time)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={filteredBookings.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </>
      )}
    </Paper>
  );
};

export default BookingList;
