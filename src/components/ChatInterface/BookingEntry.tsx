// src/components/ChatInterface/BookingEntry.tsx

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { Booking } from '../../services/bookingApi';

interface BookingEntryProps {
  booking: Booking;
}

// Define possible message types aligning with MUI's Chip color options
type MessageType = 'info' | 'success' | 'error' | 'warning';

// Define the structure of status information
interface StatusInfo {
  label: string;
  color: MessageType;
  bgColor: string;
}

export const BookingEntry: React.FC<BookingEntryProps> = ({ booking }) => {
  const theme = useTheme();

  const getStatusInfo = (booking: Booking): StatusInfo => {
    const now = new Date();
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);

    if (now < startTime) {
      return {
        label: 'Upcoming',
        color: 'info',
        bgColor: alpha(theme.palette.info.main, 0.1),
      };
    } else if (now > endTime) {
      return {
        label: 'Completed',
        color: 'success',
        bgColor: alpha(theme.palette.success.main, 0.1),
      };
    } else {
      return {
        label: 'In Progress',
        color: 'warning',
        bgColor: alpha(theme.palette.warning.main, 0.1),
      };
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('default', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const status = getStatusInfo(booking);

  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        bgcolor: status.bgColor,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[2],
        },
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            ID: {booking.id}
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {/* Customer Information */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <PersonIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.2 }}
              >
                {booking.customer_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Customer
              </Typography>
            </Box>
          </Stack>

          {/* Technician Information */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <WorkIcon sx={{ color: theme.palette.secondary.main, fontSize: 20 }} />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.2 }}
              >
                {booking.technician_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {booking.profession}
              </Typography>
            </Box>
          </Stack>

          {/* Schedule Information */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <AccessTimeIcon sx={{ color: theme.palette.grey[600], fontSize: 20 }} />
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                Start: {formatDateTime(booking.start_time)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                End: {formatDateTime(booking.end_time)}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BookingEntry;
