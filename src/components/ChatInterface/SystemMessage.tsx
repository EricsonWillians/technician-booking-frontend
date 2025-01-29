// src/components/ChatInterface/SystemMessage.tsx

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { CommandResult } from '../../services/bookingApi';
import { BookingEntry } from './BookingEntry';

type MessageType = 'info' | 'success' | 'error' | 'warning';

interface SystemMessageProps {
  content: CommandResult | string;
  timestamp: Date;
  type?: MessageType; // optional, defaults to 'info'
}

interface MessageContainerProps {
  children: React.ReactNode;
  type: MessageType;
}

/**
 * A container that visually changes according to the message type.
 * Using alpha-blended colors for a more subtle yet distinct look.
 */
const MessageContainer: React.FC<MessageContainerProps> = ({ children, type }) => {
  const theme = useTheme();

  let bgColor = '';
  let borderColor = '';

  // Subtle alpha-based backgrounds & borders (tweak these as needed):
  switch (type) {
    case 'error':
      bgColor = alpha(theme.palette.error.main, 0.07); 
      borderColor = alpha(theme.palette.error.main, 0.2);
      break;
    case 'success':
      bgColor = alpha(theme.palette.success.main, 0.07);
      borderColor = alpha(theme.palette.success.main, 0.2);
      break;
    case 'warning':
      bgColor = alpha(theme.palette.warning.main, 0.07);
      borderColor = alpha(theme.palette.warning.main, 0.2);
      break;
    case 'info':
    default:
      bgColor = alpha(theme.palette.info.main, 0.07);
      borderColor = alpha(theme.palette.info.main, 0.2);
      break;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', maxWidth: '85%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: bgColor,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
          width: '100%',
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

const getIcon = (type: MessageType) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    case 'error':
      return <ErrorIcon sx={{ color: 'error.main' }} />;
    case 'warning':
      return <WarningIcon sx={{ color: 'warning.main' }} />;
    case 'info':
    default:
      return <InfoIcon sx={{ color: 'info.main' }} />;
  }
};

/**
 * Recursively renders JSON data with indentation, emphasizing in red for errors.
 */
const renderJsonRecursively = (data: any, depth = 0): React.ReactNode => {
  // If it's null or not an object/array, just render as string
  if (data === null || typeof data !== 'object') {
    return (
      <Typography
        variant="body2"
        sx={{ color: 'error.main', ml: depth * 2, whiteSpace: 'pre-wrap' }}
      >
        {String(data)}
      </Typography>
    );
  }

  // If it's an array, map over items
  if (Array.isArray(data)) {
    return data.map((item, idx) => (
      <Box key={idx} sx={{ ml: depth * 2 }}>
        {renderJsonRecursively(item, depth + 1)}
      </Box>
    ));
  }

  // Otherwise it's an object; iterate over entries
  return Object.entries(data).map(([key, value]) => (
    <Box key={key} sx={{ ml: depth * 2, mb: 0.5 }}>
      <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
        • <strong>{key}</strong>
      </Typography>
      {renderJsonRecursively(value, depth + 1)}
    </Box>
  ));
};

/**
 * Attempt to parse a string as JSON. If valid, recursively render it.
 * If parsing fails, we simply display the raw string in red.
 */
const renderErrorJson = (rawString: string) => {
  try {
    const parsed = JSON.parse(rawString);
    return (
      <Box sx={{ mt: 1 }}>
        {renderJsonRecursively(parsed, 0)}
      </Box>
    );
  } catch {
    // Fallback to raw text
    return (
      <Typography
        variant="body2"
        sx={{ color: 'error.main', mt: 1, fontWeight: 500, whiteSpace: 'pre-wrap' }}
      >
        {rawString}
      </Typography>
    );
  }
};

export const SystemMessage: React.FC<SystemMessageProps> = ({
  content,
  timestamp,
  type = 'info',
}) => {
  const renderContent = () => {
    // 1) If it's a plain string
    if (typeof content === 'string') {
      if (type === 'error') {
        // Display as error with JSON parsing
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getIcon('error')}
              <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 700 }}>
                Error
              </Typography>
            </Box>
            {renderErrorJson(content)}
          </Box>
        );
      }
      // For non-error plain strings
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getIcon(type)}
          <Typography
            sx={{
              fontWeight: 500,
              color:
                type === 'success'
                  ? 'success.main'
                  : type === 'warning'
                  ? 'warning.main'
                  : 'info.main',
            }}
          >
            {content}
          </Typography>
        </Box>
      );
    }

    // 2) If it's a CommandResult
    const result = content as CommandResult;

    return (
      <Box>
        {/* Show the intent if present */}
        {result.intent && (
          <Chip
            label={result.intent.replace('_', ' ').toUpperCase()}
            size="small"
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              fontWeight: 600,
              mb: 1,
            }}
          />
        )}

        {/* Main message */}
        {result.message && (
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 2, color: 'text.primary' }}>
            {result.message}
          </Typography>
        )}

        {/* Single booking */}
        {result.booking && <BookingEntry booking={result.booking} />}

        {/* Multiple bookings */}
        {result.bookings && result.bookings.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {result.bookings.map((booking) => (
                <BookingEntry key={booking.id} booking={booking} />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ mb: 2 }}>
      <MessageContainer type={type}>{renderContent()}</MessageContainer>

      {/* Timestamp */}
      <Typography
        variant="caption"
        sx={{
          ml: 1,
          mt: 0.5,
          display: 'block',
          color: 'text.secondary',
        }}
      >
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Box>
  );
};

export default SystemMessage;
