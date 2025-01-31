import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import { Booking } from '../services/bookingApi';

interface BookingAnalyticsProps {
  bookings: Booking[];
  nlpAnalysis: { intent: string; confidence: number }[];
}

const BookingAnalytics: React.FC<BookingAnalyticsProps> = ({ bookings, nlpAnalysis }) => {
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status.toLowerCase() === 'completed').length;
  const canceledBookings = bookings.filter(b => b.status.toLowerCase() === 'cancelled').length;

  const technicianCounts = bookings.reduce((acc, b) => {
    acc[b.technician_name] = (acc[b.technician_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTechnicians = Object.entries(technicianCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const intentChartData = nlpAnalysis.map(({ intent, confidence }) => ({
    intent,
    confidence: Math.round(confidence * 100),
  }));

  const columns = [
    { field: 'id', headerName: 'Booking ID', width: 150 },
    { field: 'customer_name', headerName: 'Customer', width: 180 },
    { field: 'technician_name', headerName: 'Technician', width: 180 },
    { field: 'profession', headerName: 'Profession', width: 180 },
    { field: 'start_time', headerName: 'Start Time', width: 180 },
    { field: 'end_time', headerName: 'End Time', width: 180 },
  ];

  return (
    <Box sx={{ p: 3, display: 'grid', gap: 3, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h6">Total</Typography>
            <Typography variant="h4">{totalBookings}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Completed</Typography>
            <Typography variant="h4" color="success.main">{completedBookings}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6">Canceled</Typography>
            <Typography variant="h4" color="error.main">{canceledBookings}</Typography>
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Top Technicians</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Technician</TableCell>
                  <TableCell align="right">Bookings</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topTechnicians.slice(0, 5).map(tech => (
                  <TableRow key={tech.name}>
                    <TableCell>{tech.name}</TableCell>
                    <TableCell align="right">{tech.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Intent Analysis</Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={intentChartData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} />
              <YAxis type="category" dataKey="intent" width={120} />
              <RechartsTooltip />
              <Bar dataKey="confidence" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recent Bookings</Typography>
          <Box sx={{ height: 400 }}>
            <DataGrid
              rows={bookings}
              columns={columns}
              pageSizeOptions={[5, 10]}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookingAnalytics;