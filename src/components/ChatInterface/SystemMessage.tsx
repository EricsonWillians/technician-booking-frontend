import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Slide,
} from '@mui/material';
import {
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ContentCopy,
  CalendarToday,
  Person,
  WorkOutline,
  Schedule
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

const typeIcons = {
  info: <InfoIcon fontSize="small" />,
  success: <SuccessIcon fontSize="small" />,
  warning: <WarningIcon fontSize="small" />,
  error: <ErrorIcon fontSize="small" />,
};

const getStatusColor = (type: 'info' | 'success' | 'error' | 'warning') => {
  const colors = {
    info: '#2196f3',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336'
  };
  return colors[type];
};

interface SystemMessageProps {
  content: {
    intent: string;
    message: string;
    bookings?: any[];
    booking?: any;
  };
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
}

const SystemMessage = React.forwardRef<HTMLDivElement, SystemMessageProps>(
  ({ content, timestamp, type }, ref) => {
    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).catch(console.error);
    };

    const renderBookingCard = (booking: any, index: number) => {
      if (!booking) return null;

      const startTime = booking.start_time ? parseISO(booking.start_time) : null;
      const endTime = booking.end_time ? parseISO(booking.end_time) : null;
      const bookingStatus = booking.status?.toLowerCase() === 'cancelled' ? 'error' : 'success';

      return (
        <Grid item xs={12} sm={6} lg={4} key={index}>
          <Slide direction="up" in timeout={(index + 1) * 150}>
            <Card sx={{
              height: '100%',
              borderLeft: `4px solid ${getStatusColor(type)}`,
              backgroundColor: 'background.paper',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              },
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Chip
                    label={`Booking #${booking.id}`}
                    size="small"
                    color={type}
                    icon={<ContentCopy fontSize="inherit" />}
                    onClick={() => handleCopy(booking.id)}
                  />
                  <Tooltip title="Copy booking details">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(JSON.stringify(booking, null, 2))}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2">{booking.technician_name ?? 'Unknown Technician'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WorkOutline fontSize="small" color="action" />
                  <Typography variant="body2">{booking.profession ?? 'Unknown Profession'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Schedule fontSize="small" color="action" />
                  <Typography variant="body2">
                    {startTime ? format(startTime, 'MMM dd, yyyy HH:mm') : 'N/A'} -{' '}
                    {endTime ? format(endTime, 'HH:mm') : 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={booking.status ?? 'Confirmed'}
                    size="small"
                    color={bookingStatus}
                    variant="outlined"
                  />
                  <CalendarToday fontSize="small" color="action" />
                </Box>
              </CardContent>
            </Card>
          </Slide>
        </Grid>
      );
    };

    if (content.intent === 'booking_info' && Array.isArray(content.bookings) && content.bookings.length > 0) {
      return (
        <Box ref={ref} sx={{ mb: 2, width: '100%' }}>
          <Fade in>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 1.5, 
                  color: getStatusColor(type)
                }}
              >
                {typeIcons[type]}
                Booking Details
              </Typography>
              <Grid container spacing={2}>
                {content.bookings.map((booking, index) => renderBookingCard(booking, index))}
              </Grid>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right', color: 'text.secondary' }}>
                Updated: {format(timestamp, 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
          </Fade>
        </Box>
      );
    }

    return (
      <Box ref={ref} sx={{ mb: 2, width: '100%', display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Box sx={{ mt: '2px', color: getStatusColor(type), display: 'flex', alignItems: 'center' }}>
          {typeIcons[type]}
        </Box>
        <Box sx={{
          p: 1.5,
          borderRadius: 1,
          backgroundColor: `${getStatusColor(type)}1a`,
          border: `1px solid ${getStatusColor(type)}33`,
          position: 'relative',
          maxWidth: '100%',
          wordBreak: 'break-word'
        }}>
          <Typography variant="body2" component="div">
            {content.message.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
            {format(timestamp, 'HH:mm')}
          </Typography>
        </Box>
      </Box>
    );
  }
);

export default SystemMessage;