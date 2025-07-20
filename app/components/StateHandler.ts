// StateHandler.ts
// Utility for managing main tab, sub-tab, and filter settings in localStorage

export type MainTab = 'deathmatch' | 'competitive' | 'settings';
export type SubTab = 'players' | 'weapons' | 'roles' | 'map' | 'bymanual' | 'results';

// Main Tab (Home)
export function getMainTab(): MainTab {
  if (typeof window !== 'undefined') {
    const tab = localStorage.getItem('valorant_main_tab');
    if (tab === 'deathmatch' || tab === 'competitive' || tab === 'settings') return tab;
  }
  return 'deathmatch';
}

export function setMainTab(tab: MainTab) {
  localStorage.setItem('valorant_main_tab', tab);
}

// Sub Tab (CompetitiveTab)
export function getSubTab(): SubTab {
  const validTabs = ['players', 'weapons', 'roles', 'map', 'bymanual', 'results'];
  const stored = localStorage.getItem('valorant_active_tab');
  if (stored && validTabs.includes(stored)) {
    return stored as SubTab;
  }
  return 'players';
}
export function setSubTab(tab: SubTab) {
  localStorage.setItem('valorant_active_tab', tab);
}

// Filter Settings
export interface FilterSettings {
  weapons?: {
    blacklistedWeapons?: any[];
    blacklistedCategories?: any[];
    weaponGroups?: any[];
    useCategoryGroups?: boolean;
    useWeaponGroups?: boolean;
  };
  roles?: {
    blacklistedRoles?: any[];
    blacklistedAgents?: any[];
    assignmentMode?: string;
  };
  maps?: {
    blacklistedMaps?: any[];
  };
}

export function saveFilterSettings(data: FilterSettings) {
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
}

export function loadFilterSettings(): FilterSettings {
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
  let blacklistedMaps: any[] = [];
  try {
    blacklistedMaps = JSON.parse(localStorage.getItem('valorant_blacklisted_maps') || '[]');
  } catch {}
  return {
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
}

// Team Mode (PlayerSection)
export type TeamMode = 'random' | 'manual';

export function getTeamMode(): TeamMode {
  if (typeof window !== 'undefined') {
    const mode = localStorage.getItem('valorant_team_mode');
    if (mode === 'random' || mode === 'manual') return mode;
  }
  return 'random';
}

export function setTeamMode(mode: TeamMode) {
  localStorage.setItem('valorant_team_mode', mode);
}

// WeaponSection selection mode
export type WeaponSelectionMode = 'category' | 'weapon';
export function getWeaponSelectionMode(): WeaponSelectionMode {
  if (typeof window !== 'undefined') {
    const mode = localStorage.getItem('valorant_weapon_selection_mode');
    if (mode === 'category' || mode === 'weapon') return mode;
  }
  return 'category';
}
export function setWeaponSelectionMode(mode: WeaponSelectionMode) {
  localStorage.setItem('valorant_weapon_selection_mode', mode);
}

// RoleSection assignment mode
export type AssignmentMode = 'role' | 'agent' | 'replication';
export function getAssignmentMode(): AssignmentMode {
  if (typeof window !== 'undefined') {
    const mode = localStorage.getItem('valorant_assignment_mode');
    if (mode === 'role' || mode === 'agent' || mode === 'replication') return mode;
  }
  return 'role';
}
export function setAssignmentMode(mode: AssignmentMode) {
  localStorage.setItem('valorant_assignment_mode', mode);
}

// DeathMatchTab selected weapon
export function getSelectedWeapon(): string | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('valorant_selected_weapon');
    if (stored) return JSON.parse(stored);
  }
  return null;
}
export function setSelectedWeapon(weapon: string | null) {
  localStorage.setItem('valorant_selected_weapon', JSON.stringify(weapon));
}

// WeaponRandomizer selection mode
export type DMSelectionMode = 'category' | 'weapon';
export function getDMSelectionMode(): DMSelectionMode {
  if (typeof window !== 'undefined') {
    const mode = localStorage.getItem('valorant_dm_selection_mode');
    if (mode === 'category' || mode === 'weapon') return mode;
  }
  return 'category';
}
export function setDMSelectionMode(mode: DMSelectionMode) {
  localStorage.setItem('valorant_dm_selection_mode', mode);
}

// WeaponRandomizer useCategoryGroups
export function getUseCategoryGroups(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('valorant_use_category_groups');
    if (stored !== null) return JSON.parse(stored);
  }
  return true;
}
export function setUseCategoryGroups(val: boolean) {
  localStorage.setItem('valorant_use_category_groups', JSON.stringify(val));
}

// WeaponRandomizer useWeaponGroups
export function getUseWeaponGroups(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('valorant_use_weapon_groups');
    if (stored !== null) return JSON.parse(stored);
  }
  return true;
}
export function setUseWeaponGroups(val: boolean) {
  localStorage.setItem('valorant_use_weapon_groups', JSON.stringify(val));
}

// Generic subcategory state handler
export function getSubcategory<T = any>(key: string, fallback: T): T {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        return JSON.parse(stored);
      } catch {
        return stored as unknown as T;
      }
    }
  }
  return fallback;
}

export function setSubcategory<T = any>(key: string, value: T) {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}
// Usage:
// getSubcategory('my_custom_key', defaultValue)
// setSubcategory('my_custom_key', value) 