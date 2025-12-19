// Venue coordinates
const VENUE_LAT = 11.024381;
const VENUE_LON = 77.003108;
const ALLOWED_RADIUS_METERS = 100; // 100 meters

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in meters
  return distance;
}

/**
 * Get user's current location
 * @returns {Promise<{lat: number, lon: number}>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser. Please use a mobile device or enable location services.'));
      return;
    }

    // More lenient options for desktop/Mac devices
    const options = {
      enableHighAccuracy: false, // Set to false for better compatibility with Mac/desktop
      timeout: 15000, // Increased timeout
      maximumAge: 300000 // Allow cached location up to 5 minutes old
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings to mark attendance. On Mac: System Preferences > Security & Privacy > Location Services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. This may happen on desktop/Mac devices without GPS. Please use a mobile device for attendance marking, or ensure location services are enabled.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or use a mobile device.';
            break;
          default:
            errorMessage += 'An unknown error occurred. Please use a mobile device for attendance marking.';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
}

/**
 * Check if running in development mode (localhost)
 */
function isDevelopmentMode() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('localhost');
}

/**
 * Verify if user is within allowed radius of the venue
 * @returns {Promise<{isValid: boolean, distance: number, message: string}>}
 */
export async function verifyLocation() {
  try {
    const userLocation = await getCurrentLocation();
    const distance = calculateDistance(
      VENUE_LAT,
      VENUE_LON,
      userLocation.lat,
      userLocation.lon
    );

    const isValid = distance <= ALLOWED_RADIUS_METERS;
    const message = isValid
      ? `Location verified. You are ${Math.round(distance)}m from the venue.`
      : `You are ${Math.round(distance)}m away from the venue. Attendance can only be marked within 100m of the venue.`;

    return {
      isValid,
      distance: Math.round(distance),
      message
    };
  } catch (error) {
    // In development mode, allow bypass for testing (but warn user)
    if (isDevelopmentMode()) {
      console.warn('Development mode: Location verification failed. Allowing bypass for testing.');
      return {
        isValid: true,
        distance: null,
        message: 'Development mode: Location check bypassed. In production, location verification is required.'
      };
    }

    return {
      isValid: false,
      distance: null,
      message: error.message || 'Failed to verify location. Please use a mobile device with GPS for attendance marking.'
    };
  }
}

