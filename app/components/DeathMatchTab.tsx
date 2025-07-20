'use client';

import { useState, useRef, useEffect } from 'react';
import WeaponRandomizer from './WeaponRandomizer';
import { useLanguage } from '../contexts/LanguageContext';
import { getSelectedWeapon, setSelectedWeapon } from './StateHandler';

export default function DeathMatchTab() {
  const [selectedWeapon, setSelectedWeaponState] = useState<string | null>(() => getSelectedWeapon());
  const { t } = useLanguage();
  const resultRef = useRef<HTMLDivElement>(null);

  // Save selectedWeapon to localStorage on change
  useEffect(() => {
    setSelectedWeapon(selectedWeapon);
  }, [selectedWeapon]);

  const handleRandomize = (weapon: string) => {
    setSelectedWeaponState(weapon);
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  return (
    <div className="space-y-8">
      <WeaponRandomizer onRandomize={handleRandomize} hideResult={true} />
      
      {selectedWeapon && (
        <div ref={resultRef} className="mt-8 p-6 bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-xl border border-red-800/30">
          <h3 className="text-xl font-semibold text-white mb-2">{t('selectedWeapon')}</h3>
          <div className="text-3xl font-bold text-red-400">
            {selectedWeapon && selectedWeapon.includes(' + ')
              ? selectedWeapon.split(' + ').map((w, i) => (
                  <span key={i}>
                    {i > 0 && ' + '}
                    {t('weapon_' + w.trim()) || w.trim()}
                  </span>
                ))
              : t('weapon_' + selectedWeapon) || selectedWeapon}
          </div>
        </div>
      )}
    </div>
  );
}