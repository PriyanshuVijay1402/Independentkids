const express = require('express');
const router = express.Router();
const GeocodingService = require('../services/geocodingService');

/**
 * Geocoding Routes
 * Handles HTTP requests for address geocoding operations
 */

router.post('/geocode', async (req, res) => {
    try {
        // Extract address from request body
        const { address } = req.body;

        // Validate that address is provided
        if (!address) {
            return res.status(400).json({ 
                success: false, 
                error: 'Address is required' 
            });
        }
        
        // Call geocoding service to convert address
        const result = await GeocodingService.geocodeAddress(address);

        // If geocoding failed, return 400 status
        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Geocoding service failed' 
        });
    }
});

module.exports = router; 