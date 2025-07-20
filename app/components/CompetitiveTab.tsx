
'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react';
import PlayerSection from './PlayerSection';
import WeaponSection from './WeaponSection';
import RoleSection from './RoleSection';
import MapSection from './MapSection';
import ResultSection from './ResultSection';
import ByManualSection from './ByManualSection';
import { useLanguage } from '../contexts/LanguageContext';
import { weapons, primaryWeapons, secondaryWeapons } from './weapons';
import { mapImageUrls } from './urls';
import { getSubTab, setSubTab, SubTab, getSubcategory, setSubcategory, setAssignmentMode } from './StateHandler';

export interface RandomizedResult {
  teams: {
    team1: string[];
    team2: string[];
  };
  weapons: { [player: string]: { primary: string; secondary: string } };
  roles: { [player: string]: string };
  map: string;
}

const getInitialFromStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem(key); // Remove invalid value
      }
    }
  }
  return fallback;
};

const CompetitiveTab = forwardRef(function CompetitiveTab(props, ref) {
  const { t } = useLanguage();
  // State
  const [players, setPlayers] = useState<string[]>(() => getInitialFromStorage('valorant_players', []));
  const [randomizedResult, setRandomizedResult] = useState<RandomizedResult | null>(() => {
    return getSubcategory<RandomizedResult | null>('valorant_randomized_result', null);
  });
  const [activeTab, setActiveTab] = useState<SubTab>(() => {
    const tabToRestore = getSubTab();
    console.log('[CompetitiveTab] Restoring sub-tab from StateHandler:', tabToRestore);
    return tabToRestore;
  });
  const [randomizationSettings, setRandomizationSettings] = useState<any>(null);
  const [selectedMap, setSelectedMap] = useState<string | null>(() => getSubcategory<string | null>('valorant_selected_map_bymanual', null));
  const [manualTeams, setManualTeams] = useState<{ team1: string[]; team2: string[] }>(() => getInitialFromStorage('valorant_manual_teams', { team1: [], team2: [] }));
  const [teamMode, setTeamMode] = useState<'random' | 'manual'>(() => getInitialFromStorage('valorant_team_mode', 'random'));

  // Refs
  const weaponSectionRef = useRef<any>(null);
  const roleSectionRef = useRef<any>(null);
  const playerSectionRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    focusPlayerInput: () => {
      playerSectionRef.current?.focusInput && playerSectionRef.current.focusInput();
    }
  }));

  // Persist state to localStorage
  useEffect(() => { localStorage.setItem('valorant_players', JSON.stringify(players)); }, [players]);
  useEffect(() => {
    if (randomizedResult) {
      setSubcategory('valorant_randomized_result', randomizedResult);
    } else {
      // Remove from storage if cleared
      localStorage.removeItem('valorant_randomized_result');
    }
  }, [randomizedResult]);
  useEffect(() => { if (randomizationSettings) localStorage.setItem('valorant_randomization_settings', JSON.stringify(randomizationSettings)); }, [randomizationSettings]);
  useEffect(() => { setSubTab(activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('valorant_manual_teams', JSON.stringify(manualTeams)); }, [manualTeams]);
  useEffect(() => { localStorage.setItem('valorant_team_mode', teamMode); }, [teamMode]);
  useEffect(() => {
    if (selectedMap) {
      setSubcategory('valorant_selected_map_bymanual', selectedMap);
    } else {
      localStorage.removeItem('valorant_selected_map_bymanual');
    }
  }, [selectedMap]);

  // Sync manualTeams and teamMode from PlayerSection when visiting Player tab
  useEffect(() => {
    if (activeTab === 'players' && playerSectionRef.current) {
      setManualTeams(playerSectionRef.current.getManualTeams());
      setTeamMode(playerSectionRef.current.getTeamMode());
    }
  }, [activeTab]);

  // Listen for storage changes (multi-tab sync)
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === 'valorant_manual_teams') {
        const stored = localStorage.getItem('valorant_manual_teams');
        if (stored) setManualTeams(JSON.parse(stored));
      }
      if (e.key === 'valorant_team_mode') {
        const mode = localStorage.getItem('valorant_team_mode');
        if (mode === 'manual' || mode === 'random') setTeamMode(mode);
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Helper: Shuffle array
  const shuffle = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Helper: Get random item
  const getRandomItem = (array: any[]) => array[Math.floor(Math.random() * array.length)];

  // Helper: Get teams based on mode
  const getTeams = () => {
    if (teamMode === 'manual') {
      // Players already assigned to a team
      const assigned = new Set([...manualTeams.team1, ...manualTeams.team2]);
      const unassigned = players.filter(p => !assigned.has(p));
      // Shuffle unassigned players
      const shuffledUnassigned = shuffle(unassigned);
      // Even out teams
      let team1 = [...manualTeams.team1];
      let team2 = [...manualTeams.team2];
      for (const player of shuffledUnassigned) {
        if (team1.length === team2.length) {
          // Randomly assign to team1 or team2 if even
          (Math.random() < 0.5 ? team1 : team2).push(player);
        } else if (team1.length < team2.length) {
          team1.push(player);
        } else {
          team2.push(player);
        }
      }
      return { team1, team2 };
    }
    const shuffledPlayers = shuffle(players);
    const mid = Math.ceil(shuffledPlayers.length / 2);
    return { team1: shuffledPlayers.slice(0, mid), team2: shuffledPlayers.slice(mid) };
  };

  // When switching to manual mode in Player section, assign players to their teams without randomizing
  useEffect(() => {
    if (activeTab === 'players' && teamMode === 'manual' && (manualTeams.team1.length > 0 || manualTeams.team2.length > 0)) {
      setRandomizedResult({
        teams: { team1: manualTeams.team1, team2: manualTeams.team2 },
        weapons: {},
        roles: {},
        map: selectedMap || ''
      });
    }
  }, [activeTab, teamMode, manualTeams, selectedMap]);

  // Main randomize handler
  const handleRandomizeAll = () => {
    if (players.length < 2) {
      alert('Need at least 2 players to randomize');
      return;
    }
    // Only clear manual teams if not in manual mode
    if (teamMode !== 'manual') {
      setManualTeams({ team1: [], team2: [] });
    }
    // Get settings from refs
    const weaponGroups = weaponSectionRef.current?.getWeaponGroups ? weaponSectionRef.current.getWeaponGroups() : [];
    const useWeaponGroups = weaponSectionRef.current?.getUseWeaponGroups ? weaponSectionRef.current.getUseWeaponGroups() : false;
    const weaponSelectionMode = weaponSectionRef.current?.getSelectionMode ? weaponSectionRef.current.getSelectionMode() : 'category';
    const assignmentMode = roleSectionRef.current?.getAssignmentMode ? roleSectionRef.current.getAssignmentMode() : 'role';
    setRandomizationSettings({
      weaponSelectionMode,
      weaponGroupsUsed: weaponGroups.length > 0 && useWeaponGroups,
      assignmentMode,
      teamMode
    });
    // Team assignment
    const { team1, team2 } = getTeams();
    // Agent/role assignment
    const agents = {
      Duelist: ['Jett', 'Phoenix', 'Reyna', 'Raze', 'Yoru', 'Neon', 'Iso'],
      Initiator: ['Sova', 'Breach', 'Skye', 'KAY/O', 'Fade', 'Gekko'],
      Controller: ['Brimstone', 'Omen', 'Viper', 'Astra', 'Harbor', 'Clove'],
      Sentinel: ['Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock']
    };
    const blacklistedRoles = roleSectionRef.current?.getBlacklistedRoles ? roleSectionRef.current.getBlacklistedRoles() : new Set();
    const blacklistedAgents = roleSectionRef.current?.getBlacklistedAgents ? roleSectionRef.current.getBlacklistedAgents() : new Set();
    let allRoles: { [player: string]: string } = {};
    if (assignmentMode === 'agent') {
      const filteredAgents = Object.fromEntries(
        Object.entries(agents).filter(([role]) => !blacklistedRoles.has(role)).map(([role, ags]) => [role, ags.filter(a => !blacklistedAgents.has(a))])
      );
      const allAvailableAgents = Object.values(filteredAgents).flat();
      const assignUniqueAgents = (teamPlayers: string[]) => {
        const teamAssignments: { [player: string]: string } = {};
        const usedAgents = new Set<string>();
        teamPlayers.forEach(player => {
          let assigned = false;
          let attempts = 0;
          while (!assigned && attempts < 50) {
            const agent = getRandomItem(allAvailableAgents.filter(a => !usedAgents.has(a)));
            if (agent) {
              teamAssignments[player] = agent;
              usedAgents.add(agent);
              assigned = true;
            }
            attempts++;
          }
          if (!assigned) {
            teamAssignments[player] = getRandomItem(allAvailableAgents);
          }
        });
        return teamAssignments;
      };
      allRoles = { ...assignUniqueAgents(team1), ...assignUniqueAgents(team2) };
    } else if (assignmentMode === 'role') {
      const availableRoles = Object.keys(agents).filter(role => !blacklistedRoles.has(role));
      const assignUniqueRoles = (teamPlayers: string[]) => {
        const teamAssignments: { [player: string]: string } = {};
        const usedRoles = new Set<string>();
        teamPlayers.forEach(player => {
          let assigned = false;
          let attempts = 0;
          while (!assigned && attempts < 20) {
            const role = getRandomItem(availableRoles.filter(r => !usedRoles.has(r)));
            if (role) {
              teamAssignments[player] = role;
              usedRoles.add(role);
              assigned = true;
            }
            attempts++;
          }
          if (!assigned) {
            teamAssignments[player] = getRandomItem(availableRoles);
          }
        });
        return teamAssignments;
      };
      allRoles = { ...assignUniqueRoles(team1), ...assignUniqueRoles(team2) };
    } else if (assignmentMode === 'replication') {
      const getAvailableAgents = () => Object.values(agents).flat().filter(agent => !blacklistedAgents.has(agent));
      const availableAgents = getAvailableAgents();
      const team1Agent = getRandomItem(availableAgents);
      const team2Agent = getRandomItem(availableAgents);
      team1.forEach(player => { allRoles[player] = team1Agent; });
      team2.forEach(player => { allRoles[player] = team2Agent; });
    } else {
      // Default: assign unique agents by role
      const filteredAgents = Object.fromEntries(
        Object.entries(agents).filter(([role]) => !blacklistedRoles.has(role)).map(([role, ags]) => [role, ags.filter(a => !blacklistedAgents.has(a))])
      );
      const assignAgentsToTeam = (teamPlayers: string[]) => {
        const teamRoles: { [player: string]: string } = {};
        const usedAgents = new Set<string>();
        const roleNames = Object.keys(filteredAgents);
        teamPlayers.forEach(player => {
          let attempts = 0;
          let assignedAgent = false;
          while (!assignedAgent && attempts < 50) {
            const randomRole = getRandomItem(roleNames);
            const roleAgents = filteredAgents[randomRole as keyof typeof filteredAgents];
            const availableAgents = roleAgents.filter(agent => !usedAgents.has(agent));
            if (availableAgents.length > 0) {
              const selectedAgent = getRandomItem(availableAgents);
              teamRoles[player] = selectedAgent;
              usedAgents.add(selectedAgent);
              assignedAgent = true;
            }
            attempts++;
          }
          if (!assignedAgent) {
            const allAgents = Object.values(filteredAgents).flat();
            const unusedAgents = allAgents.filter(agent => !usedAgents.has(agent));
            if (unusedAgents.length > 0) {
              const fallbackAgent = getRandomItem(unusedAgents);
              teamRoles[player] = fallbackAgent;
              usedAgents.add(fallbackAgent);
            } else {
              teamRoles[player] = getRandomItem(Object.values(filteredAgents).flat());
            }
          }
        });
        return teamRoles;
      };
      allRoles = { ...assignAgentsToTeam(team1), ...assignAgentsToTeam(team2) };
    }
    // Weapon assignment
    const playerWeapons: { [player: string]: { primary: string; secondary: string } } = {};
    if (weaponGroups && weaponGroups.length > 0 && useWeaponGroups) {
      const shuffledGroups = shuffle(weaponGroups);
      players.forEach((player, idx) => {
        const group = shuffledGroups[idx % shuffledGroups.length];
        playerWeapons[player] = { primary: group.primary, secondary: group.secondary };
      });
    } else {
      players.forEach(player => {
        const primary = getRandomItem(primaryWeapons);
        const secondary = getRandomItem(secondaryWeapons);
        playerWeapons[player] = { primary, secondary };
      });
    }
    // Map assignment
    const maps = [
      'Bind', 'Haven', 'Split', 'Ascent', 'Icebox', 'Breeze', 
      'Fracture', 'Pearl', 'Lotus', 'Sunset', 'Abyss'
    ];
    // Use selectedMap only if By Manual tab is active, otherwise random
    const result: RandomizedResult = {
      teams: { team1, team2 },
      weapons: playerWeapons,
      roles: allRoles,
      map: (activeTab === 'bymanual' && selectedMap) ? selectedMap : getRandomItem(maps)
    };
    setRandomizedResult(result);
    setActiveTab('results');
    // Scroll to top after switching to results tab
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'players') {
      setTimeout(() => {
        playerSectionRef.current?.focusInput && playerSectionRef.current.focusInput();
      }, 50);
    }
  };

  const handleMapSelectFromMapTab = (map: string) => {
    setSelectedMap(map);
    setSubcategory('valorant_selected_map_bymanual', map);
    setActiveTab('bymanual');
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => handleTabChange('players')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'players' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('players') || 'Players'}</button>
        <button onClick={() => handleTabChange('weapons')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'weapons' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('weapons') || 'Weapons'}</button>
        <button onClick={() => handleTabChange('roles')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'roles' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('rolesAgents') || 'Roles/Agents'}</button>
        <button onClick={() => handleTabChange('map')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'map' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('maps') || 'Map'}</button>
        <button onClick={() => handleTabChange('bymanual')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'bymanual' ? 'bg-orange-700 text-white' : 'bg-slate-900 text-orange-400'}`}>By Manual</button>
        {/* Results tab only if players, roles, and weapons are defined */}
        {randomizedResult &&
          players.length > 0 &&
          randomizedResult.roles && Object.keys(randomizedResult.roles).length > 0 &&
          randomizedResult.weapons && Object.keys(randomizedResult.weapons).length > 0 && (
          <button onClick={() => handleTabChange('results')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'results' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('results') || 'Results'}</button>
        )}
      </div>
      {/* Tab Content */}
      <div className="bg-slate-700/30 rounded-b-2xl border border-slate-700 p-6">
        {activeTab === 'players' && (
          <PlayerSection 
            ref={playerSectionRef}
            players={players}
            onPlayersChange={setPlayers}
            onManualTeamsChange={setManualTeams}
            onTeamModeChange={setTeamMode}
          />
        )}
        {activeTab === 'weapons' && (
          <WeaponSection ref={weaponSectionRef} players={players} manualTeams={manualTeams} teamMode={teamMode} />
        )}
        {activeTab === 'roles' && (
          <RoleSection ref={roleSectionRef} players={players} />
        )}
        {activeTab === 'map' && (
          <MapSection onMapSelect={handleMapSelectFromMapTab} />
        )}
        {activeTab === 'bymanual' && (
          <ByManualSection 
            players={players} 
            selectedMap={activeTab === 'bymanual' ? selectedMap : null}
            setSelectedMap={() => setActiveTab('map')} 
            clearSelectedMap={() => {
              setSelectedMap(null);
              localStorage.removeItem('valorant_selected_map_bymanual');
            }}
            mapImageUrls={mapImageUrls} 
            manualTeams={teamMode === 'manual' ? manualTeams : { team1: [], team2: [] }}
            teamMode={teamMode} 
            onAssignRoles={() => {
              setAssignmentMode('agent');
              if (roleSectionRef.current && roleSectionRef.current.setAssignmentMode) {
                roleSectionRef.current.setAssignmentMode('agent');
              }
              setActiveTab('roles');
            }}
            onAssignWeapons={() => {
              setActiveTab('weapons');
            }}
          />
        )}
        {activeTab === 'results' && randomizedResult &&
          players.length > 0 &&
          randomizedResult.roles && Object.keys(randomizedResult.roles).length > 0 &&
          randomizedResult.weapons && Object.keys(randomizedResult.weapons).length > 0 && (
          <ResultSection 
            result={randomizedResult} 
            assignmentMode={roleSectionRef.current?.getAssignmentMode ? roleSectionRef.current.getAssignmentMode() : 'role'}
            randomizationSettings={randomizationSettings}
          />
        )}
      </div>
      {/* Randomize Button (always visible except on results tab) */}
      {activeTab !== 'results' && (
        <div className="text-center mt-6">
          <button
            onClick={handleRandomizeAll}
            disabled={players.length < 2}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="w-6 h-6 inline-flex items-center justify-center mr-2">
              <i className="ri-shuffle-line"></i>
            </div>
            {t('randomizeAll')}
          </button>
          {players.length < 2 && (
            <p className="text-red-400 text-sm mt-2">{t('needAtLeast2Players') || 'Need at least 2 players to randomize'}</p>
          )}
        </div>
      )}
    </div>
  );
});
export default CompetitiveTab;
