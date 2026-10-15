export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

interface NominatimItem {
  lat: string;
  lon: string;
  display_name: string;
}

/*
 * Cerca un indirizzo con Nominatim (OpenStreetMap), dando la precedenza
 * a Parigi e all'Île-de-France senza escludere il resto della Francia.
 */
export async function geocodeAddress(
  query: string,
): Promise<GeocodeResult | null> {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'fr',
    viewbox: '1.4,49.2,3.6,48.1',
    bounded: '0',
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: { Accept: 'application/json' } },
  );

  if (!response.ok) {
    throw new Error('Il servizio di ricerca degli indirizzi non è disponibile.');
  }

  const results = (await response.json()) as NominatimItem[];
  const first = results[0];

  if (!first) {
    return null;
  }

  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    displayName: first.display_name,
  };
}
