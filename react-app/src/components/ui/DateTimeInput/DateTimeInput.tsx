import React from 'react';
import { Box, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

export interface DateTimeInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  label = "Date & Time",
  value = '',
  onChange,
  error = false,
  helperText,
  required = false,
  disabled = false,
  min,
  max,
}) => {
  const NZ_TIMEZONE = 'Pacific/Auckland';

  // Convert UTC string to dayjs object in NZ timezone for display
  const getDisplayValue = (): Dayjs | null => {
    if (!value) return null;
    
    try {
      // Parse the UTC value and convert to NZ timezone
      return dayjs.utc(value).tz(NZ_TIMEZONE);
    } catch (error) {
      console.error('Error parsing date value:', error);
      return null;
    }
  };

  // Convert dayjs object back to UTC string for backend
  const handleDateTimeChange = (newValue: Dayjs | null) => {
    if (!newValue) {
      onChange('');
      return;
    }

    try {
      // Convert the NZ timezone value back to UTC for the backend
      const utcValue = newValue.utc().toISOString();
      onChange(utcValue);
    } catch (error) {
      console.error('Error converting datetime to UTC:', error);
      onChange('');
    }
  };

  // Convert min/max strings to dayjs objects
  const getMinValue = (): Dayjs | undefined => {
    if (!min) {
      // Default to current NZ time
      return dayjs().tz(NZ_TIMEZONE);
    }
    try {
      return dayjs.utc(min).tz(NZ_TIMEZONE);
    } catch {
      return undefined;
    }
  };

  const getMaxValue = (): Dayjs | undefined => {
    if (!max) return undefined;
    try {
      return dayjs.utc(max).tz(NZ_TIMEZONE);
    } catch {
      return undefined;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Typography>
        
        <DateTimePicker
          value={getDisplayValue()}
          onChange={handleDateTimeChange}
          disabled={disabled}
          minDateTime={getMinValue()}
          maxDateTime={getMaxValue()}
          format="DD/MM/YYYY hh:mm A"
          timezone={NZ_TIMEZONE}
          slotProps={{
            textField: {
              error,
              required,
              fullWidth: true,
              size: 'small',
              helperText: helperText || 'Select date and time (New Zealand time)',
            },
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateTimeInput; 