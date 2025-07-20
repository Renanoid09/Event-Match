import React from 'react';
import { weapons, primaryWeapons, secondaryWeapons } from './weapons';

interface ByManualSectionProps {
  players: string[];
  selectedMap: string | null;
  setSelectedMap: () => void;
  clearSelectedMap?: () => void;
  mapImageUrls: { [key: string]: string };
  manualTeams: { team1: string[]; team2: string[] };
  teamMode: 'random' | 'manual';
  onAssignRoles?: () => void;
  onAssignWeapons?: () => void;
}

const TEAM1_COLOR = 'bg-red-700/40 border-red-500/60';
const TEAM2_COLOR = 'bg-blue-700/40 border-blue-500/60';
const DEFAULT_COLOR = 'bg-slate-700/40 border-slate-600';

const roles = [
  'Duelist', 'Initiator', 'Controller', 'Sentinel'
];

const agents = {
  Duelist: ['Jett', 'Phoenix', 'Reyna', 'Raze', 'Yoru', 'Neon', 'Iso', 'Waylay'],
  Initiator: ['Sova', 'Breach', 'Skye', 'KAY/O', 'Fade', 'Gekko', 'Tejo'],
  Controller: ['Brimstone', 'Omen', 'Viper', 'Astra', 'Harbor', 'Clove'],
  Sentinel: ['Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock', 'Vyse']
};

const ByManualSection: React.FC<ByManualSectionProps> = ({
  players,
  selectedMap,
  setSelectedMap,
  clearSelectedMap,
  mapImageUrls,
  manualTeams,
  teamMode,
  onAssignRoles,
  onAssignWeapons
}) => {
  // Organize players by team
  const team1Players = manualTeams.team1;
  const team2Players = manualTeams.team2;
  const unassignedPlayers = players.filter(
    (p) => !team1Players.includes(p) && !team2Players.includes(p)
  );

  // Local state for assignments
  const [playerAssignments, setPlayerAssignments] = React.useState<{
    [player: string]: {
      role: string;
      agent: string;
      primary: string;
      secondary: string;
    };
  }>({});

  const handleAssignmentChange = (player: string, field: 'role' | 'agent' | 'primary' | 'secondary', value: string) => {
    setPlayerAssignments(prev => ({
      ...prev,
      [player]: {
        ...prev[player],
        [field]: value
      }
    }));
  };

  const [isMapHovered, setIsMapHovered] = React.useState(false);

  const getPlayerColor = (player: string) => {
    if (teamMode === 'manual') {
      if (manualTeams.team1.includes(player)) return TEAM1_COLOR;
      if (manualTeams.team2.includes(player)) return TEAM2_COLOR;
    }
    return DEFAULT_COLOR;
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <span className="w-8 h-8 flex items-center justify-center bg-orange-600 rounded-lg mr-3">
          <i className="ri-sword-line text-white"></i>
        </span>
        By Manual
      </h2>
      {/* Map Selection Single Div */}
      <div className="mb-8">
        <div
          className={`w-full px-4 py-3 rounded-lg text-center font-semibold cursor-pointer border border-slate-600 transition-all relative overflow-hidden ${selectedMap ? '' : 'bg-slate-700 text-slate-200 hover:bg-orange-700 hover:text-white'}`}
          style={selectedMap ? {
            backgroundImage: `url(${mapImageUrls[selectedMap]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            minHeight: '160px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            textShadow: '0 2px 8px #000, 0 0 2px #000',
            position: 'relative',
            padding: 0,
          } : { minHeight: '160px' }}
          onClick={setSelectedMap}
          onMouseEnter={() => setIsMapHovered(true)}
          onMouseLeave={() => setIsMapHovered(false)}
        >
          {selectedMap ? (
            <>
              {/* Dark overlay on hover */}
              <div
                className={`absolute inset-0 transition-all duration-200 pointer-events-none ${isMapHovered ? 'bg-black/50' : 'bg-black/0'}`}
                style={{ zIndex: 1 }}
              />
              {/* Centered overlay text on hover */}
              {isMapHovered && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <span className="text-white text-lg font-bold bg-black/60 px-4 py-2 rounded-lg">Change the map</span>
                </div>
              )}
              {/* Map name bottom left */}
              <span
                className="absolute left-3 bottom-3 bg-black/60 text-white px-3 py-1 rounded-lg text-base font-semibold shadow"
                style={{ pointerEvents: 'none', zIndex: 2 }}
              >
                {selectedMap}
              </span>
            </>
          ) : (
            <span className="w-full text-center">Select a map</span>
          )}
        </div>
      </div>
      {selectedMap && clearSelectedMap && (
        <div className="flex items-center gap-3 mt-4 mb-6">
          <button
            onClick={clearSelectedMap}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-full shadow hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
            title="Clear selected map"
          >
            <i className="ri-close-circle-line text-lg mr-2"></i>
            Clear Map
          </button>
          <span className="text-slate-400 text-sm">Remove the selected map</span>
        </div>
      )}
      {/* Players List Vertical with Team Colors */}
      <div>
        <div className="text-white font-semibold mb-2">Players:</div>
        {players.length === 0 ? (
          <div className="text-slate-400 text-center">No players added.</div>
        ) : (
          <div className="flex flex-col gap-3">
            {team1Players.length > 0 && (
              <>
                <div className="text-red-400 font-bold text-left mb-1 ml-1">Team 1</div>
                {team1Players.map((player) => (
                  <div
                    key={player}
                    className={`${getPlayerColor(player)} rounded-xl p-4 border shadow text-white text-center font-bold flex flex-col gap-2`}
                  >
                    <div className="flex flex-row items-center justify-between gap-3">
                      <div>{player}</div>
                      <div className="flex flex-row gap-2">
                        <button className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold transition" onClick={onAssignRoles}>Assign Roles</button>
                        <button className="px-4 py-2 rounded bg-orange-700 hover:bg-orange-800 text-white font-semibold transition" onClick={onAssignWeapons}>Assign Weapons</button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {team2Players.length > 0 && (
              <>
                <div className="text-blue-400 font-bold text-left mb-1 ml-1">Team 2</div>
                {team2Players.map((player) => (
                  <div
                    key={player}
                    className={`${getPlayerColor(player)} rounded-xl p-4 border shadow text-white text-center font-bold flex flex-col gap-2`}
                  >
                    <div className="flex flex-row items-center justify-between gap-3">
                      <div>{player}</div>
                      <div className="flex flex-row gap-2">
                        <button className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold transition" onClick={onAssignRoles}>Assign Roles</button>
                        <button className="px-4 py-2 rounded bg-orange-700 hover:bg-orange-800 text-white font-semibold transition" onClick={onAssignWeapons}>Assign Weapons</button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {unassignedPlayers.length > 0 && (
              <>
                <div className="text-slate-400 font-bold text-left mb-1 ml-1">Unassigned</div>
                {unassignedPlayers.map((player) => (
                  <div
                    key={player}
                    className={`${DEFAULT_COLOR} rounded-xl p-4 border shadow text-white text-center font-bold flex flex-col gap-2`}
                  >
                    <div className="flex flex-row items-center justify-between gap-3">
                      <div>{player}</div>
                      <div className="flex flex-row gap-2">
                        <button className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-800 text-white font-semibold transition" onClick={onAssignRoles}>Assign Roles</button>
                        <button className="px-4 py-2 rounded bg-orange-700 hover:bg-orange-800 text-white font-semibold transition" onClick={onAssignWeapons}>Assign Weapons</button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ByManualSection; 