import { Country } from '@/types';

// Fetch countries from multiple API endpoints with fallback
export const fetchCountries = async (): Promise<Country[]> => {
  const apiEndpoints = [
    'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,flags,idd',
    'https://restcountries.com/v3.1/independent?fields=name,cca2,cca3,flags,idd',
    'https://restcountries.com/v3.1/region/Europe?fields=name,cca2,cca3,flags,idd',
  ];

  let countries: Country[] = [];

  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        countries = data
          .filter((country: any) => country.idd?.root && country.idd?.suffixes?.[0])
          .map((country: any) => ({
            name: country.name,
            cca2: country.cca2,
            cca3: country.cca3,
            flag: country.flags?.svg || country.flags?.png,
            dialCode: country.idd.root + country.idd.suffixes[0],
          }))
          .sort((a: Country, b: Country) => a.name.common.localeCompare(b.name.common));

        if (countries.length > 0) {
          console.log(`Countries loaded from: ${endpoint}`);
          break;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error);
      continue;
    }
  }

  if (countries.length === 0) {
    console.warn('All API endpoints failed, using fallback countries');
    return getFallbackCountries();
  }

  return countries;
};

// Fallback countries list
const getFallbackCountries = (): Country[] => {
  return [
    {
      name: { common: 'United States', official: 'United States of America' },
      cca2: 'US',
      cca3: 'USA',
      flag: 'https://flagcdn.com/us.svg',
      dialCode: '+1',
    },
    {
      name: { common: 'United Kingdom', official: 'United Kingdom of Great Britain and Northern Ireland' },
      cca2: 'GB',
      cca3: 'GBR',
      flag: 'https://flagcdn.com/gb.svg',
      dialCode: '+44',
    },
    {
      name: { common: 'India', official: 'Republic of India' },
      cca2: 'IN',
      cca3: 'IND',
      flag: 'https://flagcdn.com/in.svg',
      dialCode: '+91',
    },
    {
      name: { common: 'Canada', official: 'Canada' },
      cca2: 'CA',
      cca3: 'CAN',
      flag: 'https://flagcdn.com/ca.svg',
      dialCode: '+1',
    },
    {
      name: { common: 'Australia', official: 'Commonwealth of Australia' },
      cca2: 'AU',
      cca3: 'AUS',
      flag: 'https://flagcdn.com/au.svg',
      dialCode: '+61',
    },
    {
      name: { common: 'Germany', official: 'Federal Republic of Germany' },
      cca2: 'DE',
      cca3: 'DEU',
      flag: 'https://flagcdn.com/de.svg',
      dialCode: '+49',
    },
    {
      name: { common: 'France', official: 'French Republic' },
      cca2: 'FR',
      cca3: 'FRA',
      flag: 'https://flagcdn.com/fr.svg',
      dialCode: '+33',
    },
    {
      name: { common: 'Japan', official: 'Japan' },
      cca2: 'JP',
      cca3: 'JPN',
      flag: 'https://flagcdn.com/jp.svg',
      dialCode: '+81',
    },
    {
      name: { common: 'Brazil', official: 'Federative Republic of Brazil' },
      cca2: 'BR',
      cca3: 'BRA',
      flag: 'https://flagcdn.com/br.svg',
      dialCode: '+55',
    },
    {
      name: { common: 'China', official: 'People\'s Republic of China' },
      cca2: 'CN',
      cca3: 'CHN',
      flag: 'https://flagcdn.com/cn.svg',
      dialCode: '+86',
    },
  ];
};
