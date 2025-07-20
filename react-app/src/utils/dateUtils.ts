/**
 * Timezone-aware date utility functions for the PetWhenua application
 * All dates from the backend are in UTC and need to be converted to New Zealand time for display
 */

// New Zealand timezone identifier
const NZ_TIMEZONE = 'Pacific/Auckland';

/**
 * Parse a UTC date string from the backend and convert to New Zealand time
 */
const parseUtcToNz = (dateString: string): Date => {
  try {
    // Ensure the date string is treated as UTC if it doesn't have timezone info
    let utcString = dateString;
    if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
      utcString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    }
    
    const utcDate = new Date(utcString);
    if (isNaN(utcDate.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }
    
    return utcDate;
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return new Date(); // Fallback to current time
  }
};

/**
 * Get current New Zealand time
 */
export const getNzNow = (): Date => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: NZ_TIMEZONE }));
};

/**
 * Format a UTC date string as New Zealand date only
 */
export const formatDate = (dateString: string): string => {
  const utcDate = parseUtcToNz(dateString);
  return utcDate.toLocaleDateString('en-NZ', {
    timeZone: NZ_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format a UTC date string as New Zealand date and time
 */
export const formatDateTime = (dateString: string): string => {
  const utcDate = parseUtcToNz(dateString);
  return utcDate.toLocaleDateString('en-NZ', {
    timeZone: NZ_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Use 24-hour format for consistency
  });
};

/**
 * Format a UTC date string as New Zealand time only
 */
export const formatTime = (dateString: string): string => {
  const utcDate = parseUtcToNz(dateString);
  return utcDate.toLocaleTimeString('en-NZ', {
    timeZone: NZ_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

/**
 * Format time ago relative to New Zealand time
 */
export const formatTimeAgo = (dateString: string): string => {
  const utcDate = parseUtcToNz(dateString);
  const nzNow = getNzNow();
  const diffInSeconds = Math.floor((nzNow.getTime() - utcDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  return formatDate(dateString);
};

/**
 * Check if a date is in the future (New Zealand time)
 */
export const isDateInFuture = (dateString: string): boolean => {
  const utcDate = parseUtcToNz(dateString);
  const nzNow = getNzNow();
  return utcDate.getTime() > nzNow.getTime();
};

/**
 * Check if a date is in the past (New Zealand time)
 */
export const isDateInPast = (dateString: string): boolean => {
  return !isDateInFuture(dateString);
};

/**
 * Format event date with future/past indication
 */
export const formatEventDate = (dateString: string): string => {
  if (isDateInFuture(dateString)) {
    return `Upcoming: ${formatDateTime(dateString)}`;
  } else {
    return `Past event: ${formatDateTime(dateString)}`;
  }
};

/**
 * Format a date for input controls (datetime-local)
 * Converts from UTC to New Zealand time for editing
 */
export const formatDateTimeForInput = (dateString?: string): string => {
  if (!dateString) return '';
  
  try {
    const utcDate = parseUtcToNz(dateString);
    
    // Convert to New Zealand time for the input
    const nzTime = new Date(utcDate.toLocaleString("en-US", { timeZone: NZ_TIMEZONE }));
    
    // Format to YYYY-MM-DDTHH:MM (required for datetime-local input)
    const year = nzTime.getFullYear();
    const month = String(nzTime.getMonth() + 1).padStart(2, '0');
    const day = String(nzTime.getDate()).padStart(2, '0');
    const hours = String(nzTime.getHours()).padStart(2, '0');
    const minutes = String(nzTime.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

/**
 * Parse a datetime-local input value to UTC string
 * Converts from New Zealand time to UTC for backend
 */
export const parseDateTimeInput = (inputValue: string): string => {
  if (!inputValue) return '';
  
  try {
    // Input is in YYYY-MM-DDTHH:MM format and represents New Zealand time
    const nzDate = new Date(inputValue);
    
    // Convert from New Zealand time to UTC
    const utcDate = new Date(nzDate.toLocaleString("en-US", { timeZone: "UTC" }));
    
    // Return as ISO string for backend
    return utcDate.toISOString();
  } catch {
    return '';
  }
};

/**
 * Get current time as datetime-local input value (New Zealand time)
 */
export const getCurrentNzTimeForInput = (): string => {
  const nzNow = getNzNow();
  
  const year = nzNow.getFullYear();
  const month = String(nzNow.getMonth() + 1).padStart(2, '0');
  const day = String(nzNow.getDate()).padStart(2, '0');
  const hours = String(nzNow.getHours()).padStart(2, '0');
  const minutes = String(nzNow.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Validate if a datetime input represents a future time in New Zealand
 */
export const isInputDateTimeInFuture = (inputValue: string): boolean => {
  if (!inputValue) return false;
  
  try {
    const inputDate = new Date(inputValue);
    const nzNow = getNzNow();
    return inputDate.getTime() > nzNow.getTime();
  } catch {
    return false;
  }
};
