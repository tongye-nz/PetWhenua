import { useState, useEffect } from 'react';
// Remove static import - we'll load this dynamically
// import { NZ_REGIONS, getDistrictsByRegion } from '../data/nzLocations';

interface LocationSelectorState {
  selectedRegion: string;
  selectedDistrict: string;
  isDistrictDisabled: boolean;
  districts: string[];
  regions: any[];
  isLoading: boolean;
}

export const useLocationSelector = (
  initialRegion: string = '',
  initialDistrict: string = ''
): LocationSelectorState & {
  handleRegionChange: (regionName: string) => void;
  handleDistrictChange: (districtName: string) => void;
} => {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [districts, setDistricts] = useState<string[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [getDistrictsByRegionFn, setGetDistrictsByRegionFn] = useState<((regionName: string) => any[]) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load location data dynamically
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const locationModule = await import('../data/nzLocations');
        setRegions(locationModule.NZ_REGIONS);
        setGetDistrictsByRegionFn(() => locationModule.getDistrictsByRegion);
        
        // Set initial districts if region is pre-selected
        if (initialRegion) {
          const initialDistricts = locationModule.getDistrictsByRegion(initialRegion);
          setDistricts(initialDistricts.map(d => d.Name));
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load location data:', error);
        setIsLoading(false);
      }
    };

    loadLocationData();
  }, [initialRegion]);

  const handleRegionChange = (regionName: string) => {
    setSelectedRegion(regionName);
    setSelectedDistrict(''); // Reset district when region changes
    
    if (regionName && getDistrictsByRegionFn) {
      const regionDistricts = getDistrictsByRegionFn(regionName);
      setDistricts(regionDistricts.map(d => d.Name));
    } else {
      setDistricts([]);
    }
  };

  const handleDistrictChange = (districtName: string) => {
    setSelectedDistrict(districtName);
  };

  const isDistrictDisabled = !selectedRegion || districts.length === 0;

  return {
    selectedRegion,
    selectedDistrict,
    isDistrictDisabled,
    districts,
    regions,
    isLoading,
    handleRegionChange,
    handleDistrictChange,
  };
}; 