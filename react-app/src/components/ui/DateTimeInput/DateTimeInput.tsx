import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Input from '../Input';

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
  // Parse the datetime string (YYYY-MM-DDTHH:MM) into separate date and time parts
  const parseDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return { date: '', hour: '', minute: '', ampm: 'AM' };
    
    const [datePart, timePart] = dateTimeString.split('T');
    if (!timePart) return { date: datePart || '', hour: '', minute: '', ampm: 'AM' };
    
    const [hourStr, minuteStr] = timePart.split(':');
    const hour24 = parseInt(hourStr, 10);
    const minute = minuteStr || '00';
    
    // Convert 24-hour to 12-hour format
    let hour12: number;
    let ampm: 'AM' | 'PM';
    
    if (hour24 === 0) {
      hour12 = 12;
      ampm = 'AM';
    } else if (hour24 < 12) {
      hour12 = hour24;
      ampm = 'AM';
    } else if (hour24 === 12) {
      hour12 = 12;
      ampm = 'PM';
    } else {
      hour12 = hour24 - 12;
      ampm = 'PM';
    }
    
    return {
      date: datePart || '',
      hour: hour12.toString(),
      minute: minute,
      ampm: ampm
    };
  };

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (hour: string, minute: string, ampm: 'AM' | 'PM') => {
    if (!hour || !minute) return null;
    
    let hour24: number;
    const hour12 = parseInt(hour, 10);
    
    if (ampm === 'AM') {
      hour24 = hour12 === 12 ? 0 : hour12;
    } else {
      hour24 = hour12 === 12 ? 12 : hour12 + 12;
    }
    
    const hour24Str = hour24.toString().padStart(2, '0');
    return `${hour24Str}:${minute}`;
  };

  // Combine date and time parts back into datetime string
  const combineDateTime = (date: string, hour: string, minute: string, ampm: 'AM' | 'PM') => {
    // If we have both date and complete time, return full datetime
    if (date && hour && minute) {
      const timeStr = convertTo24Hour(hour, minute, ampm);
      return timeStr ? `${date}T${timeStr}` : '';
    }
    
    // If we have date but no complete time, use default time
    if (date && (!hour || !minute)) {
      return date + 'T09:00'; // Default to 9:00 AM
    }
    
    // If we have no date but have time, return empty string (don't pass incomplete data to parent)
    // The time components can still be selected and displayed
    return '';
  };

  // Internal state for time components to allow independent selection
  const [internalHour, setInternalHour] = useState<string>('');
  const [internalMinute, setInternalMinute] = useState<string>('');
  const [internalAmPm, setInternalAmPm] = useState<'AM' | 'PM'>('AM');
  
  const { date, hour, minute, ampm } = parseDateTime(value);
  
  // Initialize internal state from parsed value
  useEffect(() => {
    setInternalHour(hour || '');
    setInternalMinute(minute || '');
    setInternalAmPm((ampm === 'AM' || ampm === 'PM') ? ampm : 'AM');
  }, [hour, minute, ampm]);
  
  // Use internal state for time components, parsed date for date
  const currentHour = internalHour;
  const currentMinute = internalMinute;
  const currentAmPm = internalAmPm;

  // Generate hour options (1-12)
  const generateHourOptions = () => {
    const hours = [];
    for (let i = 1; i <= 12; i++) {
      hours.push({ value: i.toString(), label: i.toString() });
    }
    return hours;
  };

  // Generate minute options (00, 05, 10, 15, etc.)
  const generateMinuteOptions = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += 5) {
      const value = i.toString().padStart(2, '0');
      minutes.push({ value, label: value });
    }
    return minutes;
  };

  // Get min/max dates for date input
  const getMinDate = () => {
    if (!min) return new Date().toISOString().split('T')[0]; // Today
    return min.split('T')[0];
  };

  const getMaxDate = () => {
    if (!max) return '';
    return max.split('T')[0];
  };

  // Handle date change
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    const newDateTime = combineDateTime(newDate, currentHour, currentMinute, currentAmPm);
    onChange(newDateTime);
  };

  // Handle hour change
  const handleHourChange = (event: any) => {
    const newHour = event.target.value;
    setInternalHour(newHour);
    const newDateTime = combineDateTime(date, newHour, currentMinute, currentAmPm);
    onChange(newDateTime);
  };

  // Handle minute change
  const handleMinuteChange = (event: any) => {
    const newMinute = event.target.value;
    setInternalMinute(newMinute);
    const newDateTime = combineDateTime(date, currentHour, newMinute, currentAmPm);
    onChange(newDateTime);
  };

  // Handle AM/PM change
  const handleAmPmChange = (event: any) => {
    const newAmPm = event.target.value as 'AM' | 'PM';
    setInternalAmPm(newAmPm);
    const newDateTime = combineDateTime(date, currentHour, currentMinute, newAmPm);
    onChange(newDateTime);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* Date Input */}
        <Input
          type="date"
          value={date}
          onChange={handleDateChange}
          error={error}
          disabled={disabled}
          required={required}
          inputProps={{
            min: getMinDate(),
            max: getMaxDate(),
          }}
          sx={{ flex: 2 }}
          placeholder="Select date"
        />
        
        {/* Hour Select */}
        <FormControl sx={{ flex: 1 }} error={error} disabled={disabled}>
          <InputLabel>Hour</InputLabel>
          <Select
            value={currentHour}
            label="Hour"
            onChange={handleHourChange}
            required={required}
          >
            <MenuItem value="">
              <em>--</em>
            </MenuItem>
            {generateHourOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Minute Select */}
        <FormControl sx={{ flex: 1 }} error={error} disabled={disabled}>
          <InputLabel>Min</InputLabel>
          <Select
            value={currentMinute}
            label="Min"
            onChange={handleMinuteChange}
            required={required}
          >
            <MenuItem value="">
              <em>--</em>
            </MenuItem>
            {generateMinuteOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* AM/PM Select */}
        <FormControl sx={{ flex: 1 }} error={error} disabled={disabled}>
          <InputLabel>AM/PM</InputLabel>
          <Select
            value={currentAmPm}
            label="AM/PM"
            onChange={handleAmPmChange}
            required={required}
          >
            <MenuItem value="AM">AM</MenuItem>
            <MenuItem value="PM">PM</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
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