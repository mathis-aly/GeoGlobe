'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGlobeStore } from '@/store/useGlobeStore';
import * as THREE from 'three';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

const MARITIME_ROUTES = [
    {
        name: "Route Asie-Europe (Nouvelle Route de la Soie maritime)",
        coords: [
            [31.23, 121.47], [22.28, 114.15], [1.29, 103.85], [5.93, 80.51],
            [11.59, 43.34], [29.92, 32.55], [35.89, 14.51], [35.97, -5.95], [51.92, 4.47]
        ],
        color: 'rgba(56, 189, 248, 0.4)'
    },
    {
        name: "Route Transpacifique",
        coords: [
            [22.54, 114.05], [31.23, 121.47], [35.67, 139.65],
            [45.0, 170.0], [45.0, -160.0], [34.05, -118.24]
        ],
        color: 'rgba(56, 189, 248, 0.4)'
    },
    {
        name: "Route Transatlantique",
        coords: [
            [51.92, 4.47], [49.93, -2.93], [40.71, -74.00]
        ],
        color: 'rgba(56, 189, 248, 0.4)'
    },
    {
        name: "Route de l'Océan Indien (Cap de Bonne-Espérance)",
        coords: [
            [1.29, 103.85], [-20.0, 60.0], [-35.0, 20.0], [-10.0, -10.0], [35.97, -5.95]
        ],
        color: 'rgba(56, 189, 248, 0.4)'
    }
];

export default function GeoGlobe() {
    const globeRef = useRef<any>(null);
    const [countries, setCountries] = useState({ features: [] });

    const selectedCountryCode = useGlobeStore((state) => state.selectedCountryCode);
    const setSelectedCountry = useGlobeStore((state) => state.setSelectedCountry);
    const countryData = useGlobeStore((state) => state.countryData);
    const globalCountriesData = useGlobeStore((state) => state.globalCountriesData);
    const filters = useGlobeStore((state) => state.filters);
    const minResourceVolume = useGlobeStore((state) => state.minResourceVolume);
    const activeLayer = useGlobeStore((state) => state.activeLayer);
    const activeResourceData = useGlobeStore((state) => state.activeResourceData);

    const maxResourceVolume = useMemo(() => {
        if (!activeResourceData || activeResourceData.length === 0) return 1;
        return Math.max(...activeResourceData.map((d: any) => d.volume));
    }, [activeResourceData]);

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(setCountries);
    }, []);

    // CORRECTION 1 : Attendre que Three.js soit prêt pour éviter le crash (Race Condition)
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const applyHoloStyle = () => {
            // On vérifie que la référence existe ET que la méthode est bien chargée par le composant
            if (globeRef.current && typeof globeRef.current.globeMaterial === 'function') {
                const scene = globeRef.current.scene();
                scene.background = null;

                const material = globeRef.current.globeMaterial();
                material.emissive = new THREE.Color('#06b6d4');
                material.emissiveIntensity = 0.1;
                material.color = new THREE.Color('#000000');

                const directionalLight = scene.children.find((obj: any) => obj.type === 'DirectionalLight');
                if (directionalLight) {
                    directionalLight.color = new THREE.Color('#06b6d4');
                    directionalLight.intensity = 1.2;
                }

                const ambientLight = scene.children.find((obj: any) => obj.type === 'AmbientLight');
                if (ambientLight) {
                    ambientLight.color = new THREE.Color('#0891b2');
                    ambientLight.intensity = 0.4;
                }
            } else {
                // Si ce n'est pas prêt, on relance la fonction un dixième de seconde plus tard
                timeoutId = setTimeout(applyHoloStyle, 100);
            }
        };

        applyHoloStyle();

        return () => clearTimeout(timeoutId); // Nettoyage
    }, [countries]);

    const displayArcs = useMemo(() => {
        if (!countryData || !countryData.lat || !countryData.lng) return [];

        if (activeLayer === 'TRADE_ROUTES' && countryData.exports) {
            return countryData.exports.map((route: any) => ({
                startLat: countryData.lat,
                startLng: countryData.lng,
                endLat: route.target.lat,
                endLng: route.target.lng,
                color: ['#06b6d4', '#3b82f6'], 
                stroke: 0.3
            }));
        }

        if (activeLayer === 'DIPLOMACY' && countryData.diplomaticMissions) {
            return countryData.diplomaticMissions.map((mission: any) => ({
                startLat: countryData.lat,
                startLng: countryData.lng,
                endLat: mission.target.lat,
                endLng: mission.target.lng,
                color: ['#d946ef', '#a855f7'], 
                stroke: Math.min(0.2 + (mission.count * 0.1), 1)
            }));
        }

        const globalAlliances = useGlobeStore.getState().globalAlliances;

        if (activeLayer === 'ALLIANCES' && globalAlliances) {
            const arcs: any[] = [];
            globalAlliances.forEach((alliance: any) => {
                if (filters.allianceId && filters.allianceId !== alliance.id) return;
                if (filters.allianceType === 'ECONOMIC' && !alliance.isEconomic) return;
                if (filters.allianceType === 'POLITICAL' && !alliance.isPolitical) return;
                if (filters.allianceType === 'MILITARY' && !alliance.isMilitary) return;

                if (alliance.members && alliance.members.length > 1) {
                    for (let i = 0; i < alliance.members.length; i++) {
                        for (let j = i + 1; j < alliance.members.length; j++) {
                            const source = alliance.members[i];
                            const target = alliance.members[j];

                            if (source.lat && source.lng && target.lat && target.lng) {
                                arcs.push({
                                    startLat: source.lat,
                                    startLng: source.lng,
                                    endLat: target.lat,
                                    endLng: target.lng,
                                    color: [alliance.color, alliance.color],
                                    stroke: (selectedCountryCode === source.id || selectedCountryCode === target.id) ? 0.8 : 0.15
                                });
                            }
                        }
                    }
                }
            });
            return arcs;
        }

        return [];
    }, [countryData, activeLayer, filters, selectedCountryCode]);

    return (
        // CORRECTION 2 : bg-transparent laisse passer l'arrière-plan de layout.tsx
        <div className="w-full h-screen cursor-move bg-transparent">
            <Globe
                ref={globeRef}
                globeImageUrl={null}
                showAtmosphere={true}
                atmosphereColor="#06b6d4" 
                atmosphereAltitude={0.15}
                backgroundColor="rgba(0,0,0,0)" // Sécurité supplémentaire pour la transparence du canvas

                polygonsData={countries.features}
                polygonAltitude={0.015} 

                polygonCapColor={({ properties: d }: any) => {
                    const code = d.ISO_A3 !== '-99' ? d.ISO_A3 : d.ADM0_A3;

                    if (code === selectedCountryCode) return 'rgba(34, 211, 238, 0.7)';

                    if (!filters.search && filters.minGdp === '' && filters.minPop === '' && !filters.allianceId && !filters.allianceType) {
                        return 'rgba(6, 182, 212, 0.15)'; 
                    }

                    const dbCountry = globalCountriesData.find(c => c.id === code);
                    let isMatch = true;

                    if (filters.search && !d.ADMIN.toLowerCase().includes(filters.search.toLowerCase())) isMatch = false;
                    if (filters.minPop !== '' && (!dbCountry || !dbCountry.population || dbCountry.population < (filters.minPop as number))) isMatch = false;
                    if (filters.minGdp !== '' && (!dbCountry || !dbCountry.gdp || dbCountry.gdp < (filters.minGdp as number))) isMatch = false;

                    if (filters.allianceId !== '') {
                        if (!dbCountry || !dbCountry.alliances || !dbCountry.alliances.some((a: any) => a.id === filters.allianceId)) {
                            isMatch = false;
                        }
                    }

                    if (filters.allianceType !== '') {
                        if (!dbCountry || !dbCountry.alliances) {
                            isMatch = false;
                        } else {
                            const typeMatches = dbCountry.alliances.some((a: any) => {
                                if (filters.allianceType === 'ECONOMIC') return a.isEconomic;
                                if (filters.allianceType === 'POLITICAL') return a.isPolitical;
                                if (filters.allianceType === 'MILITARY') return a.isMilitary;
                                return false;
                            });
                            if (!typeMatches) isMatch = false;
                        }
                    }

                    return isMatch ? 'rgba(6, 182, 212, 0.6)' : 'rgba(15, 23, 42, 0.8)';
                }}

                polygonSideColor={() => 'rgba(6, 182, 212, 0.2)'}
                polygonStrokeColor={() => 'rgba(6, 182, 212, 0.5)'}

                polygonLabel={({ properties: d }: any) => {
                    const code = d.ISO_A3 !== '-99' ? d.ISO_A3 : d.ADM0_A3;
                    return `
            <div style="background: rgba(3, 7, 18, 0.9); border: 1px solid rgba(6, 182, 212, 0.5); padding: 8px; color: #cffafe; font-family: monospace; font-size: 11px;">
              <b style="color: #22d3ee;">${d.ADMIN.toUpperCase()}</b> <br />
              ISO: ${code}
            </div>
          `;
                }}

                onPolygonClick={({ properties: d }: any) => {
                    const code = d.ISO_A3 !== '-99' ? d.ISO_A3 : d.ADM0_A3;
                    if (code === '-99') {
                        console.warn('Ce territoire ne possède aucun code valide.');
                        return;
                    }
                    setSelectedCountry(code);
                }}

                arcsData={displayArcs}
                arcStartLat={(d: any) => d.startLat}
                arcStartLng={(d: any) => d.startLng}
                arcEndLat={(d: any) => d.endLat}
                arcEndLng={(d: any) => d.endLng}
                arcColor={(d: any) => d.color}
                arcStroke={(d: any) => d.stroke}
                arcDashLength={0.4}
                arcDashGap={0.2}
                arcDashAnimateTime={1500}
                arcAltitudeAutoScale={0.3}

                pathsData={MARITIME_ROUTES}
                pathPoints="coords"
                pathPointLat={(p: any) => p[0]}
                pathPointLng={(p: any) => p[1]}
                pathColor={(path: any) => path.color}
                pathDashLength={0.05}
                pathDashGap={0.02}
                pathDashAnimateTime={8000}
                pathStroke={0.5}

                pointsData={activeLayer === 'RESOURCES' ? activeResourceData.filter((d: any) => d.volume >= minResourceVolume) : []}
                pointLat={(d: any) => d.country.lat}
                pointLng={(d: any) => d.country.lng}
                pointColor={(d: any) => d.resource.color}
                pointAltitude={(d: any) => (d.volume / maxResourceVolume) * 0.4}
                pointRadius={0.3}
                pointsMerge={false}
                pointResolution={32}
                pointLabel={(d: any) => `
          <div style="background: rgba(3, 7, 18, 0.9); border: 1px solid ${d.resource.color}; padding: 8px; color: white; font-family: monospace;">
            <b>${d.country.name.toUpperCase()}</b> <br />
            <span style="font-size: 10px; color: ${d.resource.color};">
              PROD: <b>${d.volume}</b> ${d.resource.unit.toUpperCase()}
            </span>
          </div>
        `}
            />
        </div>
    );
}