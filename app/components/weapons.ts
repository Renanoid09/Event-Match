// Shared weapons list for both Competitive and Deathmatch

export const weapons = {
  rifles: ['Vandal', 'Phantom', 'Bulldog', 'Guardian'],
  smgs: ['Spectre', 'Stinger'],
  shotguns: ['Judge', 'Bucky'],
  snipers: ['Operator', 'Marshal', 'Outlaw'],
  lmg: ['Odin', 'Ares'],
  pistols: ['Ghost', 'Sheriff', 'Frenzy', 'Classic', 'Shorty']
};

export const primaryWeapons = [
  ...weapons.rifles,
  ...weapons.smgs,
  ...weapons.shotguns,
  ...weapons.snipers,
  ...weapons.lmg
];

export const secondaryWeapons = weapons.pistols;

export const allWeapons = Object.values(weapons).flat(); 