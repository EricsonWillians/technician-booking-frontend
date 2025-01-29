import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  alpha
} from '@mui/material';

interface UserMessageProps {
  content: string;
  timestamp: Date;
}

export const UserMessage: React.FC<UserMessageProps> = ({ content, timestamp }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        mb: 2
      }}
    >
      <Paper
        elevation={1}
        sx={{
          maxWidth: '85%',
          p: 2,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          borderRadius: 2,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            right: -8,
            bottom: 8,
            width: 0,
            height: 0,
            border: '8px solid transparent',
            borderLeftColor: theme.palette.primary.main,
            borderRight: 0,
            marginRight: -1,
            marginBottom: -8,
          }
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 400,
            lineHeight: 1.6,
            wordBreak: 'break-word'
          }}
        >
          {content}
        </Typography>
      </Paper>

      <Typography
        variant="caption"
        sx={{
          mr: 1,
          mt: 0.5,
          color: 'text.secondary'
        }}
      >
        {timestamp.toLocaleTimeString()}
      </Typography>
    </Box>
  );
};

export default UserMessage;