'use client';

import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface CityPin {
    _id: string;
    name: string;
    stateCode: string;
    country?: string;
    location?: { coordinates?: [number, number] };
}

interface Props {
    cities: CityPin[];
}

export default function CityPinsMap({ cities }: Props) {
    const pins = cities.filter(c => c.location?.coordinates?.length === 2);

    return (
        <div style={{ height: 520, width: '100%', borderRadius: 8, overflow: 'hidden', background: '#111827' }}>
            <MapContainer
                center={[22.5, 82]}
                zoom={4}
                style={{ height: '100%', width: '100%', background: '#111827' }}
                scrollWheelZoom={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution=""
                />
                {pins.map(city => {
                    const [lng, lat] = city.location!.coordinates!;
                    return (
                        <CircleMarker
                            key={city._id}
                            center={[lat, lng]}
                            radius={6}
                            pathOptions={{ color: '#1890ff', fillColor: '#1890ff', fillOpacity: 0.85, weight: 1 }}
                        >
                            <Tooltip>
                                <div style={{ fontSize: 12 }}>
                                    <strong>{city.name}</strong><br />
                                    {city.stateCode}{city.country && city.country !== 'India' ? `, ${city.country}` : ''}
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
