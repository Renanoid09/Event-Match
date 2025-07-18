
'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import PlayerSection from './PlayerSection';
import WeaponSection from './WeaponSection';
import RoleSection from './RoleSection';
import MapSection from './MapSection';
import ResultSection from './ResultSection';
import { useLanguage } from '../contexts/LanguageContext';
import { weapons, primaryWeapons, secondaryWeapons } from './weapons';

export interface RandomizedResult {
  teams: {
    team1: string[];
    team2: string[];
  };
  weapons: { [player: string]: { primary: string; secondary: string } };
  roles: { [player: string]: string };
  map: string;
}

const CompetitiveTab = forwardRef(function CompetitiveTab(props, ref) {
  const [players, setPlayers] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_players');
      if (stored) return JSON.parse(stored);
    }
    return [];
  });
  const [randomizedResult, setRandomizedResult] = useState<RandomizedResult | null>(null);
  const [activeTab, setActiveTab] = useState<'players' | 'weapons' | 'roles' | 'map' | 'results'>(() => {
    if (typeof window !== 'undefined') {
      const storedTab = localStorage.getItem('valorant_active_tab');
      if (storedTab === 'players' || storedTab === 'weapons' || storedTab === 'roles' || storedTab === 'map' || storedTab === 'results') {
        return storedTab;
      }
    }
    return 'players';
  });
  const [randomizationSettings, setRandomizationSettings] = useState<any>(null);
  const { t } = useLanguage();
  
  // Refs to access child component data
  const weaponSectionRef = useRef<any>(null);
  const roleSectionRef = useRef<any>(null);
  const mapSectionRef = useRef<any>(null);
  const playerSectionRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    focusPlayerInput: () => {
      playerSectionRef.current?.focusInput && playerSectionRef.current.focusInput();
    }
  }));

  // Save players to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_players', JSON.stringify(players));
    }
  }, [players]);

  // Load result and settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedResult = localStorage.getItem('valorant_randomized_result');
      const storedSettings = localStorage.getItem('valorant_randomization_settings');
      if (storedResult) setRandomizedResult(JSON.parse(storedResult));
      if (storedSettings) setRandomizationSettings(JSON.parse(storedSettings));
    }
  }, []);

  // Persist result and settings to localStorage when set
  useEffect(() => {
    if (typeof window !== 'undefined' && randomizedResult) {
      localStorage.setItem('valorant_randomized_result', JSON.stringify(randomizedResult));
    }
  }, [randomizedResult]);
  useEffect(() => {
    if (typeof window !== 'undefined' && randomizationSettings) {
      localStorage.setItem('valorant_randomization_settings', JSON.stringify(randomizationSettings));
    }
  }, [randomizationSettings]);

  // Persist activeTab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_active_tab', activeTab);
    }
  }, [activeTab]);

  const handleRandomizeAll = () => {
    if (players.length < 2) {
      alert('Need at least 2 players to randomize');
      return;
    }

    // Get team mode and manual teams from PlayerSection via ref
    const teamMode = playerSectionRef.current?.getTeamMode ? playerSectionRef.current.getTeamMode() : 'random';
    const manualTeams = playerSectionRef.current?.getManualTeams ? playerSectionRef.current.getManualTeams() : { team1: [], team2: [] };

    // Get weapon groups and toggle from WeaponSection via ref
    const weaponGroups = weaponSectionRef.current?.getWeaponGroups ? weaponSectionRef.current.getWeaponGroups() : [];
    const useWeaponGroups = weaponSectionRef.current?.getUseWeaponGroups ? weaponSectionRef.current.getUseWeaponGroups() : false;
    const weaponSelectionMode = weaponSectionRef.current?.getSelectionMode ? weaponSectionRef.current.getSelectionMode() : 'category';

    // Get role/agent assignment mode
    const assignmentMode = roleSectionRef.current?.getAssignmentMode ? roleSectionRef.current.getAssignmentMode() : 'role';

    // Store settings for result display
    setRandomizationSettings({
      weaponSelectionMode,
      weaponGroupsUsed: weaponGroups.length > 0 && useWeaponGroups,
      assignmentMode,
      teamMode
    });

    // Get available weapons
    // import { weapons, primaryWeapons, secondaryWeapons } from './weapons';

    // Get available agents by role
    const agents = {
      Duelist: ['Jett', 'Phoenix', 'Reyna', 'Raze', 'Yoru', 'Neon', 'Iso'],
      Initiator: ['Sova', 'Breach', 'Skye', 'KAY/O', 'Fade', 'Gekko'],
      Controller: ['Brimstone', 'Omen', 'Viper', 'Astra', 'Harbor', 'Clove'],
      Sentinel: ['Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock']
    };

    // Get available maps
    const maps = [
      'Bind', 'Haven', 'Split', 'Ascent', 'Icebox', 'Breeze', 
      'Fracture', 'Pearl', 'Lotus', 'Sunset', 'Abyss'
    ];

    // Helper function to shuffle array
    const shuffle = (array: any[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Helper function to get random item from array
    const getRandomItem = (array: any[]) => {
      return array[Math.floor(Math.random() * array.length)];
    };

    // 1. Create balanced teams
    let team1: string[] = [];
    let team2: string[] = [];
    if (teamMode === 'manual' && manualTeams.team1.length > 0 && manualTeams.team2.length > 0) {
      team1 = manualTeams.team1;
      team2 = manualTeams.team2;
    } else {
    const shuffledPlayers = shuffle(players);
    const midPoint = Math.ceil(shuffledPlayers.length / 2);
      team1 = shuffledPlayers.slice(0, midPoint);
      team2 = shuffledPlayers.slice(midPoint);
    }

    // 2. Assign agents/roles to each team based on assignmentMode
    let allRoles: { [player: string]: string } = {};
    const playerAgents = roleSectionRef.current?.getPlayerAgents ? roleSectionRef.current.getPlayerAgents() : {};
    const blacklistedRoles = roleSectionRef.current?.getBlacklistedRoles ? roleSectionRef.current.getBlacklistedRoles() : new Set();
    const blacklistedAgents = roleSectionRef.current?.getBlacklistedAgents ? roleSectionRef.current.getBlacklistedAgents() : new Set();

    if (assignmentMode === 'agent') {
      // Assign unique agents to each player in each team (no duplicates per team)
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
          // Fallback: assign any agent
          if (!assigned) {
            teamAssignments[player] = getRandomItem(allAvailableAgents);
          }
        });
        return teamAssignments;
      };
      const team1Agents = assignUniqueAgents(team1);
      const team2Agents = assignUniqueAgents(team2);
      allRoles = { ...team1Agents, ...team2Agents };
    } else if (assignmentMode === 'role') {
      // Assign unique roles to each player in each team (no duplicates per team)
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
          // Fallback: assign any role
          if (!assigned) {
            teamAssignments[player] = getRandomItem(availableRoles);
          }
        });
        return teamAssignments;
      };
      const team1Roles = assignUniqueRoles(team1);
      const team2Roles = assignUniqueRoles(team2);
      allRoles = { ...team1Roles, ...team2Roles };
    } else if (assignmentMode === 'replication') {
      // Replication: assign a random agent to all players in each team
      const getAvailableAgents = () => Object.values(agents).flat().filter(agent => !blacklistedAgents.has(agent));
      const availableAgents = getAvailableAgents();
      const team1Agent = getRandomItem(availableAgents);
      const team2Agent = getRandomItem(availableAgents);
      team1.forEach(player => {
        allRoles[player] = team1Agent;
      });
      team2.forEach(player => {
        allRoles[player] = team2Agent;
      });
    } else {
      // Default: assign unique agents by role (existing logic, but skip blacklisted roles/agents)
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
        // Fallback if no unique agent found
        if (!assignedAgent) {
            const allAgents = Object.values(filteredAgents).flat();
          const unusedAgents = allAgents.filter(agent => !usedAgents.has(agent));
          if (unusedAgents.length > 0) {
            const fallbackAgent = getRandomItem(unusedAgents);
            teamRoles[player] = fallbackAgent;
            usedAgents.add(fallbackAgent);
          } else {
            // Ultimate fallback
              teamRoles[player] = getRandomItem(Object.values(filteredAgents).flat());
          }
        }
      });
      return teamRoles;
    };
    const team1Roles = assignAgentsToTeam(team1);
    const team2Roles = assignAgentsToTeam(team2);
      allRoles = { ...team1Roles, ...team2Roles };
    }

    // 3. Assign weapons to players
    const playerWeapons: { [player: string]: { primary: string; secondary: string } } = {};
    if (weaponGroups && weaponGroups.length > 0 && useWeaponGroups) {
      // If there are weapon groups and toggle is on, assign a random group to each player
      const shuffledGroups = shuffle(weaponGroups);
      players.forEach((player, idx) => {
        const group = shuffledGroups[idx % shuffledGroups.length];
        playerWeapons[player] = { primary: group.primary, secondary: group.secondary };
      });
    } else {
      // Default logic
    players.forEach(player => {
      const primary = getRandomItem(primaryWeapons);
      const secondary = getRandomItem(secondaryWeapons);
      playerWeapons[player] = { primary, secondary };
    });
    }

    // 4. Select random map
    const selectedMap = getRandomItem(maps);

    // 5. Create result object
    const result: RandomizedResult = {
      teams: {
        team1,
        team2
      },
      weapons: playerWeapons,
      roles: allRoles,
      map: selectedMap
    };

    setRandomizedResult(result);
    setActiveTab('results');
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'players') {
      setTimeout(() => {
        playerSectionRef.current?.focusInput && playerSectionRef.current.focusInput();
      }, 50);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => handleTabChange('players')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'players' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('players') || 'Players'}</button>
        <button onClick={() => handleTabChange('weapons')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'weapons' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('weapons') || 'Weapons'}</button>
        <button onClick={() => handleTabChange('roles')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'roles' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('rolesAgents') || 'Roles/Agents'}</button>
        <button onClick={() => handleTabChange('map')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'map' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('maps') || 'Map'}</button>
        {randomizedResult && <button onClick={() => handleTabChange('results')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'results' ? 'bg-slate-700 text-white' : 'bg-slate-900 text-slate-400'}`}>{t('results') || 'Results'}</button>}
      </div>

      {/* Tab Content */}
      <div className="bg-slate-700/30 rounded-b-2xl border border-slate-700 p-6">
        {activeTab === 'players' && (
        <PlayerSection 
          ref={playerSectionRef}
          players={players}
          onPlayersChange={setPlayers}
        />
        )}
        {activeTab === 'weapons' && (
        <WeaponSection ref={weaponSectionRef} />
        )}
        {activeTab === 'roles' && (
        <RoleSection ref={roleSectionRef} />
        )}
        {activeTab === 'map' && (
          <MapSection />
        )}
        {activeTab === 'results' && randomizedResult && (
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
