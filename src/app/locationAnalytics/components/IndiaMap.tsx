'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Layer, PathOptions } from 'leaflet';

interface StateData {
    state: string;
    sessions: number;
    coordinates: [number, number] | null;
}

interface Props {
    stateBreakdown: StateData[];
    totalSessions: number;
}

// 5 quantile-break blue buckets
const BUCKETS = [
    '#dbeafe', // lightest
    '#93c5fd',
    '#3b82f6',
    '#1d4ed8',
    '#1e3a8a', // darkest
];

const normalize = (s: string) => s?.toLowerCase().trim().replace(/\s+/g, ' ') ?? '';

// Common state name aliases to help matching
const STATE_ALIASES: Record<string, string> = {
    'uttarakhand': 'uttaranchal',
    'uttaranchal': 'uttarakhand',
    'jammu & kashmir': 'jammu and kashmir',
    'jammu and kashmir': 'jammu & kashmir',
    'odisha': 'orissa',
    'orissa': 'odisha',
    'telangana': 'telengana',
    'telengana': 'telangana',
};

function buildSessionMap(stateBreakdown: StateData[]) {
    const map = new Map<string, number>();
    for (const row of stateBreakdown) {
        if (row.state) map.set(normalize(row.state), row.sessions);
    }
    return map;
}

function getColor(sessions: number, breaks: number[]): string {
    if (sessions === 0) return '#1f2937'; // dark grey for zero
    for (let i = 0; i < breaks.length; i++) {
        if (sessions <= breaks[i]) return BUCKETS[i];
    }
    return BUCKETS[BUCKETS.length - 1];
}

function computeQuantileBreaks(counts: number[]): number[] {
    if (!counts.length) return [0, 0, 0, 0, Infinity];
    const sorted = [...counts].sort((a, b) => a - b);
    const q = (p: number) => sorted[Math.floor(p * (sorted.length - 1))];
    return [q(0.2), q(0.4), q(0.6), q(0.8), Infinity];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoJsonFeature = { properties: Record<string, any> };

export default function IndiaMap({ stateBreakdown, totalSessions }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [geojson, setGeojson] = useState<any>(null);

    useEffect(() => {
        fetch('/india-states.geojson')
            .then(r => r.json())
            .then(setGeojson)
            .catch(() => setGeojson(null));
    }, []);

    const sessionMap = buildSessionMap(stateBreakdown);
    const breaks = computeQuantileBreaks(stateBreakdown.map(r => r.sessions));

    const getSessionsForFeature = (feature: GeoJsonFeature): { name: string; sessions: number } => {
        const rawName: string = feature.properties?.NAME_1 ?? feature.properties?.ST_NM ?? feature.properties?.name ?? '';
        const normName = normalize(rawName);
        const sessions = sessionMap.get(normName)
            ?? sessionMap.get(STATE_ALIASES[normName] ?? '')
            ?? 0;
        return { name: rawName, sessions };
    };

    const styleFeature = (feature?: GeoJsonFeature): PathOptions => {
        if (!feature) return {};
        const { sessions } = getSessionsForFeature(feature);
        return {
            fillColor: getColor(sessions, breaks),
            fillOpacity: 0.85,
            color: '#374151',
            weight: 1,
        };
    };

    const onEachFeature = (feature: GeoJsonFeature, layer: Layer) => {
        const { name, sessions } = getSessionsForFeature(feature);
        const pct = totalSessions > 0 ? ((sessions / totalSessions) * 100).toFixed(1) : '0.0';
        layer.bindTooltip(
            `<div style="font-family:sans-serif;font-size:13px;padding:4px 8px">
                <strong>${name}</strong><br/>
                ${sessions.toLocaleString()} sessions (${pct}%)
            </div>`,
            { sticky: true, opacity: 0.95 }
        );
    };

    return (
        <div style={{ height: 480, width: '100%', borderRadius: 8, overflow: 'hidden', background: '#111827' }}>
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
                {geojson && (
                    <GeoJSON
                        key={JSON.stringify(stateBreakdown.map(s => s.sessions))}
                        data={geojson}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        style={styleFeature as any}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onEachFeature={onEachFeature as any}
                    />
                )}
            </MapContainer>
        </div>
    );
}
