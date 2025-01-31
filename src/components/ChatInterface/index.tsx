import React, { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  LinearProgress,
  useTheme,
  Tooltip,
  Divider,
  Slide,
  Collapse,
  styled,
  keyframes,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { CommandResult, BookingApiError, processCommand, getAllBookings } from '../../services/bookingApi';
import SystemMessage from './SystemMessage';
import UserMessage from './UserMessage';
import { alpha } from '@mui/material/styles';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const AnimatedSendButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    animation: `${pulse} 0.5s ${theme?.transitions?.easing?.easeInOut ?? 'ease-in-out'}`,
  },
}));

type MessageType = 'info' | 'success' | 'error' | 'warning';

interface UserChatMessage {
  id: string;
  role: 'user';
  content: string;
  timestamp: Date;
}

interface SystemChatMessage {
  id: string;
  role: 'system';
  content: {
    intent: string;
    message: string;
    booking?: any;
    bookings?: any[];
  };
  timestamp: Date;
  type: MessageType;
}

type ChatMessage = UserChatMessage | SystemChatMessage;

interface ChatInterfaceProps {
  className?: string;
  placeholder?: string;
  initialMessages?: ChatMessage[];
  onAnalysisUpdate?: (data: any) => void;
}

export default function ChatInterface({
  className,
  placeholder = "Type your message...",
  initialMessages = [],
  onAnalysisUpdate
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const welcomeMessageShown = useRef(false);

  useEffect(() => {
    if (!welcomeMessageShown.current) {
      addMessage({
        id: Date.now().toString(),
        role: 'system',
        content: {
          intent: 'welcome',
          message: "Welcome to the Technician Booking System! How can I assist you today?"
        },
        timestamp: new Date(),
        type: 'info'
      });
      welcomeMessageShown.current = true;
    }
  }, [addMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseBookingsFromMessage = (message: string): any[] => {
    const bookings: any[] = [];
    const lines = message.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('- ID:')) {
        const booking: any = {};
        const parts = line.substring(2).split(',').map(part => part.trim());
        
        parts.forEach(part => {
          if (part.startsWith('ID:')) booking.id = part.split(':')[1].trim();
          if (part.startsWith('Technician:')) booking.technician_name = part.split(':')[1].trim();
          if (part.startsWith('Profession:')) booking.profession = part.split(':')[1].trim();
          if (part.startsWith('Start:')) {
            const startStr = part.split(':').slice(1).join(':').trim();
            booking.start_time = new Date(startStr).toISOString();
          }
        });
        
        if (booking.id) bookings.push(booking);
      }
    });
    
    return bookings;
  };

  const updateAnalytics = useCallback(async (result: CommandResult) => {
    if (!onAnalysisUpdate) return;
    try {
      const bookings = await getAllBookings();
      onAnalysisUpdate({
        bookings,
        nlpAnalysis: result.analysis || []
      });
    } catch (error) {
      console.error("Error updating analytics:", error);
    }
  }, [onAnalysisUpdate]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const newUserMessage: UserChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    };

    addMessage(newUserMessage);
    setInputValue('');
    setIsLoading(true);
    inputRef.current?.focus();

    try {
      const result = await processCommand(trimmed);
      await updateAnalytics(result);
      
      if (result.intent === 'list_bookings' && result.message.includes('- ID:')) {
        const bookings = parseBookingsFromMessage(result.message);
        addMessage({
          id: Date.now().toString(),
          role: 'system',
          content: {
            intent: 'booking_info',
            message: "Here are your bookings:",
            bookings
          },
          timestamp: new Date(),
          type: 'info'
        });
      } else {
        addMessage({
          id: Date.now().toString(),
          role: 'system',
          content: {
            intent: result.intent,
            message: result.message,
            bookings: result.bookings
          },
          timestamp: new Date(),
          type: determineMessageType(result.intent)
        });
      }
    } catch (err) {
      console.error("Error processing command:", err);
      addMessage({
        id: Date.now().toString(),
        role: 'system',
        content: {
          intent: 'error',
          message: err instanceof BookingApiError ? err.message.replace('API request failed: ', '') : 'An unexpected error occurred.'
        },
        timestamp: new Date(),
        type: 'error'
      });
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

  const determineMessageType = (intent: string): MessageType => {
    if (intent.includes('error')) return 'error';
    if (intent.includes('success')) return 'success';
    if (intent.includes('warning')) return 'warning';
    return 'info';
  };

  return (
    <Paper className={className} sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden', 
      bgcolor: 'background.default', 
      borderRadius: 4 
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: theme.palette?.primary?.main ? alpha(theme.palette.primary.main, 0.9) : 'transparent', 
        color: 'white' 
      }}>
        <Typography variant="h6">Technician Booking Assistant</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map(message => (
          <Slide key={message.id} in direction={message.role === 'user' ? 'left' : 'right'}>
            {message.role === 'user' 
              ? <UserMessage content={message.content} timestamp={message.timestamp} /> 
              : <SystemMessage content={message.content} timestamp={message.timestamp} type={message.type} />}
          </Slide>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Collapse in={isLoading}><LinearProgress /></Collapse>

      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField 
          fullWidth 
          placeholder={placeholder} 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          onKeyDown={handleKeyDown} 
          inputRef={inputRef} 
        />
        <Tooltip title="Send">
          <span>
            <AnimatedSendButton 
              color="primary" 
              onClick={handleSend} 
              disabled={isLoading || !inputValue.trim()}
            >
              <SendIcon />
            </AnimatedSendButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
}