import React from 'react';
import { Box, Typography, Paper, useTheme, alpha } from '@mui/material';

interface UserMessageProps {
  content: string;
  timestamp: Date;
}

// ✅ Use React.forwardRef to allow ref support inside Slide
const UserMessage = React.forwardRef<HTMLDivElement, UserMessageProps>(
  ({ content, timestamp }, ref) => {
    const theme = useTheme();

    return (
      <Box
        ref={ref} // ✅ Pass ref here
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          mb: 1.5,
          maxWidth: '100%',
        }}
      >
        <Paper
          elevation={2}
          sx={{
            maxWidth: '75%',
            p: 2,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderRadius: '16px 16px 4px 16px',
            position: 'relative',
            wordBreak: 'break-word',
            lineHeight: 1.6,
            boxShadow: `0px 2px 6px ${alpha(theme.palette.primary.dark, 0.4)}`,
            '&::after': {
              content: '""',
              position: 'absolute',
              right: -8,
              bottom: 6,
              width: 0,
              height: 0,
              border: '8px solid transparent',
              borderLeftColor: theme.palette.primary.main,
              borderRight: 0,
              marginRight: -1,
              marginBottom: -6,
            },
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 400 }}>
            {content}
          </Typography>
        </Paper>

        <Typography
          variant="caption"
          sx={{
            mt: 0.5,
            mr: 1,
            color: theme.palette.text.secondary,
            fontSize: '0.75rem',
            opacity: 0.8,
          }}
        >
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
    );
  }
);

export default UserMessage;
