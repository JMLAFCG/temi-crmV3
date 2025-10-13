import axios from 'axios';

export const fetchCityFromPostalCode = async (postalCode: string) => {
  try {
    const response = await axios.get(`https://api.zippopotam.us/fr/${postalCode}`);
    return response.data.places.map((place: any) => ({
      name: place['place name'],
      code: postalCode,
    }));
  } catch (error) {
    console.error('Error fetching city:', error);
    throw new Error('Impossible de récupérer les informations de la ville');
  }
};
