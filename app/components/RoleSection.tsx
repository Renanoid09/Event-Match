
'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { agentImageUrls, roleImageUrls } from './urls';
import { getAssignmentMode, setAssignmentMode, AssignmentMode } from './StateHandler';

const roles = [
  'Duelist', 'Initiator', 'Controller', 'Sentinel'
];

const agents = {
  Duelist: ['Jett', 'Phoenix', 'Reyna', 'Raze', 'Yoru', 'Neon', 'Iso', 'Waylay'],
  Initiator: ['Sova', 'Breach', 'Skye', 'KAY/O', 'Fade', 'Gekko', 'Tejo'],
  Controller: ['Brimstone', 'Omen', 'Viper', 'Astra', 'Harbor', 'Clove'],
  Sentinel: ['Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock', 'Vyse']
};

const assignmentModes = [
  { value: 'role', label: 'Assign by Role' },
  { value: 'agent', label: 'Assign by Agent' },
  { value: 'replication', label: 'Replication' },
  { value: 'manual', label: 'By Manual' }, // Added manual mode
];

const RoleSection = forwardRef(function RoleSection(props: any, ref) {
  const players: string[] = props.players || [];
  const [assignmentMode, setAssignmentModeState] = useState<AssignmentMode>(() => getAssignmentMode());
  const [blacklistedRoles, setBlacklistedRoles] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_blacklisted_roles');
      if (stored) return new Set(JSON.parse(stored));
    }
    return new Set();
  });
  const [blacklistedAgents, setBlacklistedAgents] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_blacklisted_agents');
      if (stored) return new Set(JSON.parse(stored));
    }
    return new Set();
  });
  const [playerAgents, setPlayerAgents] = useState<{ [player: string]: string }>({});
  const [manualRoleAssignments, setManualRoleAssignments] = useState<{ player: string, role: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const { t } = useLanguage();

  // Expose mode and assignments to parent
  useImperativeHandle(ref, () => ({
    getAssignmentMode: () => assignmentMode,
    getPlayerAgents: () => playerAgents,
    getBlacklistedRoles: () => blacklistedRoles,
    getBlacklistedAgents: () => blacklistedAgents,
    setAssignmentMode: (mode: AssignmentMode) => setAssignmentModeState(mode),
  }), [assignmentMode, playerAgents, blacklistedRoles, blacklistedAgents]);

  // Save assignmentMode to localStorage on change
  useEffect(() => {
    setAssignmentMode(assignmentMode);
  }, [assignmentMode]);
  // Save blacklistedRoles to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_blacklisted_roles', JSON.stringify(Array.from(blacklistedRoles)));
    }
  }, [blacklistedRoles]);
  // Save blacklistedAgents to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_blacklisted_agents', JSON.stringify(Array.from(blacklistedAgents)));
    }
  }, [blacklistedAgents]);

  const toggleRoleStatus = (role: string) => {
    const newBlacklistedRoles = new Set(blacklistedRoles);
    const newBlacklistedAgents = new Set(blacklistedAgents);
    const roleAgents = agents[role as keyof typeof agents];

    if (newBlacklistedRoles.has(role)) {
      // Whitelist role and all its agents
      newBlacklistedRoles.delete(role);
      roleAgents.forEach(agent => {
        newBlacklistedAgents.delete(agent);
      });
    } else {
      // Blacklist role and all its agents
      newBlacklistedRoles.add(role);
      roleAgents.forEach(agent => {
        newBlacklistedAgents.add(agent);
      });
    }

    setBlacklistedRoles(newBlacklistedRoles);
    setBlacklistedAgents(newBlacklistedAgents);
  };

  const toggleAgentStatus = (agent: string, role: string) => {
    const newBlacklistedAgents = new Set(blacklistedAgents);
    const newBlacklistedRoles = new Set(blacklistedRoles);
    const roleAgents = agents[role as keyof typeof agents];

    if (newBlacklistedAgents.has(agent)) {
      newBlacklistedAgents.delete(agent);
    } else {
      newBlacklistedAgents.add(agent);
    }

    // Check if all agents in role are blacklisted
    const allRoleAgentsBlacklisted = roleAgents.every(a => 
      a === agent ? newBlacklistedAgents.has(agent) : newBlacklistedAgents.has(a)
    );

    // Check if no agents in role are blacklisted
    const noRoleAgentsBlacklisted = roleAgents.every(a => 
      a === agent ? !newBlacklistedAgents.has(agent) : !newBlacklistedAgents.has(a)
    );

    if (allRoleAgentsBlacklisted) {
      newBlacklistedRoles.add(role);
    } else if (noRoleAgentsBlacklisted) {
      newBlacklistedRoles.delete(role);
    }

    setBlacklistedAgents(newBlacklistedAgents);
    setBlacklistedRoles(newBlacklistedRoles);
  };

  const checkRoleBlacklisted = (role: string) => blacklistedRoles.has(role);
  const checkAgentBlacklisted = (agent: string) => blacklistedAgents.has(agent);

  // Handler for selecting agent for a player (for agent mode)
  const handlePlayerAgentChange = (player: string, agent: string) => {
    setPlayerAgents(prev => ({ ...prev, [player]: agent }));
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 flex items-center justify-center bg-purple-600 rounded-lg mr-3">
          <i className="ri-user-star-line text-white"></i>
        </div>
        <h2 className="text-2xl font-bold text-white">{t('rolesAgents')}</h2>
      </div>

      {/* Assignment Mode Selector */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setAssignmentModeState('role')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${assignmentMode === 'role' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-purple-700'}`}
        >
          {t('assignByRole')}
        </button>
        <button
          onClick={() => setAssignmentModeState('agent')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${assignmentMode === 'agent' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-purple-700'}`}
        >
          {t('assignByAgent')}
        </button>
        <button
          onClick={() => setAssignmentModeState('replication')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${assignmentMode === 'replication' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-purple-700'}`}
        >
          {t('replication')}
        </button>
      </div>

      {/* Assignment Mode Descriptions */}
      <div className="mt-6">
        {assignmentMode === 'role' && (
          <p className="text-slate-400 text-sm">{t('assignByRoleDesc')}</p>
        )}
        {assignmentMode === 'agent' && (
          <p className="text-slate-400 text-sm">{t('assignByAgentDesc')}</p>
        )}
        {assignmentMode === 'replication' && (
          <p className="text-slate-400 text-sm">{t('replicationModeDesc')}</p>
        )}
      </div>

      {/* Roles and Agents by Role */}
      <div className="space-y-6">
        {Object.entries(agents).map(([role, roleAgents]) => {
          const isRoleBlacklisted = checkRoleBlacklisted(role);
          return (
            <div key={role} className="bg-slate-700/30 rounded-xl p-4">
              <div 
                onClick={() => toggleRoleStatus(role)}
                className={`flex items-center justify-between rounded-lg p-3 mb-3 cursor-pointer transition-all ${
                  isRoleBlacklisted 
                    ? 'bg-red-900/20 border border-red-500/50 opacity-50' 
                    : 'bg-green-900/20 border border-green-500/50 hover:border-green-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {/* Role image */}
                  <img
                    src={roleImageUrls[role]}
                    alt={role}
                    className="w-8 h-8 object-cover rounded"
                  />
                <h3 className="font-semibold text-white">{t('role_' + role) || role}</h3>
                </div>
                <div className={`w-6 h-6 flex items-center justify-center rounded-full ${
                  isRoleBlacklisted ? 'bg-red-600' : 'bg-green-600'
                }`}>
                  <i className={`text-white text-sm ${
                    isRoleBlacklisted ? 'ri-close-line' : 'ri-check-line'
                  }`}></i>
                </div>
              </div>
              {/* Only show agents if assignmentMode is not 'role' */}
              {assignmentMode !== 'role' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roleAgents.map(agent => {
                    const isBlacklisted = checkAgentBlacklisted(agent);
                    return (
                      <div 
                        key={agent} 
                        onClick={() => toggleAgentStatus(agent, role)}
                        className={`flex items-center justify-between rounded-lg p-3 cursor-pointer transition-all ${
                          isBlacklisted 
                            ? 'bg-red-900/20 border border-red-500/50 opacity-50' 
                            : 'bg-green-900/20 border border-green-500/50 hover:border-green-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={agentImageUrls[agent]}
                            alt={agent}
                            className="w-8 h-8 object-cover rounded"
                          />
                        <span className="text-slate-300">{t('agent_' + agent) || agent}</span>
                        </div>
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
    </div>
  );
});

export default RoleSection;