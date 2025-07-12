// Birth date utilities for pet forms

// Birth months for dropdown
export const BIRTH_MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

// Generate birth years (current year back to 25 years ago for pets)
export const generateBirthYears = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 25; year--) {
    years.push({ value: year, label: year.toString() });
  }
  return years;
};

// Generate valid birth months based on selected year
export const getValidBirthMonths = (selectedYear?: number | '') => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11

  // If no year selected or year is in the past, all months are valid
  if (!selectedYear || selectedYear < currentYear) {
    return BIRTH_MONTHS;
  }

  // If selected year is current year, only show months up to current month
  if (selectedYear === currentYear) {
    return BIRTH_MONTHS.filter(month => month.value <= currentMonth);
  }

  // Future years shouldn't happen due to validation, but return empty array as safeguard
  return [];
};
