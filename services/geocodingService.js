const { Client } = require('@googlemaps/google-maps-services-js');
require('dotenv').config();

const client = new Client({});

/**
 * Service class for handling Google Maps Geocoding operations
 * Converts street addresses into geographic coordinates
 */

class GeocodingService {
    static async geocodeAddress(address) {
        try {
            // Make API request to Google Maps Geocoding service
            const response = await client.geocode({
                params: {
                    address: address,
                    key: process.env.GOOGLE_MAPS_API_KEY
                }
            });

            // Handle case where no results are found
            if (response.data.results.length === 0) {
                throw new Error('Address not found');
            }

            // Extract the first (most relevant) result
            const result = response.data.results[0];

            // Return successful response with formatted location data
            return {
                success: true,
                data: {
                    latitude: result.geometry.location.lat,
                    longitude: result.geometry.location.lng,
                    formattedAddress: result.formatted_address,
                    placeId: result.place_id
                }
            };
        } catch (error) {
            
            console.error('Geocoding error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    static handleGeocodingError(error) {
        if (error.response) {
            const { status } = error.response;
            switch (status) {
                case 400:
                    return 'Invalid address provided';
                case 403:
                    return 'Invalid API key or quota exceeded';
                case 429:
                    return 'Too many requests, please try again later';
                default:
                    return 'Geocoding service error';
            }
        }
        return 'Network error occurred';
    }
}

module.exports = GeocodingService; 
