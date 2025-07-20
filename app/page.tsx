'use client';

import { useState, useRef, useEffect } from 'react';
import { getMainTab, setMainTab, MainTab } from './components/StateHandler';
import DeathMatchTab from './components/DeathMatchTab';
import CompetitiveTab from './components/CompetitiveTab';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useLanguage } from './contexts/LanguageContext';

function SettingsTab() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importFilterSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Weapons
        if (data.weapons) {
          localStorage.setItem('valorant_blacklisted_weapons', JSON.stringify(data.weapons.blacklistedWeapons || []));
          localStorage.setItem('valorant_blacklisted_categories', JSON.stringify(data.weapons.blacklistedCategories || []));
          localStorage.setItem('valorant_weapon_groups', JSON.stringify(data.weapons.weaponGroups || []));
          localStorage.setItem('valorant_use_category_groups', JSON.stringify(data.weapons.useCategoryGroups ?? true));
          localStorage.setItem('valorant_use_weapon_groups', JSON.stringify(data.weapons.useWeaponGroups ?? true));
        }
        // Roles
        if (data.roles) {
          localStorage.setItem('valorant_blacklisted_roles', JSON.stringify(data.roles.blacklistedRoles || []));
          localStorage.setItem('valorant_blacklisted_agents', JSON.stringify(data.roles.blacklistedAgents || []));
          localStorage.setItem('valorant_assignment_mode', data.roles.assignmentMode || 'role');
        }
        // Maps
        if (data.maps) {
          localStorage.setItem('valorant_blacklisted_maps', JSON.stringify(data.maps.blacklistedMaps || []));
        }
        // Preserve last active sub-tab in CompetitiveTab
        const lastSubTab = localStorage.getItem('valorant_active_tab') || 'players';
        localStorage.setItem('valorant_active_tab', lastSubTab);
        window.location.reload();
      } catch {
        alert('Invalid or corrupted settings file.');
      }
    };
    reader.readAsText(file);
  };

  const exportFilterSettings = () => {
    // Weapons
    const blacklistedWeapons = JSON.parse(localStorage.getItem('valorant_blacklisted_weapons') || '[]');
    const blacklistedCategories = JSON.parse(localStorage.getItem('valorant_blacklisted_categories') || '[]');
    const weaponGroups = JSON.parse(localStorage.getItem('valorant_weapon_groups') || '[]');
    const useCategoryGroups = JSON.parse(localStorage.getItem('valorant_use_category_groups') || 'true');
    const useWeaponGroups = JSON.parse(localStorage.getItem('valorant_use_weapon_groups') || 'true');
    // Roles
    const blacklistedRoles = JSON.parse(localStorage.getItem('valorant_blacklisted_roles') || '[]');
    const blacklistedAgents = JSON.parse(localStorage.getItem('valorant_blacklisted_agents') || '[]');
    const assignmentMode = localStorage.getItem('valorant_assignment_mode') || 'role';
    // Maps
    let blacklistedMaps: string[] = [];
    try {
      blacklistedMaps = JSON.parse(localStorage.getItem('valorant_blacklisted_maps') || '[]');
    } catch {}

    const exportData = {
      weapons: {
        blacklistedWeapons,
        blacklistedCategories,
        weaponGroups,
        useCategoryGroups,
        useWeaponGroups
      },
      roles: {
        blacklistedRoles,
        blacklistedAgents,
        assignmentMode
      },
      maps: {
        blacklistedMaps
      }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `valorant-randomizer-filters-${Date.now()}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-800/40 rounded-2xl border border-slate-700 p-8 mt-8 flex flex-col items-center gap-8 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">{t('settings') || 'Settings'}</h2>
      <div className="flex flex-col gap-6 w-full">
        <label className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-full hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer flex items-center shadow justify-center">
          <div className="w-5 h-5 inline-flex items-center justify-center mr-2">
            <i className="ri-upload-line"></i>
          </div>
          {t('importFilterSettings')}
          <input ref={fileInputRef} type="file" accept="application/json" onChange={importFilterSettings} className="hidden" />
        </label>
        <button 
          onClick={exportFilterSettings}
          className="px-6 py-3 bg-slate-600 text-white font-semibold rounded-full hover:bg-slate-700 transition-colors whitespace-nowrap shadow flex items-center justify-center"
        >
          <div className="w-5 h-5 inline-flex items-center justify-center mr-2">
            <i className="ri-download-line"></i>
          </div>
          {t('exportFilterSettings')}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<MainTab>();
  const { t } = useLanguage();
  const competitiveTabRef = useRef<any>(null);

  // Save activeTab to localStorage on change
  useEffect(() => {
    setActiveTab(getMainTab());
  }, []);
  useEffect(() => {
    if (activeTab) {
      setMainTab(activeTab);
    }
  }, [activeTab]);

  // Add import handler
  const importFilterSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // Weapons
        if (data.weapons) {
          localStorage.setItem('valorant_blacklisted_weapons', JSON.stringify(data.weapons.blacklistedWeapons || []));
          localStorage.setItem('valorant_blacklisted_categories', JSON.stringify(data.weapons.blacklistedCategories || []));
          localStorage.setItem('valorant_weapon_groups', JSON.stringify(data.weapons.weaponGroups || []));
          localStorage.setItem('valorant_use_category_groups', JSON.stringify(data.weapons.useCategoryGroups ?? true));
          localStorage.setItem('valorant_use_weapon_groups', JSON.stringify(data.weapons.useWeaponGroups ?? true));
        }
        // Roles
        if (data.roles) {
          localStorage.setItem('valorant_blacklisted_roles', JSON.stringify(data.roles.blacklistedRoles || []));
          localStorage.setItem('valorant_blacklisted_agents', JSON.stringify(data.roles.blacklistedAgents || []));
          localStorage.setItem('valorant_assignment_mode', data.roles.assignmentMode || 'role');
        }
        // Maps
        if (data.maps) {
          localStorage.setItem('valorant_blacklisted_maps', JSON.stringify(data.maps.blacklistedMaps || []));
        }
        // Preserve last active sub-tab in CompetitiveTab
        const lastSubTab = localStorage.getItem('valorant_active_tab') || 'players';
        localStorage.setItem('valorant_active_tab', lastSubTab);
        window.location.reload();
      } catch {
        alert('Invalid or corrupted settings file.');
      }
    };
    reader.readAsText(file);
  };

  if (!activeTab) return null;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as MainTab);
    if (tab === 'competitive') {
      setTimeout(() => {
        competitiveTabRef.current?.focusPlayerInput && competitiveTabRef.current.focusPlayerInput();
      }, 50);
    }
  };

  // Define main sections for tab navigation
  const mainSections = [
    {
      key: 'deathmatch',
      label: t('deathmatch'),
      icon: 'ri-crosshair-line',
      tooltip: 'Deathmatch (Main Section)'
    },
    {
      key: 'competitive',
      label: t('competitive'),
      icon: 'ri-trophy-line',
      tooltip: 'Competitive (Main Section)'
    },
    {
      key: 'settings',
      label: t('settings') || 'Settings',
      icon: 'ri-settings-3-line',
      tooltip: 'Settings (Main Section)'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0 flex gap-2 items-center">
            <LanguageSwitcher />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{t('title')}</h1>
        </div>

        {/* Tab Navigation */}
        {/* Main Sections (Deathmatch, Competitive, Settings) */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-full p-1 border border-slate-700">
            {mainSections.map((section) => (
              <button
                key={section.key}
                onClick={() => handleTabChange(section.key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${activeTab === section.key ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}
                title={section.tooltip}
              >
                <div className="w-5 h-5 inline-flex items-center justify-center mr-2">
                  <i className={section.icon}></i>
                </div>
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'deathmatch' && <DeathMatchTab />}
          {activeTab === 'competitive' && <CompetitiveTab ref={competitiveTabRef} />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}