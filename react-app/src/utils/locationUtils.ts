export const combineLocation = (region: string, district: string): string => {
  if (!region && !district) return '';
  if (region && !district) return region;
  if (!region && district) return district;
  return `${district}, ${region}`;
};

export const parseLocation = (location: string): { region: string; district: string } => {
  if (!location) return { region: '', district: '' };
  
  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length === 1) {
    // If only one part, assume it's the region
    return { region: parts[0], district: '' };
  } else if (parts.length >= 2) {
    // If multiple parts, assume format is "district, region"
    return { region: parts[1], district: parts[0] };
  }
  
  return { region: '', district: '' };
};
