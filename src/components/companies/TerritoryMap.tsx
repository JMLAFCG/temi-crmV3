import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Move } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

// Fix pour l'icône du marqueur Leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TerritoryMapProps {
  address: {
    street?: string;
    city?: string;
    postalCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  territory?: {
    center: {
      lat: number;
      lng: number;
    };
    radius: number;
  };
  onTerritoryChange: (territory: { center: { lat: number; lng: number }; radius: number }) => void;
}

const RadiusControl: React.FC<{
  radius: number;
  onChange: (radius: number) => void;
}> = ({ radius, onChange }) => {
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Rayon de couverture</h3>
      <div className="flex items-center space-x-2">
        <Input
          type="range"
          min={10}
          max={100}
          value={radius}
          onChange={e => onChange(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-gray-600">{radius} km</span>
      </div>
    </div>
  );
};

const MapEvents: React.FC<{
  onMoveEnd: (center: LatLng) => void;
}> = ({ onMoveEnd }) => {
  const map = useMapEvents({
    moveend: () => {
      onMoveEnd(map.getCenter());
    },
  });
  return null;
};

export const TerritoryMap: React.FC<TerritoryMapProps> = ({
  address,
  territory,
  onTerritoryChange,
}) => {
  const [center, setCenter] = useState<[number, number]>([
    territory?.center.lat || 46.603354,
    territory?.center.lng || 1.888334,
  ]);
  const [radius, setRadius] = useState(territory?.radius || 50);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address.coordinates) {
      setCenter([address.coordinates.lat, address.coordinates.lng]);
    }
  }, [address.coordinates]);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    onTerritoryChange({
      center: { lat: center[0], lng: center[1] },
      radius: newRadius,
    });
  };

  const handleCenterChange = (newCenter: LatLng) => {
    setCenter([newCenter.lat, newCenter.lng]);
    onTerritoryChange({
      center: { lat: newCenter.lat, lng: newCenter.lng },
      radius,
    });
  };

  return (
    <div className="relative h-[500px] w-full rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={8} className="h-full w-full" zoomControl={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle
          center={center}
          radius={radius * 1000}
          pathOptions={{
            color: '#1B3B6F',
            fillColor: '#1B3B6F',
            fillOpacity: 0.2,
          }}
        />

        <Marker position={center}>
          <Popup>
            <div className="text-sm">
              <p className="font-medium">Siège social</p>
              <p>{address.street}</p>
              <p>
                {address.postalCode} {address.city}
              </p>
            </div>
          </Popup>
        </Marker>

        <MapEvents onMoveEnd={handleCenterChange} />

        <RadiusControl radius={radius} onChange={handleRadiusChange} />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
        <p className="text-sm text-gray-600 mb-2">
          <Move className="inline-block mr-1" size={16} />
          Déplacez la carte pour ajuster la zone
        </p>
        <p className="text-sm text-gray-600">
          <MapPin className="inline-block mr-1" size={16} />
          Utilisez le curseur pour définir le rayon
        </p>
      </div>
    </div>
  );
};
