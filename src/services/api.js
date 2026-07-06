const isLocal = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1' || 
  window.location.hostname.startsWith('192.168.');

export const BASE_URL = isLocal ? 'http://localhost:3001' : '/api';

export const apiFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`Sunucu Hatası: ${response.statusText || response.status}`);
    }

    return await response.json();
};
