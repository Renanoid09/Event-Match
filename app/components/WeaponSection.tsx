
'use client';

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { weapons, primaryWeapons, secondaryWeapons, allWeapons } from './weapons';
import { getWeaponSelectionMode, setWeaponSelectionMode, WeaponSelectionMode } from './StateHandler';

interface WeaponGroup {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  type: 'category' | 'weapon' | 'manual';
}

const selectionModes = [
  { value: 'category', label: 'By Category' },
  { value: 'weapon', label: 'By Weapon' },
  { value: 'manual', label: 'By Manual' }, // Added manual mode
];

const WeaponSection = forwardRef(function WeaponSection(props: any, ref) {
  const players: string[] = props.players || [];
  const manualTeams = props.manualTeams || { team1: [], team2: [] };
  const teamMode = props.teamMode || 'random';
  const [blacklistedWeapons, setBlacklistedWeapons] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_blacklisted_weapons');
      if (stored) return new Set(JSON.parse(stored));
    }
    return new Set();
  });
  const [blacklistedCategories, setBlacklistedCategories] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_blacklisted_categories');
      if (stored) return new Set(JSON.parse(stored));
    }
    return new Set();
  });
  const [weaponGroups, setWeaponGroups] = useState<WeaponGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_weapon_groups');
      if (stored) return JSON.parse(stored);
    }
    return [];
  });
  const [newGroup, setNewGroup] = useState({ name: '', primary: '', secondary: '' });
  // Use a lazy initializer for selectionMode to restore from localStorage on first render
  const [selectionMode, setSelectionModeState] = useState<WeaponSelectionMode>(() => getWeaponSelectionMode());
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [useCategoryGroups, setUseCategoryGroups] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_use_category_groups');
      if (stored) return JSON.parse(stored);
    }
    return true;
  });
  const [useWeaponGroups, setUseWeaponGroups] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_use_weapon_groups');
      if (stored) return JSON.parse(stored);
    }
    return true;
  });
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();
  const { language } = useLanguage();
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroup, setEditGroup] = useState<{ name: string; primary: string; secondary: string }>({ name: '', primary: '', secondary: '' });
  type ManualAssignment = { player: string; type: 'category' | 'weapon'; value: string };
  const [manualAssignments, setManualAssignments] = useState<ManualAssignment[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedType, setSelectedType] = useState<'category' | 'weapon' | ''>('');

  useEffect(() => {
    if (showGroupModal && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (showGroupModal && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [showGroupModal]);

  // Save weaponGroups to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_weapon_groups', JSON.stringify(weaponGroups));
    }
  }, [weaponGroups]);
  // Save blacklistedWeapons to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_blacklisted_weapons', JSON.stringify(Array.from(blacklistedWeapons)));
    }
  }, [blacklistedWeapons]);
  // Save blacklistedCategories to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_blacklisted_categories', JSON.stringify(Array.from(blacklistedCategories)));
    }
  }, [blacklistedCategories]);
  // Save useCategoryGroups to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_use_category_groups', JSON.stringify(useCategoryGroups));
    }
  }, [useCategoryGroups]);
  // Save useWeaponGroups to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_use_weapon_groups', JSON.stringify(useWeaponGroups));
    }
  }, [useWeaponGroups]);

  // Persist selectionMode to localStorage on change
  useEffect(() => {
    setWeaponSelectionMode(selectionMode);
  }, [selectionMode]);

  // Persist manualAssignments to localStorage when in 'manual' selectionMode
  useEffect(() => {
    if (typeof window !== 'undefined' && selectionMode === 'manual') {
      localStorage.setItem('valorant_manual_weapon_assignments', JSON.stringify(manualAssignments));
    }
  }, [manualAssignments, selectionMode]);

  // Restore manualAssignments from localStorage on mount if in manual mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_manual_weapon_assignments');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setManualAssignments(parsed);
          }
        } catch {}
      }
    }
    // eslint-disable-next-line
  }, []);

  const toggleAllWeaponsInCategory = (category: string) => {
    const categoryWeapons = weapons[category as keyof typeof weapons];
    const allBlacklisted = categoryWeapons.every(w => blacklistedWeapons.has(w));
    const newBlacklistedWeapons = new Set(blacklistedWeapons);
    const newBlacklistedCategories = new Set(blacklistedCategories);
    if (allBlacklisted) {
      categoryWeapons.forEach(w => newBlacklistedWeapons.delete(w));
      newBlacklistedCategories.delete(category);
    } else {
      categoryWeapons.forEach(w => newBlacklistedWeapons.add(w));
      newBlacklistedCategories.add(category);
    }
    setBlacklistedWeapons(newBlacklistedWeapons);
    setBlacklistedCategories(newBlacklistedCategories);
  };

  const toggleCategoryStatus = (category: string) => {
    const newBlacklistedCategories = new Set(blacklistedCategories);
    const newBlacklistedWeapons = new Set(blacklistedWeapons);
    const categoryWeapons = weapons[category as keyof typeof weapons];

    if (newBlacklistedCategories.has(category)) {
      newBlacklistedCategories.delete(category);
      categoryWeapons.forEach(weapon => {
        newBlacklistedWeapons.delete(weapon);
      });
    } else {
      newBlacklistedCategories.add(category);
      categoryWeapons.forEach(weapon => {
        newBlacklistedWeapons.add(weapon);
      });
    }

    setBlacklistedCategories(newBlacklistedCategories);
    setBlacklistedWeapons(newBlacklistedWeapons);
  };

  const toggleWeaponStatus = (weapon: string, category: string) => {
    const newBlacklistedWeapons = new Set(blacklistedWeapons);
    const newBlacklistedCategories = new Set(blacklistedCategories);
    const categoryWeapons = weapons[category as keyof typeof weapons];

    if (newBlacklistedWeapons.has(weapon)) {
      newBlacklistedWeapons.delete(weapon);
    } else {
      newBlacklistedWeapons.add(weapon);
    }

    const allCategoryWeaponsBlacklisted = categoryWeapons.every(w => newBlacklistedWeapons.has(w));
    const noCategoryWeaponsBlacklisted = categoryWeapons.every(w => !newBlacklistedWeapons.has(w));

    if (allCategoryWeaponsBlacklisted) {
      newBlacklistedCategories.add(category);
    } else if (noCategoryWeaponsBlacklisted) {
      newBlacklistedCategories.delete(category);
    }

    setBlacklistedWeapons(newBlacklistedWeapons);
    setBlacklistedCategories(newBlacklistedCategories);
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

  const isWeaponBlacklisted = (weapon: string) => blacklistedWeapons.has(weapon);
  const isCategoryBlacklisted = (category: string) => blacklistedCategories.has(category);

  useImperativeHandle(ref, () => ({
    getWeaponGroups: () => weaponGroups.filter(g => g.type === selectionMode),
    getSelectionMode: () => selectionMode,
    getBlacklistedWeapons: () => blacklistedWeapons,
    getBlacklistedCategories: () => blacklistedCategories,
    getUseWeaponGroups: () => selectionMode === 'category' ? useCategoryGroups : useWeaponGroups
  }), [weaponGroups, selectionMode, blacklistedWeapons, blacklistedCategories, useCategoryGroups, useWeaponGroups]);

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center bg-orange-600 rounded-lg mr-3">
            <i className="ri-sword-line text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-white">{t('weapons')}</h2>
        </div>
        <button
          onClick={() => setShowGroupModal(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap"
        >
          <div className="w-4 h-4 inline-flex items-center justify-center mr-2">
            <i className="ri-add-line"></i>
          </div>
          {t('createGroup')}
        </button>
      </div>

      {/* Selection Mode Toggle */}
      <div className="mb-4 flex gap-3">
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

      {/* Weapon Categories or Weapons */}
      {(selectionMode === 'category' || selectionMode === 'weapon') && (
        <div className="space-y-6">
          {Object.entries(weapons).map(([category, categoryWeapons]) => {
            const isCatBlacklisted = isCategoryBlacklisted(category);
            return (
              <div key={category} className="bg-slate-700/30 rounded-xl p-4">
                <div 
                    onClick={selectionMode === 'category' ? () => toggleCategoryStatus(category) : selectionMode === 'weapon' ? () => toggleAllWeaponsInCategory(category) : undefined}
                  className={`flex items-center justify-between rounded-lg p-3 mb-3 cursor-pointer transition-all ${
                    isCatBlacklisted 
                      ? 'bg-red-900/20 border border-red-500/50 opacity-50' 
                      : 'bg-green-900/20 border border-green-500/50 hover:border-green-400'
                    } ${selectionMode === 'category' ? '' : 'pointer-events-auto'} ${selectionMode === 'weapon' ? 'hover:opacity-80' : ''}`}
                >
                  <h3 className="font-semibold text-white">{t(category)}</h3>
                  <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                    isCatBlacklisted ? 'bg-red-600' : 'bg-green-600'
                  }`}>
                    <i className={`text-white text-sm ${
                      isCatBlacklisted ? 'ri-close-line' : 'ri-check-line'
                    }`}></i>
                  </div>
                </div>
                  {selectionMode === 'weapon' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categoryWeapons.map(weapon => {
                    const isBlacklisted = isWeaponBlacklisted(weapon);
                    return (
                      <div 
                        key={weapon} 
                        onClick={() => toggleWeaponStatus(weapon, category)}
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
      )}

      {/* Weapon Groups */}
      {weaponGroups.filter(g => g.type === selectionMode).length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">{t('weaponGroups')}</h3>
            <label className="flex items-center gap-3 select-none">
              <span className="text-slate-300 text-sm">{t('useForRandomization')}</span>
              <button
                type="button"
                onClick={() => selectionMode === 'category' ? setUseCategoryGroups((v: boolean) => !v) : setUseWeaponGroups((v: boolean) => !v)}
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
                        {Object.keys(weapons).filter(cat => cat !== 'pistols').map(category => (
                          <option key={category} value={category}>{t('weapon_' + category) || category}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={editGroup.primary}
                        onChange={e => setEditGroup({ ...editGroup, primary: e.target.value })}
                        className="w-full sm:w-48 px-2 py-1 bg-slate-800 text-white rounded border border-slate-600 text-sm"
                      >
                        <option value="">Select primary</option>
                        {primaryWeapons.map(weapon => (
                          <option key={weapon} value={weapon}>{t('weapon_' + weapon) || weapon}</option>
                        ))}
                      </select>
                    )}
                    <select
                      value={editGroup.secondary}
                      onChange={e => setEditGroup({ ...editGroup, secondary: e.target.value })}
                      className="w-full sm:w-48 px-2 py-1 bg-slate-800 text-white rounded border border-slate-600 text-sm"
                    >
                      <option value="">Select secondary</option>
                      {secondaryWeapons.map(weapon => (
                        <option key={weapon} value={weapon}>{t('weapon_' + weapon) || weapon}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => saveEditGroup(group.id)} className="flex-1 px-3 py-1 h-9 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold">
                        {t('save')}
                      </button>
                      <button onClick={cancelEditGroup} className={`flex-1 px-3 py-1 h-9 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm font-semibold${language === 'ja' ? ' min-w-[90px]' : ''}`}>
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-white font-semibold">{group.name}</span>
                    <span className="text-slate-300 text-sm ml-2">{t('weapon_' + group.primary) || group.primary} / {t('weapon_' + group.secondary) || group.secondary}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div ref={modalRef} className="bg-slate-800 rounded-xl p-8 max-w-xl w-full mx-4 shadow-2xl flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold text-white mb-4">{t('createWeaponGroup')}</h3>
            <div className="space-y-4 w-full max-w-lg mx-auto">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">{t('groupName')}</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full max-w-lg px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none text-sm mx-auto"
                  placeholder={t('enterGroupName')}
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">{t('primaryWeapon')}</label>
                {selectionMode === 'category' ? (
                  <select
                    value={newGroup.primary}
                    onChange={(e) => setNewGroup({...newGroup, primary: e.target.value})}
                    className="w-full max-w-lg px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none text-sm pr-8 mx-auto"
                  >
                    <option value="">{t('selectPrimaryWeapon')}</option>
                    {Object.keys(weapons).filter(cat => cat !== 'pistols').map(category => (
                      <option key={category} value={category}>{t('weapon_' + category) || category}</option>
                    ))}
                  </select>
                ) : (
                <select
                  value={newGroup.primary}
                  onChange={(e) => setNewGroup({...newGroup, primary: e.target.value})}
                    className="w-full max-w-lg px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none text-sm pr-8 mx-auto"
                >
                  <option value="">{t('selectPrimaryWeapon')}</option>
                  {primaryWeapons.map(weapon => (
                    <option key={weapon} value={weapon}>{t('weapon_' + weapon) || weapon}</option>
                  ))}
                </select>
                )}
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">{t('secondaryWeapon')}</label>
                <select
                  value={newGroup.secondary}
                  onChange={(e) => setNewGroup({...newGroup, secondary: e.target.value})}
                  className="w-full max-w-lg px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none text-sm pr-8 mx-auto"
                >
                  <option value="">{t('selectSecondaryWeapon')}</option>
                  {secondaryWeapons.map(weapon => (
                    <option key={weapon} value={weapon}>{t('weapon_' + weapon) || weapon}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6 w-full max-w-lg mx-auto">
              <button
                onClick={() => setShowGroupModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                {t('cancel')}
              </button>
              <button
                onClick={addWeaponGroup}
                disabled={!newGroup.name || !newGroup.primary || !newGroup.secondary}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default WeaponSection;
