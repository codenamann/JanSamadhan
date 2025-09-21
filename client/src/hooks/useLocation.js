import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setLoading(true);
      setError(null);
      console.log('🌍 Requesting location permission...');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('📍 Location received:', { latitude, longitude, accuracy });
          
          try {
            // Try multiple reverse geocoding services for better accuracy
            let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            // Try OpenStreetMap Nominatim first (free, no API key needed)
            try {
              console.log('🔍 Trying OpenStreetMap Nominatim...');
              const nominatimResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
              );
              const nominatimData = await nominatimResponse.json();
              console.log('🗺️ Nominatim response:', nominatimData);
              
              if (nominatimData.display_name) {
                address = nominatimData.display_name;
                console.log('✅ Address from Nominatim:', address);
              }
            } catch (nominatimError) {
              console.warn('⚠️ Nominatim failed:', nominatimError);
            }

            // Fallback to BigDataCloud if Nominatim fails
            if (address === `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`) {
              try {
                console.log('🔍 Trying BigDataCloud...');
                const bigDataResponse = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const bigDataData = await bigDataResponse.json();
                console.log('🌐 BigDataCloud response:', bigDataData);
                
                if (bigDataData.localityInfo) {
                  const admin = bigDataData.localityInfo.administrative;
                  const locality = bigDataData.localityInfo.locality;
                  
                  if (admin && admin.length > 0) {
                    address = `${admin[0].name}${admin[1] ? ', ' + admin[1].name : ''}${admin[2] ? ', ' + admin[2].name : ''}`;
                  } else if (locality && locality.length > 0) {
                    address = locality[0].name;
                  }
                  console.log('✅ Address from BigDataCloud:', address);
                }
              } catch (bigDataError) {
                console.warn('⚠️ BigDataCloud failed:', bigDataError);
              }
            }
            
            const locationData = {
              lat: parseFloat(latitude.toFixed(6)),
              lng: parseFloat(longitude.toFixed(6)),
              address: address,
              accuracy: accuracy
            };
            
            console.log('📍 Final location data:', locationData);
            setLocation(locationData);
            setLoading(false);
            resolve(locationData);
          } catch (err) {
            console.error('❌ Reverse geocoding failed:', err);
            // Fallback to coordinates if reverse geocoding fails
            const locationData = {
              lat: parseFloat(latitude.toFixed(6)),
              lng: parseFloat(longitude.toFixed(6)),
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              accuracy: accuracy
            };
            
            console.log('📍 Fallback location data:', locationData);
            setLocation(locationData);
            setLoading(false);
            resolve(locationData);
          }
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          let errorMessage = 'Location access denied. Please allow location permissions.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please allow location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while retrieving location.';
              break;
          }
          
          console.error('❌ Location error:', errorMessage);
          setError(errorMessage);
          setLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  };

  const clearLocation = () => {
    console.log('🧹 Clearing location data');
    setLocation(null);
    setError(null);
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearLocation
  };
};
