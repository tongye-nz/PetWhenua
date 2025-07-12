// Age calculation utilities for pets

// Calculate pet age from birth year and month
export const calculatePetAge = (birthYear: number, birthMonth?: number): { years: number; months: number; totalMonths: number } => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

  const birthMonthValue = birthMonth || 1; // Default to January if no month provided
  
  let years = currentYear - birthYear;
  let months = currentMonth - birthMonthValue;

  // Adjust if current month is before birth month
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalMonths = years * 12 + months;

  return { years, months, totalMonths };
};

// Format pet age for display
export const formatPetAge = (birthYear: number, birthMonth?: number): string => {
  const { years, months } = calculatePetAge(birthYear, birthMonth);

  if (years === 0) {
    return months === 1 ? '1 month old' : `${months} months old`;
  } else if (months === 0) {
    return years === 1 ? '1 year old' : `${years} years old`;
  } else {
    const yearText = years === 1 ? '1 year' : `${years} years`;
    const monthText = months === 1 ? '1 month' : `${months} months`;
    return `${yearText} ${monthText} old`;
  }
};

// Calculate age in years for backend compatibility
export const calculateAgeInYears = (birthYear: number): number => {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
};
