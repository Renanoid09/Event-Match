
'use client';

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { mapImageUrls } from './urls';

const maps = [
  'Bind', 'Haven', 'Split', 'Ascent', 'Icebox', 'Breeze', 
  'Fracture', 'Pearl', 'Lotus', 'Sunset', 'Abyss', 'Corrode'
];

interface MapSectionProps {
  onMapSelect?: (map: string) => void;
}

export default function MapSection({ onMapSelect }: MapSectionProps) {
  const [blacklistedMaps, setBlacklistedMaps] = useState<Set<string>>(new Set());
  const { t } = useLanguage();

  const toggleMapStatus = (map: string) => {
    const newBlacklisted = new Set(blacklistedMaps);
    
    if (newBlacklisted.has(map)) {
      newBlacklisted.delete(map);
    } else {
      newBlacklisted.add(map);
    }
    
    setBlacklistedMaps(newBlacklisted);
  };

  const isMapBlacklisted = (map: string) => blacklistedMaps.has(map);

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 flex items-center justify-center bg-green-600 rounded-lg mr-3">
          <i className="ri-map-2-line text-white"></i>
        </div>
        <h2 className="text-2xl font-bold text-white">{t('maps')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {maps.map(map => {
          const isBlacklisted = isMapBlacklisted(map);
          return (
            <div key={map} className="relative">
              <div 
                onClick={() => onMapSelect ? onMapSelect(map) : toggleMapStatus(map)}
                className={`bg-slate-700/30 rounded-xl p-4 border transition-all cursor-pointer ${
                  isBlacklisted ? 'border-red-500/50 bg-red-900/20 opacity-50' :
                  'border-green-500/50 bg-green-900/20 hover:border-green-400'
                }`}
              >
                <div className="aspect-video bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mb-3 relative overflow-hidden">
                  <img
                    src={mapImageUrls[map]}
                    alt={map}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 text-white font-bold text-lg">{t('map_' + map) || map}</div>
                  
                  {/* Status indicator */}
                  <div className="absolute top-2 right-2">
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                      isBlacklisted ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                      <i className={`text-white text-sm ${
                        isBlacklisted ? 'ri-close-line' : 'ri-check-line'
                      }`}></i>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className={`text-sm font-medium ${
                    isBlacklisted ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {isBlacklisted ? t('blocked') : t('active')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <div className="flex items-center text-green-400">
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            <i className="ri-checkbox-circle-fill"></i>
          </div>
          <span className="text-sm">{t('active')}: {maps.length - blacklistedMaps.size}</span>
        </div>
        <div className="flex items-center text-red-400">
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            <i className="ri-close-circle-fill"></i>
          </div>
          <span className="text-sm">{t('blocked')}: {blacklistedMaps.size}</span>
        </div>
      </div>
    </div>
  );
}
