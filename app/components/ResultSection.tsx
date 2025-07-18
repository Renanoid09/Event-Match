
'use client';

import { RandomizedResult } from './CompetitiveTab';
import { useLanguage } from '../contexts/LanguageContext';
import { useRef, useCallback, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { Radar, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement, // <-- Add this
} from 'chart.js';
import { weapons as weaponCategories } from './weapons';
import { mapImageUrls, agentImageUrls, roleImageUrls } from './urls';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement); // <-- Add BarElement here

// Add this at the top of the file for TypeScript support
// Remove the @ts-expect-error and rely on a .d.ts file for type support

interface ResultSectionProps {
  result: RandomizedResult;
  assignmentMode: 'role' | 'agent' | 'replication';
  randomizationSettings?: {
    weaponSelectionMode: string;
    weaponGroupsUsed: boolean;
    assignmentMode: string;
    teamMode: string;
  };
}

// Agent utility mapping for radar chart
const agentUtilities: { [agent: string]: { flash: boolean; info: boolean; deny: boolean; entry: boolean; hold: boolean } } = {
  // Duelists
  Jett:        { flash: false, info: false, deny: false, entry: true,  hold: false },
  Phoenix:     { flash: true,  info: false, deny: false, entry: true,  hold: false },
  Reyna:       { flash: true,  info: false, deny: false, entry: true,  hold: false },
  Raze:        { flash: false, info: false, deny: true,  entry: true,  hold: false },
  Yoru:        { flash: true,  info: false, deny: false, entry: true,  hold: false },
  Neon:        { flash: false, info: false, deny: false, entry: true,  hold: false },
  Iso:         { flash: false, info: false, deny: false, entry: true,  hold: false },
  Waylay:      { flash: false, info: false, deny: false, entry: true,  hold: false },
  // Initiators
  Sova:        { flash: false, info: true,  deny: false, entry: false, hold: false },
  Breach:      { flash: true,  info: false, deny: true,  entry: true,  hold: false },
  Skye:        { flash: true,  info: true,  deny: false, entry: false, hold: false },
  'KAY/O':     { flash: true,  info: false, deny: true,  entry: false, hold: false },
  Fade:        { flash: false, info: true,  deny: false, entry: false, hold: false },
  Gekko:       { flash: true,  info: true,  deny: false, entry: false, hold: false },
  Tejo:        { flash: false, info: true,  deny: false, entry: false, hold: false },
  // Controllers
  Brimstone:   { flash: false, info: false, deny: true,  entry: false, hold: true  },
  Omen:        { flash: true,  info: false, deny: true,  entry: false, hold: true  },
  Viper:       { flash: false, info: false, deny: true,  entry: false, hold: true  },
  Astra:       { flash: false, info: false, deny: true,  entry: false, hold: true  },
  Harbor:      { flash: false, info: false, deny: true,  entry: false, hold: true  },
  Clove:       { flash: false, info: false, deny: true,  entry: false, hold: true  },
  // Sentinels
  Sage:        { flash: false, info: false, deny: true,  entry: false, hold: true  },
  Cypher:      { flash: false, info: true,  deny: false, entry: false, hold: true  },
  Killjoy:     { flash: false, info: true,  deny: false, entry: false, hold: true  },
  Chamber:     { flash: false, info: false, deny: false, entry: false, hold: true  },
  Deadlock:    { flash: false, info: false, deny: false, entry: false, hold: true  },
  Vyse:        { flash: false, info: false, deny: false, entry: false, hold: true  },
};

export default function ResultSection({ result, assignmentMode, randomizationSettings }: ResultSectionProps) {
  const { t } = useLanguage();
  const resultRef = useRef<HTMLDivElement>(null);

  // Replace exportResultsAsImage with exportFilterSettings
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
    // Maps (optional, if implemented)
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
        window.location.reload();
      } catch {
        alert('Invalid or corrupted settings file.');
      }
    };
    reader.readAsText(file);
  };

  const randomizeAgain = () => {
    window.location.reload();
  };

  const renderPlayerRow = (player: string, index: number, teamColor: 'red' | 'blue') => (
    <div key={player} className={`bg-${teamColor}-800/20 rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {assignmentMode === 'agent' || assignmentMode === 'replication' ? (
            <img
              src={agentImageUrls[result.roles[player]]}
              alt={result.roles[player]}
              className="w-8 h-8 object-cover rounded mr-3"
            />
          ) : (
            <img
              src={roleImageUrls[result.roles[player]]}
              alt={result.roles[player]}
              className="w-8 h-8 object-cover rounded mr-3"
            />
          )}
          <span className="text-white font-medium">{player}</span>
        </div>
        <div className="flex flex-col justify-center text-right h-8">
          <div className="text-slate-300 text-xs">{t('role_' + result.roles[player]) || result.roles[player]}</div>
          <div className="text-slate-300 text-xs">
            {t('weapon_' + result.weapons[player]?.primary) || result.weapons[player]?.primary}
            {' • '}
            {t('weapon_' + result.weapons[player]?.secondary) || result.weapons[player]?.secondary}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmptyRow = (key: string, teamColor: 'red' | 'blue', idx: number, playersLength: number) => (
    <div key={key} className={`bg-${teamColor}-800/10 rounded-lg p-4 opacity-0`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-8 h-8 flex items-center justify-center bg-${teamColor}-600 rounded-full text-white font-bold mr-3`}>
            {playersLength + idx + 1}
          </div>
          <span className="text-white font-semibold">&nbsp;</span>
        </div>
        <div className="text-right">
          <div className={`text-${teamColor}-300 text-sm font-medium`}>&nbsp;</div>
          <div className="text-slate-300 text-xs">&nbsp;</div>
        </div>
      </div>
    </div>
  );

  const team1Players = useMemo(() => result.teams.team1, [result.teams.team1]);
  const team2Players = useMemo(() => result.teams.team2, [result.teams.team2]);
  const team1EmptySlots = 5 - team1Players.length;
  const team2EmptySlots = 5 - team2Players.length;

  // Add statistics helpers
  const getRoleDistribution = () => {
    const roleCounts: Record<string, number> = {};
    Object.values(result.roles).forEach(role => {
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    return roleCounts;
  };
  const getAgentDistribution = () => {
    if (assignmentMode !== 'agent' && assignmentMode !== 'replication') return null;
    const agentCounts: Record<string, number> = {};
    Object.values(result.roles).forEach(agent => {
      agentCounts[agent] = (agentCounts[agent] || 0) + 1;
    });
    return agentCounts;
  };
  const getWeaponDistribution = () => {
    const primaryCounts: Record<string, number> = {};
    const secondaryCounts: Record<string, number> = {};
    Object.values(result.weapons).forEach(w => {
      primaryCounts[w.primary] = (primaryCounts[w.primary] || 0) + 1;
      secondaryCounts[w.secondary] = (secondaryCounts[w.secondary] || 0) + 1;
    });
    return { primaryCounts, secondaryCounts };
  };
  const getMapStats = () => {
    let blacklistedMaps: string[] = [];
    try {
      blacklistedMaps = JSON.parse(localStorage.getItem('valorant_blacklisted_maps') || '[]');
    } catch {}
    return {
      selectedMap: result.map,
      blockedMaps: blacklistedMaps,
    };
  };

  // Radar chart data for team comp comparison
  const utilityTypes = ['flash', 'info', 'deny', 'entry', 'hold'];
  const utilityLabels = ['Flashes', 'Recon', 'Smokes', 'Entry Power', 'Site Anchor'];
  const getTeamUtilityCounts = (teamPlayers: string[]) => {
    const counts: { [key: string]: number } = { flash: 0, info: 0, deny: 0, entry: 0, hold: 0 };
    teamPlayers.forEach(player => {
      const agent = result.roles[player];
      const util = agentUtilities[agent];
      if (util) {
        utilityTypes.forEach(type => {
          if (util[type as keyof typeof util]) counts[type]++;
        });
      }
    });
    return utilityTypes.map(type => counts[type]);
  };
  const team1UtilityCounts = getTeamUtilityCounts(team1Players);
  const team2UtilityCounts = getTeamUtilityCounts(team2Players);
  const radarData = {
    labels: utilityLabels,
    datasets: [
      {
        label: 'Team 1',
        data: team1UtilityCounts,
        backgroundColor: 'rgba(239,68,68,0.2)',
        borderColor: 'rgba(239,68,68,1)',
        pointBackgroundColor: 'rgba(239,68,68,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(239,68,68,1)',
      },
      {
        label: 'Team 2',
        data: team2UtilityCounts,
        backgroundColor: 'rgba(59,130,246,0.2)',
        borderColor: 'rgba(59,130,246,1)',
        pointBackgroundColor: 'rgba(59,130,246,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59,130,246,1)',
      },
    ],
  };
  const radarOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#fff', font: { size: 16, weight: 700 } },
      },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.2)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: '#fff', font: { size: 16 } },
        ticks: { display: false, min: 0, max: 5 },
      },
    },
  };

  // --- Bar chart data for role and weapon distribution ---
  // Split role and weapon distribution by team
  const getTeamRoleCounts = (teamPlayers: string[]) => {
    const counts: Record<string, number> = {};
    teamPlayers.forEach(player => {
      const role = result.roles[player];
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  };
  const getTeamWeaponCounts = (teamPlayers: string[], type: 'primary' | 'secondary') => {
    const counts: Record<string, number> = {};
    teamPlayers.forEach(player => {
      const weapon = result.weapons[player]?.[type];
      if (weapon) counts[weapon] = (counts[weapon] || 0) + 1;
    });
    return counts;
  };
  const team1RoleCounts = getTeamRoleCounts(team1Players);
  const team2RoleCounts = getTeamRoleCounts(team2Players);
  const allRoles = Array.from(new Set([...Object.keys(team1RoleCounts), ...Object.keys(team2RoleCounts)]));
  const roleBarData = {
    labels: allRoles,
    datasets: [
      {
        label: 'Team 1',
        data: allRoles.map(role => team1RoleCounts[role] || 0),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderColor: 'rgba(239,68,68,1)',
        borderWidth: 1,
      },
      {
        label: 'Team 2',
        data: allRoles.map(role => team2RoleCounts[role] || 0),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
      },
    ],
  };
  const roleBarOptions = {
    plugins: { legend: { display: false }, },
    scales: {
      x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' }, stacked: false },
      y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' }, beginAtZero: true, stacked: false },
    },
  };
  // Weapon bar data split by team
  const team1PrimaryCounts = getTeamWeaponCounts(team1Players, 'primary');
  const team2PrimaryCounts = getTeamWeaponCounts(team2Players, 'primary');
  const allPrimaryWeapons = Array.from(new Set([...Object.keys(team1PrimaryCounts), ...Object.keys(team2PrimaryCounts)]));
  const weaponBarData = {
    labels: allPrimaryWeapons,
    datasets: [
      {
        label: 'Team 1',
        data: allPrimaryWeapons.map(w => team1PrimaryCounts[w] || 0),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderColor: 'rgba(239,68,68,1)',
        borderWidth: 1,
      },
      {
        label: 'Team 2',
        data: allPrimaryWeapons.map(w => team2PrimaryCounts[w] || 0),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
      },
    ],
  };
  const team1SecondaryCounts = getTeamWeaponCounts(team1Players, 'secondary');
  const team2SecondaryCounts = getTeamWeaponCounts(team2Players, 'secondary');
  const allSecondaryWeapons = Array.from(new Set([...Object.keys(team1SecondaryCounts), ...Object.keys(team2SecondaryCounts)]));
  const secondaryWeaponBarData = {
    labels: allSecondaryWeapons,
    datasets: [
      {
        label: 'Team 1',
        data: allSecondaryWeapons.map(w => team1SecondaryCounts[w] || 0),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderColor: 'rgba(239,68,68,1)',
        borderWidth: 1,
      },
      {
        label: 'Team 2',
        data: allSecondaryWeapons.map(w => team2SecondaryCounts[w] || 0),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
      },
    ],
  };
  // --- End bar chart data ---

  // Primary weapon distribution by category
  const getTeamPrimaryCategoryCounts = (teamPlayers: string[]) => {
    const counts: Record<string, number> = {};
    teamPlayers.forEach(player => {
      const weapon = result.weapons[player]?.primary;
      if (weapon) {
        // Find the category for this weapon
        const category = Object.entries(weaponCategories).find(([cat, list]) => list.includes(weapon))?.[0];
        if (category) {
          counts[category] = (counts[category] || 0) + 1;
        }
      }
    });
    return counts;
  };
  const team1PrimaryCatCounts = getTeamPrimaryCategoryCounts(team1Players);
  const team2PrimaryCatCounts = getTeamPrimaryCategoryCounts(team2Players);
  const allPrimaryCategories = Array.from(new Set([...Object.keys(team1PrimaryCatCounts), ...Object.keys(team2PrimaryCatCounts)]));
  const primaryCategoryBarData = {
    labels: allPrimaryCategories,
    datasets: [
      {
        label: 'Team 1',
        data: allPrimaryCategories.map(cat => team1PrimaryCatCounts[cat] || 0),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderColor: 'rgba(239,68,68,1)',
        borderWidth: 1,
      },
      {
        label: 'Team 2',
        data: allPrimaryCategories.map(cat => team2PrimaryCatCounts[cat] || 0),
        backgroundColor: 'rgba(59,130,246,0.7)',
        borderColor: 'rgba(59,130,246,1)',
        borderWidth: 1,
      },
    ],
  };

  const weaponBarOptions = {
    plugins: { legend: { display: false }, },
    scales: {
      x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' }, stacked: false },
      y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' }, beginAtZero: true, stacked: false },
    },
  };

  // --- Agent distribution by role ---
  const roleOrder = ['Duelist', 'Initiator', 'Controller', 'Sentinel'];
  const agentsByRole = {
    Duelist: ['Jett', 'Phoenix', 'Reyna', 'Raze', 'Yoru', 'Neon', 'Iso', 'Waylay'],
    Initiator: ['Sova', 'Breach', 'Skye', 'KAY/O', 'Fade', 'Gekko', 'Tejo'],
    Controller: ['Brimstone', 'Omen', 'Viper', 'Astra', 'Harbor', 'Clove'],
    Sentinel: ['Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock', 'Vyse']
  };
  // Count agents picked
  const agentCounts: Record<string, number> = {};
  Object.values(result.roles).forEach(agent => {
    agentCounts[agent] = (agentCounts[agent] || 0) + 1;
  });
  // Prepare data for bar chart: group by role, each agent as label
  const agentLabels: string[] = [];
  const agentRoleColors: string[] = [];
  const roleColors: Record<string, string> = {
    Duelist: 'rgba(239,68,68,0.7)',
    Initiator: 'rgba(34,197,94,0.7)',
    Controller: 'rgba(59,130,246,0.7)',
    Sentinel: 'rgba(251,191,36,0.7)'
  };
  roleOrder.forEach(role => {
    agentsByRole[role as keyof typeof agentsByRole].forEach((agent: string) => {
      agentLabels.push(agent);
      agentRoleColors.push(roleColors[role]);
    });
  });
  const agentBarData = {
    labels: agentLabels,
    datasets: [
      {
        label: 'Agent Picks',
        data: agentLabels.map(agent => agentCounts[agent] || 0),
        backgroundColor: agentRoleColors,
        borderColor: agentRoleColors,
        borderWidth: 1,
      },
    ],
  };
  const agentBarOptions = {
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.raw}` } } },
    scales: {
      x: { ticks: { color: '#fff', font: { size: 12 } }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' }, beginAtZero: true },
    },
  };

  return (
    <div ref={resultRef} className="bg-gradient-to-r from-slate-800/40 to-slate-700/40 backdrop-blur-sm rounded-2xl border border-slate-600 p-8">
      {/* Map Banner at Top */}
      <div className="w-full flex flex-col items-center mb-8 gap-4">
        <div className="w-full aspect-[3/1] max-h-64 rounded-2xl overflow-hidden shadow-lg relative bg-gradient-to-br from-green-700/60 to-green-900/80 border border-green-500/30">
          <img
            src={mapImageUrls[result.map]}
            alt={result.map}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <span className="absolute left-8 bottom-6 text-5xl font-extrabold text-white drop-shadow-[0_0_16px_rgba(0,255,255,0.8)] tracking-wide" style={{letterSpacing: '0.08em'}}>{t('map_' + result.map) || result.map}</span>
        </div>
      </div>
      {/* Teams Row - directly below map */}
      <div className="flex flex-row gap-8 rounded-3xl overflow-x-auto shadow-2xl border border-slate-700/60 backdrop-blur-xl p-4 md:p-12 bg-white/5 mb-10">
        {/* Team 1 */}
        <div className="flex-1 p-0 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2"><i className='ri-team-fill text-red-400 text-xl'></i><span className="text-lg font-bold text-red-200 tracking-wide">{t('team1')}</span></div>
          <div className="p-0">
            <div className="space-y-5 min-h-[180px] flex flex-col justify-start">
              {team1Players.map((player, idx) => (
                <div key={player} className="bg-gradient-to-r from-red-700/80 to-pink-600/80 border border-white/20 rounded-xl p-5 shadow-[0_0_24px_0_rgba(239,68,68,0.4)]">
                  {renderPlayerRow(player, idx, 'red')}
                </div>
              ))}
              {Array.from({ length: team1EmptySlots }).map((_, idx) => (
                <div key={`empty1-${idx}`} className="bg-red-700/40 border border-white/10 rounded-xl p-5 opacity-0">
                  {renderEmptyRow(`empty1-${idx}`, 'red', idx, team1Players.length)}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Divider for desktop */}
        <div className="hidden md:block w-0.5 bg-gradient-to-b from-cyan-400/30 via-slate-400/10 to-pink-500/30 rounded-full mx-2" />
        {/* Team 2 */}
        <div className="flex-1 p-0 flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2 justify-end"><span className="text-lg font-bold text-blue-200 tracking-wide">{t('team2')}</span><i className='ri-team-fill text-blue-400 text-xl'></i></div>
          <div className="p-0">
            <div className="space-y-5 min-h-[180px] flex flex-col justify-start">
              {team2Players.map((player, idx) => (
                <div key={player} className="bg-gradient-to-r from-blue-700/80 to-cyan-600/80 border border-white/20 rounded-xl p-5 shadow-[0_0_24px_0_rgba(59,130,246,0.4)]">
                  {renderPlayerRow(player, idx, 'blue')}
                </div>
              ))}
              {Array.from({ length: team2EmptySlots }).map((_, idx) => (
                <div key={`empty2-${idx}`} className="bg-blue-700/40 border border-white/10 rounded-xl p-5 opacity-0">
                  {renderEmptyRow(`empty2-${idx}`, 'blue', idx, team2Players.length)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Randomization Settings Card - uniform styling */}
      {randomizationSettings && (
        <div className="w-full flex flex-col items-center mt-8">
          <div className="bg-slate-800/60 border border-slate-600/60 rounded-2xl shadow-lg p-8 flex flex-col items-center w-full max-w-2xl">
            <h4 className="text-2xl font-bold text-cyan-300 mb-4 flex items-center gap-3 justify-center">
              <i className="ri-shuffle-line text-cyan-400 text-2xl"></i>
              {t('randomizationSettings')}
            </h4>
            <ul className="text-slate-200 text-lg grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 w-full divide-y divide-slate-700/60 md:divide-y-0 md:divide-x">
              <li className="py-2 px-4 flex flex-col items-center md:items-start"><span className="font-semibold">{t('assignmentMode')}</span> <span>{t('assignBy' + (randomizationSettings.assignmentMode.charAt(0).toUpperCase() + randomizationSettings.assignmentMode.slice(1))) || randomizationSettings.assignmentMode}</span></li>
              <li className="py-2 px-4 flex flex-col items-center md:items-start"><span className="font-semibold">{t('weaponSelection')}</span> <span>{t('weaponSelection_' + randomizationSettings.weaponSelectionMode) || randomizationSettings.weaponSelectionMode}</span></li>
              <li className="py-2 px-4 flex flex-col items-center md:items-start"><span className="font-semibold">{t('weaponGroupsUsed')}</span> <span>{randomizationSettings.weaponGroupsUsed ? t('yes') : t('no')}</span></li>
              <li className="py-2 px-4 flex flex-col items-center md:items-start"><span className="font-semibold">{t('teamMode')}</span> <span>{t('teamMode_' + randomizationSettings.teamMode) || randomizationSettings.teamMode}</span></li>
            </ul>
          </div>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-12 mb-2">
        <button 
          onClick={randomizeAgain}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors whitespace-nowrap shadow"
        >
          <div className="w-5 h-5 inline-flex items-center justify-center mr-2">
            <i className="ri-refresh-line"></i>
          </div>
          {t('randomizeAgain') || 'Randomize Again'}
        </button>
      </div>
    </div>
  );
}
