
'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { weapons as weaponTypes } from './weapons';
import { getDMSelectionMode, setDMSelectionMode, getUseCategoryGroups, setUseCategoryGroups, getUseWeaponGroups, setUseWeaponGroups, DMSelectionMode } from './StateHandler';

const selectionModes = [
  { value: 'category', label: 'By Category' },
  { value: 'weapon', label: 'By Weapon' }
];

interface WeaponGroup {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  type: 'category' | 'weapon';
}

interface WeaponRandomizerProps {
  onRandomize?: (weapon: string) => void;
  hideResult?: boolean;
}

export default function WeaponRandomizer({ onRandomize, hideResult }: WeaponRandomizerProps) {
  const [blacklistedTypes, setBlacklistedTypes] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_dm_blacklisted_types');
      if (stored) return new Set(JSON.parse(stored));
    }
    return new Set();
  });
  const [blacklistedWeapons, setBlacklistedWeapons] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_dm_blacklisted_weapons');
      if (stored) return new Set(JSON.parse(stored));
    }
    return new Set();
  });
  const [randomizedWeapon, setRandomizedWeapon] = useState<string | null>(null);
  const [selectionMode, setSelectionModeState] = useState<DMSelectionMode>(() => getDMSelectionMode());
  const [weaponGroups, setWeaponGroups] = useState<WeaponGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_weapon_groups');
      if (stored) return JSON.parse(stored);
    }
    return [];
  });
  const [useCategoryGroups, setUseCategoryGroupsState] = useState<boolean>(() => getUseCategoryGroups());
  const [useWeaponGroups, setUseWeaponGroupsState] = useState<boolean>(() => getUseWeaponGroups());
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', primary: '', secondary: '' });
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroup, setEditGroup] = useState<{ name: string; primary: string; secondary: string }>({ name: '', primary: '', secondary: '' });
  const { t } = useLanguage();
  const groupModalRef = useRef<HTMLDivElement>(null);

  // Save blacklistedTypes to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_dm_blacklisted_types', JSON.stringify(Array.from(blacklistedTypes)));
    }
  }, [blacklistedTypes]);
  // Save blacklistedWeapons to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_dm_blacklisted_weapons', JSON.stringify(Array.from(blacklistedWeapons)));
    }
  }, [blacklistedWeapons]);
  // Save selectionMode to localStorage on change
  useEffect(() => {
    setDMSelectionMode(selectionMode);
  }, [selectionMode]);
  // Persist weaponGroups and toggles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_weapon_groups', JSON.stringify(weaponGroups));
    }
  }, [weaponGroups]);
  useEffect(() => {
    setUseCategoryGroups(useCategoryGroups);
  }, [useCategoryGroups]);
  useEffect(() => {
    setUseWeaponGroups(useWeaponGroups);
  }, [useWeaponGroups]);

  const toggleTypeStatus = (type: string) => {
    const newBlacklistedTypes = new Set(blacklistedTypes);
    const newBlacklistedWeapons = new Set(blacklistedWeapons);
    const categoryWeapons = weaponTypes[type as keyof typeof weaponTypes];
    
    if (newBlacklistedTypes.has(type)) {
      newBlacklistedTypes.delete(type);
      categoryWeapons.forEach(weapon => newBlacklistedWeapons.delete(weapon));
    } else {
      newBlacklistedTypes.add(type);
      categoryWeapons.forEach(weapon => newBlacklistedWeapons.add(weapon));
    }
    
    setBlacklistedTypes(newBlacklistedTypes);
    setBlacklistedWeapons(newBlacklistedWeapons);
  };

  const toggleWeaponStatus = (weapon: string) => {
    const newBlacklisted = new Set(blacklistedWeapons);
    
    if (newBlacklisted.has(weapon)) {
      newBlacklisted.delete(weapon);
    } else {
      newBlacklisted.add(weapon);
    }
    
    setBlacklistedWeapons(newBlacklisted);
  };

  const toggleAllWeaponsInCategory = (type: string) => {
    const categoryWeapons = weaponTypes[type as keyof typeof weaponTypes];
    const allBlacklisted = categoryWeapons.every(w => blacklistedWeapons.has(w));
    const newBlacklisted = new Set(blacklistedWeapons);
    const newBlacklistedTypes = new Set(blacklistedTypes);
    if (allBlacklisted) {
      // Un-blacklist all
      categoryWeapons.forEach(w => newBlacklisted.delete(w));
      newBlacklistedTypes.delete(type);
    } else {
      // Blacklist all
      categoryWeapons.forEach(w => newBlacklisted.add(w));
      newBlacklistedTypes.add(type);
    }
    setBlacklistedWeapons(newBlacklisted);
    setBlacklistedTypes(newBlacklistedTypes);
  };

  const getAvailableWeapons = () => {
    const available: string[] = [];
    
    Object.entries(weaponTypes).forEach(([type, weapons]) => {
      if (!blacklistedTypes.has(type)) {
        weapons.forEach(weapon => {
          if (!blacklistedWeapons.has(weapon)) {
            available.push(weapon);
          }
        });
      }
    });
    
    return available;
  };

  const addWeaponGroup = () => {
    if (newGroup.name && newGroup.primary && newGroup.secondary) {
      setWeaponGroups([...weaponGroups, {
        id: Date.now().toString(),
        ...newGroup,
        type: selectionMode
      }]);
      setNewGroup({ name: '', primary: '', secondary: '' });
      setShowGroupModal(false);
    }
  };
  const removeWeaponGroup = (id: string) => {
    setWeaponGroups(weaponGroups.filter(group => group.id !== id));
  };

  const randomizeWeapon = () => {
    const groups = weaponGroups.filter(g => g.type === selectionMode);
    const useGroups = selectionMode === 'category' ? useCategoryGroups : useWeaponGroups;
    if (groups.length > 0 && useGroups) {
      // Pick a random group
      const group = groups[Math.floor(Math.random() * groups.length)];
      setRandomizedWeapon(`${t('weapon_' + group.primary) || group.primary} + ${t('weapon_' + group.secondary) || group.secondary}`);
      if (onRandomize) onRandomize(`${t('weapon_' + group.primary) || group.primary} + ${t('weapon_' + group.secondary) || group.secondary}`);
      return;
    }
    const availableWeapons = getAvailableWeapons();
    if (availableWeapons.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableWeapons.length);
      const weapon = availableWeapons[randomIndex];
      setRandomizedWeapon(weapon);
      if (onRandomize) onRandomize(weapon);
    }
  };

  const isTypeBlacklisted = (type: string) => blacklistedTypes.has(type);
  const isWeaponBlacklisted = (weapon: string) => blacklistedWeapons.has(weapon);

  const handleOpenGroupModal = () => {
    setShowGroupModal(true);
    setTimeout(() => {
      groupModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const startEditGroup = (group: WeaponGroup) => {
    setEditingGroupId(group.id);
    setEditGroup({ name: group.name, primary: group.primary, secondary: group.secondary });
  };
  const cancelEditGroup = () => {
    setEditingGroupId(null);
    setEditGroup({ name: '', primary: '', secondary: '' });
  };
  const saveEditGroup = (id: string) => {
    setWeaponGroups(weaponGroups.map(g => g.id === id ? { ...g, ...editGroup } : g));
    setEditingGroupId(null);
    setEditGroup({ name: '', primary: '', secondary: '' });
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 flex items-center justify-center bg-orange-600 rounded-lg mr-3">
          <i className="ri-sword-line text-white"></i>
        </div>
        <h2 className="text-2xl font-bold text-white">{t('weaponRandomizer')}</h2>
      </div>

      {/* Selection Mode Toggle */}
      <div className="mb-4 flex gap-3 items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => setSelectionModeState('category')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${selectionMode === 'category' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-orange-700'}`}
          >
            {t('byCategory')}
          </button>
          <button
            onClick={() => setSelectionModeState('weapon')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${selectionMode === 'weapon' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-orange-700'}`}
          >
            {t('byWeapon')}
          </button>
        </div>
        <button
          onClick={handleOpenGroupModal}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
        >
          <div className="w-4 h-4 inline-flex items-center justify-center mr-2">
            <i className="ri-add-line"></i>
          </div>
          {t('createGroup')}
        </button>
      </div>

      {/* Weapon Categories or Weapons */}
      <div className="space-y-6">
        {Object.entries(weaponTypes).map(([type, weapons]) => {
          const isTypeBlacklisted = blacklistedTypes.has(type);
            return (
            <div key={type} className="bg-slate-700/30 rounded-xl p-4">
              <div
                onClick={selectionMode === 'category' ? () => toggleTypeStatus(type) : selectionMode === 'weapon' ? () => toggleAllWeaponsInCategory(type) : undefined}
                className={`flex items-center justify-between rounded-lg p-3 mb-3 cursor-pointer transition-all ${
                  isTypeBlacklisted
                    ? 'bg-red-900/20 border border-red-500/50 opacity-50' 
                    : 'bg-green-900/20 border border-green-500/50 hover:border-green-400'
                } ${selectionMode === 'category' ? '' : 'pointer-events-auto'} ${selectionMode === 'weapon' ? 'hover:opacity-80' : ''}`}
              >
                <h3 className="font-semibold text-white">{t(type)}</h3>
                <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                  isTypeBlacklisted ? 'bg-red-600' : 'bg-green-600'
                }`}>
                  <i className={`text-white text-sm ${
                    isTypeBlacklisted ? 'ri-close-line' : 'ri-check-line'
                  }`}></i>
                </div>
              </div>
              {selectionMode === 'weapon' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {weapons.map(weapon => {
                    const isBlacklisted = blacklistedWeapons.has(weapon);
                  return (
                    <div 
                      key={weapon} 
                      onClick={() => toggleWeaponStatus(weapon)}
                      className={`flex items-center justify-between rounded-lg p-3 cursor-pointer transition-all ${
                        isBlacklisted 
                          ? 'bg-red-900/20 border border-red-500/50 opacity-50' 
                          : 'bg-green-900/20 border border-green-500/50 hover:border-green-400'
                      }`}
                    >
                      <span className="text-slate-300">{t('weapon_' + weapon) || weapon}</span>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                        isBlacklisted ? 'bg-red-600' : 'bg-green-600'
                      }`}>
                        <i className={`text-white text-sm ${
                          isBlacklisted ? 'ri-close-line' : 'ri-check-line'
                        }`}></i>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weapon Groups */}
      {weaponGroups.filter(g => g.type === selectionMode).length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">{t('weaponGroups')}</h3>
            <label className="flex items-center gap-3 select-none">
              <span className="text-slate-300 text-sm">{t('useForRandomization')}</span>
              <button
                type="button"
                onClick={() => selectionMode === 'category' ? setUseCategoryGroupsState((v: boolean) => !v) : setUseWeaponGroupsState((v: boolean) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none border ${
                  (selectionMode === 'category' ? useCategoryGroups : useWeaponGroups)
                    ? 'bg-green-600 border-green-700' : 'bg-slate-600 border-blue-700'
                }`}
                aria-pressed={selectionMode === 'category' ? useCategoryGroups : useWeaponGroups}
                aria-label="Toggle weapon group randomization"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    (selectionMode === 'category' ? useCategoryGroups : useWeaponGroups)
                      ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
          <div className="space-y-2">
            {weaponGroups.filter(g => g.type === selectionMode).map(group => (
              <div
                key={group.id}
                className={`rounded-lg p-2 flex items-center justify-between transition-colors duration-200
                  ${
                    (selectionMode === 'category' ? useCategoryGroups : useWeaponGroups)
                      ? 'bg-green-900/30 border border-green-700'
                      : 'bg-slate-700/30 border border-slate-600 opacity-60'
                  }
                `}
              >
                {editingGroupId === group.id ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <input
                      type="text"
                      value={editGroup.name}
                      onChange={e => setEditGroup({ ...editGroup, name: e.target.value })}
                      className="w-full sm:w-48 px-2 py-1 bg-slate-800 text-white rounded border border-slate-600 text-sm"
                    />
                    {selectionMode === 'category' ? (
                      <select
                        value={editGroup.primary}
                        onChange={e => setEditGroup({ ...editGroup, primary: e.target.value })}
                        className="w-full sm:w-48 px-2 py-1 bg-slate-800 text-white rounded border border-slate-600 text-sm"
                      >
                        <option value="">Select primary</option>
                        {Object.keys(weaponTypes).filter(cat => cat !== 'pistols').map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={editGroup.primary}
                        onChange={e => setEditGroup({ ...editGroup, primary: e.target.value })}
                        className="w-full sm:w-48 px-2 py-1 bg-slate-800 text-white rounded border border-slate-600 text-sm"
                      >
                        <option value="">Select primary</option>
                        {Object.values(weaponTypes).flat().filter(w => w !== undefined).map(weapon => (
                          <option key={weapon} value={weapon}>{weapon}</option>
                        ))}
                      </select>
                    )}
                    <select
                      value={editGroup.secondary}
                      onChange={e => setEditGroup({ ...editGroup, secondary: e.target.value })}
                      className="w-full sm:w-48 px-2 py-1 bg-slate-800 text-white rounded border border-slate-600 text-sm"
                    >
                      <option value="">Select secondary</option>
                      {Object.values(weaponTypes.pistols).map(weapon => (
                        <option key={weapon} value={weapon}>{weapon}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => saveEditGroup(group.id)} className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold">Save</button>
                      <button onClick={cancelEditGroup} className="flex-1 px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm font-semibold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-white font-medium">{group.name}</span>
                    <span className="text-slate-400 text-sm ml-2">{t('weapon_' + group.primary) || group.primary} + {t('weapon_' + group.secondary) || group.secondary}</span>
                    <button
                      onClick={() => startEditGroup(group)}
                      className="ml-2 flex items-center justify-center w-6 h-6 bg-transparent rounded hover:bg-slate-700/20 transition-colors"
                      title="Edit"
                    >
                      <i className="ri-edit-line text-base text-slate-400"></i>
                    </button>
                  </div>
                )}
                <button
                  onClick={() => removeWeaponGroup(group.id)}
                  className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                >
                  <i className="ri-close-line"></i>
                </button>
            </div>
          ))}
        </div>
      </div>
      )}
      {/* Group Creation Modal */}
      {showGroupModal && (
        <div ref={groupModalRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-xl w-full mx-4 shadow-2xl flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold text-white mb-4">{t('createWeaponGroup')}</h3>
            <div className="space-y-4 w-full max-w-lg mx-auto">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full max-w-lg px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none text-sm mx-auto"
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Primary Weapon</label>
                {selectionMode === 'category' ? (
                  <select
                    value={newGroup.primary}
                    onChange={(e) => setNewGroup({...newGroup, primary: e.target.value})}
                    className="w-full max-w-lg px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none text-sm pr-8 mx-auto"
                  >
                    <option value="">Select primary weapon</option>
                    {Object.keys(weaponTypes).filter(cat => cat !== 'pistols').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={newGroup.primary}
                    onChange={(e) => setNewGroup({...newGroup, primary: e.target.value})}
                    className="w-full max-w-lg px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none text-sm pr-8 mx-auto"
                  >
                    <option value="">Select primary weapon</option>
                    {Object.values(weaponTypes).flat().filter(w => w !== undefined).map(weapon => (
                      <option key={weapon} value={weapon}>{weapon}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Secondary Weapon</label>
                <select
                  value={newGroup.secondary}
                  onChange={(e) => setNewGroup({...newGroup, secondary: e.target.value})}
                  className="w-full max-w-lg px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none text-sm pr-8 mx-auto"
                >
                  <option value="">Select secondary weapon</option>
                  {Object.values(weaponTypes.pistols).map(weapon => (
                    <option key={weapon} value={weapon}>{weapon}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6 w-full max-w-lg mx-auto">
              <button
                onClick={() => setShowGroupModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={addWeaponGroup}
                disabled={!newGroup.name || !newGroup.primary || !newGroup.secondary}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Randomize Button - always below group section */}
      <div className="text-center mt-8">
        <button
          onClick={randomizeWeapon}
          disabled={getAvailableWeapons().length === 0}
          className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <div className="w-5 h-5 inline-flex items-center justify-center mr-2">
            <i className="ri-refresh-line"></i>
          </div>
          {t('randomizeWeapon')}
        </button>
        <p className="text-slate-400 text-sm mt-2">
          {t('availableWeapons')}: {getAvailableWeapons().length}
        </p>
      </div>

      {/* Result */}
      {randomizedWeapon && !hideResult && (
        <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-xl p-6 text-center">
          <h3 className="text-orange-400 font-semibold mb-2">{t('selectedWeapon')}</h3>
          <div className="text-3xl font-bold text-white">{randomizedWeapon}</div>
        </div>
      )}
    </div>
  );
}
