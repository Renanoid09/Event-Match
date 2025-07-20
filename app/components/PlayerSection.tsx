
'use client';

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTeamMode, setTeamMode, TeamMode, getSubcategory, setSubcategory } from './StateHandler';

interface PlayerSectionProps {
  players: string[];
  onPlayersChange: (players: string[]) => void;
  onManualTeamsChange?: (teams: { team1: string[]; team2: string[] }) => void;
  onTeamModeChange?: (mode: 'random' | 'manual') => void;
}

const PlayerSection = forwardRef(function PlayerSection({ players, onPlayersChange, onManualTeamsChange, onTeamModeChange }: PlayerSectionProps, ref) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [teamMode, setTeamModeState] = useState<TeamMode>(() => {
    // Try to restore from subcategory state first, fallback to getTeamMode
    return getSubcategory<TeamMode>('valorant_players_subtab', getTeamMode());
  });
  const [manualTeams, setManualTeams] = useState<{ team1: string[]; team2: string[] }>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_manual_teams');
      if (stored) return JSON.parse(stored);
    }
    return { team1: [], team2: [] };
  });
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  // Load players from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('valorant_players');
      if (stored) {
        onPlayersChange(JSON.parse(stored));
      }
    }
    // eslint-disable-next-line
  }, []);

  // Save players to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_players', JSON.stringify(players));
    }
  }, [players]);

  // Save teamMode to localStorage on change
  useEffect(() => {
    setTeamMode(teamMode);
    if (onTeamModeChange) {
      onTeamModeChange(teamMode);
    }
  }, [teamMode, onTeamModeChange]);

  // Save manualTeams to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_manual_teams', JSON.stringify(manualTeams));
    }
    if (onManualTeamsChange) {
      onManualTeamsChange(manualTeams);
    }
  }, [manualTeams, onManualTeamsChange]);

  // Persist subcategory state on teamMode change
  useEffect(() => {
    setSubcategory('valorant_players_subtab', teamMode);
  }, [teamMode]);

  useImperativeHandle(ref, () => ({
    getTeamMode: () => teamMode,
    getManualTeams: () => manualTeams,
    focusInput: () => {
      if (inputRef.current) inputRef.current.focus();
    }
  }), [teamMode, manualTeams]);

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 10 && !players.includes(newPlayerName.trim())) {
      const updatedPlayers = [...players, newPlayerName.trim()];
      onPlayersChange(updatedPlayers);
      setNewPlayerName('');
    }
  };

  const removePlayer = (playerName: string) => {
    const updatedPlayers = players.filter(p => p !== playerName);
    onPlayersChange(updatedPlayers);

    // Remove from manual teams as well
    setManualTeams({
      team1: manualTeams.team1.filter(p => p !== playerName),
      team2: manualTeams.team2.filter(p => p !== playerName)
    });
  };

  const moveToTeam = (playerName: string, team: 'team1' | 'team2') => {
    const otherTeam = team === 'team1' ? 'team2' : 'team1';
    setManualTeams({
      ...manualTeams,
      [team]: [...manualTeams[team], playerName],
      [otherTeam]: manualTeams[otherTeam].filter(p => p !== playerName)
    });
  };

  const getUnassignedPlayers = () => {
    return players.filter(p => !manualTeams.team1.includes(p) && !manualTeams.team2.includes(p));
  };

  const setTeamModeAndResetTeams = (mode: TeamMode) => {
    setTeamModeState(mode);
    setSubcategory('valorant_players_subtab', mode);
    // Do not clear manualTeams when switching modes; preserve last manual assignment
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg mr-3">
          <i className="ri-team-line text-white"></i>
        </div>
        <h2 className="text-2xl font-bold text-white">{t('players')}</h2>
      </div>

      {/* Add Player */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder={t('enterPlayerName')}
            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
            maxLength={20}
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
          />
          <button
            onClick={addPlayer}
            disabled={!newPlayerName.trim() || players.length >= 10 || players.includes(newPlayerName.trim())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line"></i>
            </div>
          </button>
        </div>
        <p className="text-slate-400 text-xs mt-1">{players.length}/10 players</p>
      </div>

      {/* Team Mode Toggle */}
      <div className="mb-6">
        <div className="flex bg-slate-700/50 rounded-lg p-1">
          <button
            onClick={() => setTeamModeAndResetTeams('random')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all whitespace-nowrap ${
              teamMode === 'random'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('randomTeams')}
          </button>
          <button
            onClick={() => setTeamModeAndResetTeams('manual')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all whitespace-nowrap ${
              teamMode === 'manual'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {t('manualTeams')}
          </button>
        </div>
      </div>

      {/* Player List */}
      {teamMode === 'random' ? (
        <div className="space-y-2">
          {players.map(player => (
            <div key={player} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
              <span className="text-white font-medium">{player}</span>
              <button
                onClick={() => removePlayer(player)}
                className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Unassigned Players */}
          {getUnassignedPlayers().length > 0 && (
            <div>
              <h4 className="text-slate-300 font-medium mb-2">{t('unassignedPlayers')}</h4>
              <div className="space-y-2">
                {getUnassignedPlayers().map(player => (
                  <div key={player} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                    <span className="text-white font-medium">{player}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveToTeam(player, 'team1')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                      >
                        {t('team1')}
                      </button>
                      <button
                        onClick={() => moveToTeam(player, 'team2')}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        {t('team2')}
                      </button>
                      <button
                        onClick={() => removePlayer(player)}
                        className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team 1 */}
          <div>
            <h4 className="text-red-400 font-medium mb-2">{t('team1')} ({manualTeams.team1.length}/5)</h4>
            <div className="space-y-2">
              {manualTeams.team1.map(player => (
                <div key={player} className="flex items-center justify-between bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                  <span className="text-white font-medium">{player}</span>
                  <button
                    onClick={() => setManualTeams({
                      ...manualTeams,
                      team1: manualTeams.team1.filter(p => p !== player)
                    })}
                    className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Team 2 */}
          <div>
            <h4 className="text-blue-400 font-medium mb-2">{t('team2')} ({manualTeams.team2.length}/5)</h4>
            <div className="space-y-2">
              {manualTeams.team2.map(player => (
                <div key={player} className="flex items-center justify-between bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
                  <span className="text-white font-medium">{player}</span>
                  <button
                    onClick={() => setManualTeams({
                      ...manualTeams,
                      team2: manualTeams.team2.filter(p => p !== player)
                    })}
                    className="w-6 h-6 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PlayerSection;
