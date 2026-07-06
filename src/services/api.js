// Hem local hem Vercel'de /api kullanılır.
// Local'de: Vite proxy /api → localhost:3001'e yönlendirir (vite.config.js)
// Vercel'de: vercel.json rewrites /api/* → api/server.js fonksiyonuna yönlendirir
export const BASE_URL = '/api';


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
