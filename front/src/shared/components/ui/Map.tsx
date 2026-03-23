
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // v5 (compatible with React 19?) - check peer deps, might need to fix if issues arise.
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon missing in Leaflet + Webpack/Vite
// We need to properly point to the images or use a custom icon.
// A common easy fix is providing the prototype options or importing images directly.

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Extend the Leaflet Default Icon prototype (Typescript hack might be needed or just forcecast)
/* eslint-disable @typescript-eslint/no-explicit-any */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
 iconRetinaUrl: iconRetinaUrl,
 iconUrl: iconUrl,
 shadowUrl: shadowUrl,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

interface MapMarker {
 id: string | number;
 latitude: number;
 longitude: number;
 title: string;
 description?: string;
 link?: string;
 color?: string; // Hex color or Tailwind class identifier (e.g. 'red', 'blue')
}

interface MapProps {
 markers: MapMarker[];
 center?: [number, number]; // Default center
 zoom?: number;
 height?: string; // CSS height
}

const DEFAULT_CENTER: [number, number] = [45.75, 4.85]; // Lyon, France (Auvergne-Rhône-Alpes center-ish)
const DEFAULT_ZOOM = 7;

// Function to create a custom SVG icon with a dynamic color
const createCustomIcon = (color: string) => {
 const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#FFFFFF"></circle>
    </svg>
  `;

 return L.divIcon({
  className: 'custom-map-marker',
  html: svg,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
 });
};

export default function Map({
 markers,
 center = DEFAULT_CENTER,
 zoom = DEFAULT_ZOOM,
 height = '500px'
}: MapProps) {

 return (
  <div style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
   <MapContainer
    center={center}
    zoom={zoom}
    scrollWheelZoom={true}
    style={{ height: '100%', width: '100%' }}
   >
    <TileLayer
     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    {markers.map((marker) => {
     const icon = marker.color
      ? createCustomIcon(marker.color)
      : undefined; // Fallback to default if no color

     return (
      <Marker
       key={marker.id}
       position={[marker.latitude, marker.longitude]}
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       icon={icon as any} // Cast to any to avoid strict type issues with Icon vs DivIcon in react-leaflet typings
      >
       <Popup>
        <div className="p-1">
         <h3 className="font-bold text-sm mb-1">{marker.title}</h3>
         {marker.description && <p className="text-xs text-text-secondary mb-2">{marker.description}</p>}
         {marker.link && (
          <a
           href={marker.link}
           className="text-xs text-primary hover:underline font-medium"
          >
           Voir le détail
          </a>
         )}
        </div>
       </Popup>
      </Marker>
     );
    })}
   </MapContainer>
  </div>
 );
}
