import React from 'react';
import { Box, Typography } from '@mui/material';
import Input from '../Input';
import { formatDateTimeForInput, getCurrentNzTimeForInput } from '../../../utils/dateUtils';

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
  // Convert the backend UTC datetime to local input format for display
  const getDisplayValue = () => {
    if (!value) return '';
    return formatDateTimeForInput(value);
  };

  // Handle input change and convert to UTC for backend
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (!inputValue) {
      onChange('');
      return;
    }

    // Input value is in YYYY-MM-DDTHH:MM format representing New Zealand time
    // Convert this to UTC for the backend
    try {
      // Create a date object from the input (treating it as New Zealand time)
      const nzDate = new Date(inputValue);
      
      // Get New Zealand timezone offset (accounting for DST)
      const nzTimeZone = 'Pacific/Auckland';
      const utcTime = new Date(nzDate.toLocaleString('en-US', { timeZone: 'UTC' }));
      const nzTime = new Date(nzDate.toLocaleString('en-US', { timeZone: nzTimeZone }));
      const offset = nzTime.getTime() - utcTime.getTime();
      
      // Adjust for timezone offset to get UTC
      const utcDate = new Date(nzDate.getTime() - offset);
      
      // Return as ISO string for backend
      onChange(utcDate.toISOString());
    } catch (error) {
      console.error('Error parsing datetime input:', error);
      onChange('');
    }
  };

  // Get min/max in the correct format
  const getMinValue = () => {
    if (!min) return getCurrentNzTimeForInput();
    return min;
  };

  const getMaxValue = () => {
    if (!max) return '';
    return max;
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      
      <Input
        type="datetime-local"
        value={getDisplayValue()}
        onChange={handleInputChange}
        error={error}
        disabled={disabled}
        required={required}
        inputProps={{
          min: getMinValue(),
          max: getMaxValue(),
        }}
        placeholder="Select date and time"
      />
      
      {helperText && (
        <Typography 
          variant="caption" 
          color={error ? 'error' : 'text.secondary'}
          sx={{ mt: 0.5, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default DateTimeInput; 