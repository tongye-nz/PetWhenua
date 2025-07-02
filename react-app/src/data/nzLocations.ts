// Location data structure
export interface District {
  DistrictId: number;
  Name: string;
}

export interface Region {
  LocalityId: number;
  Name: string;
  Districts: District[];
}

// New Zealand regions and districts data
export const NZ_REGIONS: Region[] = [
  {
    LocalityId: 9,
    Name: "Northland",
    Districts: [
      { DistrictId: 1, Name: "Far North" },
      { DistrictId: 2, Name: "Kaipara" },
      { DistrictId: 3, Name: "Whangarei" }
    ]
  },
  {
    LocalityId: 2,
    Name: "Auckland",
    Districts: [
      { DistrictId: 4, Name: "Auckland City" },
      { DistrictId: 5, Name: "Franklin" },
      { DistrictId: 6, Name: "Manukau" },
      { DistrictId: 7, Name: "North Shore" },
      { DistrictId: 8, Name: "Papakura" },
      { DistrictId: 9, Name: "Rodney" },
      { DistrictId: 10, Name: "Waitakere" }
    ]
  },
  {
    LocalityId: 3,
    Name: "Waikato",
    Districts: [
      { DistrictId: 11, Name: "Hamilton" },
      { DistrictId: 12, Name: "Hauraki" },
      { DistrictId: 13, Name: "Matamata-Piako" },
      { DistrictId: 14, Name: "Otorohanga" },
      { DistrictId: 15, Name: "South Waikato" },
      { DistrictId: 16, Name: "Taupo" },
      { DistrictId: 17, Name: "Thames-Coromandel" },
      { DistrictId: 18, Name: "Waikato" },
      { DistrictId: 19, Name: "Waipa" },
      { DistrictId: 20, Name: "Waitomo" }
    ]
  },
  {
    LocalityId: 4,
    Name: "Bay of Plenty",
    Districts: [
      { DistrictId: 21, Name: "Kawerau" },
      { DistrictId: 22, Name: "Opotiki" },
      { DistrictId: 23, Name: "Rotorua" },
      { DistrictId: 24, Name: "Tauranga" },
      { DistrictId: 25, Name: "Western Bay of Plenty" },
      { DistrictId: 26, Name: "Whakatane" }
    ]
  },
  {
    LocalityId: 5,
    Name: "Gisborne",
    Districts: [
      { DistrictId: 27, Name: "Gisborne" }
    ]
  },
  {
    LocalityId: 6,
    Name: "Hawke's Bay",
    Districts: [
      { DistrictId: 28, Name: "Central Hawke's Bay" },
      { DistrictId: 29, Name: "Hastings" },
      { DistrictId: 30, Name: "Napier" },
      { DistrictId: 31, Name: "Wairoa" }
    ]
  },
  {
    LocalityId: 7,
    Name: "Taranaki",
    Districts: [
      { DistrictId: 32, Name: "New Plymouth" },
      { DistrictId: 33, Name: "South Taranaki" },
      { DistrictId: 34, Name: "Stratford" }
    ]
  },
  {
    LocalityId: 8,
    Name: "Manawatu-Wanganui",
    Districts: [
      { DistrictId: 35, Name: "Horowhenua" },
      { DistrictId: 36, Name: "Manawatu" },
      { DistrictId: 37, Name: "Palmerston North" },
      { DistrictId: 38, Name: "Rangitikei" },
      { DistrictId: 39, Name: "Ruapehu" },
      { DistrictId: 40, Name: "Tararua" },
      { DistrictId: 41, Name: "Wanganui" }
    ]
  },
  {
    LocalityId: 1,
    Name: "Wellington",
    Districts: [
      { DistrictId: 42, Name: "Carterton" },
      { DistrictId: 43, Name: "Hutt" },
      { DistrictId: 44, Name: "Kapiti Coast" },
      { DistrictId: 45, Name: "Masterton" },
      { DistrictId: 46, Name: "Porirua" },
      { DistrictId: 47, Name: "South Wairarapa" },
      { DistrictId: 48, Name: "Upper Hutt" },
      { DistrictId: 49, Name: "Wellington City" }
    ]
  },
  {
    LocalityId: 12,
    Name: "Tasman",
    Districts: [
      { DistrictId: 50, Name: "Tasman" }
    ]
  },
  {
    LocalityId: 13,
    Name: "Nelson",
    Districts: [
      { DistrictId: 51, Name: "Nelson" }
    ]
  },
  {
    LocalityId: 14,
    Name: "Marlborough",
    Districts: [
      { DistrictId: 52, Name: "Marlborough" }
    ]
  },
  {
    LocalityId: 15,
    Name: "West Coast",
    Districts: [
      { DistrictId: 53, Name: "Buller" },
      { DistrictId: 54, Name: "Grey" },
      { DistrictId: 55, Name: "Westland" }
    ]
  },
  {
    LocalityId: 16,
    Name: "Canterbury",
    Districts: [
      { DistrictId: 56, Name: "Ashburton" },
      { DistrictId: 57, Name: "Banks Peninsula" },
      { DistrictId: 58, Name: "Christchurch City" },
      { DistrictId: 59, Name: "Hurunui" },
      { DistrictId: 60, Name: "Mackenzie" },
      { DistrictId: 61, Name: "Selwyn" },
      { DistrictId: 62, Name: "Timaru" },
      { DistrictId: 63, Name: "Waimakariri" },
      { DistrictId: 64, Name: "Waimate" }
    ]
  },
  {
    LocalityId: 17,
    Name: "Otago",
    Districts: [
      { DistrictId: 65, Name: "Central Otago" },
      { DistrictId: 66, Name: "Clutha" },
      { DistrictId: 67, Name: "Dunedin" },
      { DistrictId: 68, Name: "Queenstown-Lakes" },
      { DistrictId: 69, Name: "Waitaki" }
    ]
  },
  {
    LocalityId: 18,
    Name: "Southland",
    Districts: [
      { DistrictId: 70, Name: "Gore" },
      { DistrictId: 71, Name: "Invercargill" },
      { DistrictId: 72, Name: "Southland" }
    ]
  }
];

// Utility functions
export const getDistrictsByRegion = (regionName: string): District[] => {
  const region = NZ_REGIONS.find(r => r.Name === regionName);
  return region ? region.Districts : [];
};

export const getRegionByName = (regionName: string): Region | undefined => {
  return NZ_REGIONS.find(r => r.Name === regionName);
};

export const isValidDistrictForRegion = (regionName: string, districtName: string): boolean => {
  const districts = getDistrictsByRegion(regionName);
  return districts.some(d => d.Name === districtName);
}; 