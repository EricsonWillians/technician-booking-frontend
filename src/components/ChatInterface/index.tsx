// src/components/ChatInterface/index.tsx

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { CommandResult, BookingApiError, processCommand } from '../../services/bookingApi';
import SystemMessage from './SystemMessage';
import UserMessage from './UserMessage';
import { alpha } from '@mui/material/styles'; // Correctly import alpha

// Define possible message types
type MessageType = 'info' | 'success' | 'error' | 'warning';

// Define separate interfaces for user and system messages
interface UserChatMessage {
  id: string;
  role: 'user';
  content: string;
  timestamp: Date;
}

interface SystemChatMessage {
  id: string;
  role: 'system';
  content: CommandResult;
  timestamp: Date;
  type: MessageType;
}

type ChatMessage = UserChatMessage | SystemChatMessage;

export interface ChatInterfaceProps {
  className?: string;
  placeholder?: string;
  initialMessages?: ChatMessage[];
}

export default function ChatInterface({
  className,
  placeholder = "Type your message...",
  initialMessages = []
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Ref to prevent adding welcome message multiple times
  const welcomeMessageAdded = useRef(false);

  useEffect(() => {
    // Add welcome message on component mount only once
    if (!welcomeMessageAdded.current) {
      const welcomeMessage: SystemChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: {
          intent: 'welcome',
          message: "Welcome to the Technician Booking System! How can I assist you today?"
        },
        timestamp: new Date(),
        type: 'info'
      };
      setMessages(prev => [...prev, welcomeMessage]);
      welcomeMessageAdded.current = true;
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const newUserMessage: UserChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result: CommandResult = await processCommand(trimmed);
      const messageType: MessageType = determineMessageType(result.intent);

      const newSystemMessage: SystemChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: result,
        timestamp: new Date(),
        type: messageType
      };
      setMessages(prev => [...prev, newSystemMessage]);

      // Handle additional data like bookings if necessary
      if (result.bookings && result.bookings.length > 0) {
        result.bookings.forEach((booking) => {
          const bookingMessage: SystemChatMessage = {
            id: (Date.now() + 2).toString(),
            role: 'system',
            content: {
              intent: 'booking_info',
              message: `Booking ID: ${booking.id} for ${booking.profession} with ${booking.technician_name} scheduled from ${new Date(booking.start_time).toLocaleString()} to ${new Date(booking.end_time).toLocaleString()}.`
            },
            timestamp: new Date(),
            type: 'info'
          };
          setMessages(prev => [...prev, bookingMessage]);
        });
      }

      if (result.booking) {
        const booking = result.booking;
        const bookingMessage: SystemChatMessage = {
          id: (Date.now() + 3).toString(),
          role: 'system',
          content: {
            intent: 'booking_created',
            message: `Booking created successfully! ID: ${booking.id} for ${booking.profession} with ${booking.technician_name} from ${new Date(booking.start_time).toLocaleString()} to ${new Date(booking.end_time).toLocaleString()}.`
          },
          timestamp: new Date(),
          type: 'success'
        };
        setMessages(prev => [...prev, bookingMessage]);
      }

    } catch (err) {
      const errorContent = err instanceof BookingApiError
        ? {
            intent: 'error',
            message: err.message.replace('API request failed: ', '')
          }
        : {
            intent: 'error',
            message: 'An unexpected error occurred. Please try again later.'
          };

      const errorMessage: SystemChatMessage = {
        id: (Date.now() + 4).toString(),
        role: 'system',
        content: errorContent,
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // Helper function to determine message type based on intent
  const determineMessageType = (intent: string): MessageType => {
    if (intent.includes('error')) return 'error';
    if (intent.includes('success')) return 'success';
    if (intent.includes('warning')) return 'warning';
    return 'info';
  };

  return (
    <Paper
      elevation={3}
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        borderRadius: 2
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h2" sx={{ color: 'text.secondary' }}>
          Chat Interface
        </Typography>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.default'
        }}
      >
        {messages.map((message) => (
          <Box key={message.id}>
            {message.role === 'user' ? (
              <UserMessage content={message.content as string} timestamp={message.timestamp} />
            ) : (
              <SystemMessage
                content={message.content}
                timestamp={message.timestamp}
                type={message.type}
              />
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Loading Indicator */}
      {isLoading && <LinearProgress />}

      {/* Input Area */}
      <Divider />

      <Box
        component="form"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
        onSubmit={(e) => {
          e.preventDefault();
          void handleSend();
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            multiline
            maxRows={3}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default'
              }
            }}
            inputProps={{
              'aria-label': 'Type your message',
            }}
          />
          <Tooltip title="Send message">
            <IconButton
              color="primary"
              onClick={() => void handleSend()}
              disabled={isLoading}
              size="large"
              sx={{
                alignSelf: 'flex-end',
                mb: isMobile ? 1 : 0
              }}
              aria-label="Send message"
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
}
