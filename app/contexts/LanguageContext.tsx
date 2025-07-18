'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ja' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'title': 'VALORANT Randomizer',
    'subtitle': 'Professional Team & Loadout Randomizer for Competitive Play',
    'deathmatch': 'Deathmatch',
    'competitive': 'Competitive',
    
    // Player Section
    'players': 'Players',
    'enterPlayerName': 'Enter player name',
    'randomTeams': 'Random Teams',
    'manualTeams': 'Manual Teams',
    'unassignedPlayers': 'Unassigned Players',
    'team1': 'Team 1',
    'team2': 'Team 2',
    
    // Map Section
    'maps': 'Maps',
    'active': 'Active',
    'blocked': 'Blocked',
    
    // Weapon Section
    'weapons': 'Weapons',
    'createGroup': 'Create Group',
    'weaponGroups': 'Weapon Groups',
    'createWeaponGroup': 'Create Weapon Group',
    'groupName': 'Group Name',
    'enterGroupName': 'Enter group name',
    'primaryWeapon': 'Primary Weapon',
    'selectPrimaryWeapon': 'Select primary weapon',
    'secondaryWeapon': 'Secondary Weapon',
    'selectSecondaryWeapon': 'Select secondary weapon',
    'create': 'Create',
    
    // Role Section
    'rolesAgents': 'Roles & Agents',
    
    // Weapon Categories
    'rifles': 'Rifles',
    'smgs': 'SMGs',
    'shotguns': 'Shotguns',
    'snipers': 'Snipers',
    'lmg': 'LMG',
    'pistols': 'Pistols',
    
    // Weapon Randomizer
    'weaponRandomizer': 'Weapon Randomizer',
    'weaponTypes': 'Weapon Types',
    'individualWeapons': 'Individual Weapons',
    'randomizeWeapon': 'Randomize Weapon',
    'availableWeapons': 'Available weapons',
    'selectedWeapon': 'Selected Weapon',
    
    // Actions
    'randomizeAll': 'Randomize All',
    'matchResults': 'Match Results',
    'selectedMap': 'Selected Map',
    'matchStatistics': 'Match Statistics',
    'teamBalance': 'Team Balance',
    'exportFilterSettings': 'Export Filter Settings',
    'randomizeAgain': 'Randomize Again',
    'needAtLeast2Players': 'Need at least 2 players to randomize',
    'results': 'Results',
    'byCategory': 'By Category',
    'byWeapon': 'By Weapon',
    'assignByAgent': 'Assign by Agent',
    'assignByRole': 'Assign by Role',
    'replication': 'Replication',
    'agentAssignmentDuringRandomization': 'Agent assignment will be available during randomization.',
    'replicationMode': 'Replication Mode',
    'replicationModeDesc': 'A random agent will be chosen for each team and assigned to all players in that team.',
    'assignByRoleDesc': 'A random role will be assigned to each player. Roles will not be duplicated within a team.',
    'assignByAgentDesc': 'A random agent will be assigned to each player. Agents will not be duplicated within a team.',
    // Roles
    'role_Duelist': 'Duelist',
    'role_Initiator': 'Initiator',
    'role_Controller': 'Controller',
    'role_Sentinel': 'Sentinel',
    // Agents
    'agent_Jett': 'Jett',
    'agent_Phoenix': 'Phoenix',
    'agent_Reyna': 'Reyna',
    'agent_Raze': 'Raze',
    'agent_Yoru': 'Yoru',
    'agent_Neon': 'Neon',
    'agent_Iso': 'Iso',
    'agent_Waylay': 'Waylay',
    'agent_Sova': 'Sova',
    'agent_Breach': 'Breach',
    'agent_Skye': 'Skye',
    'agent_KAY/O': 'KAY/O',
    'agent_Fade': 'Fade',
    'agent_Gekko': 'Gekko',
    'agent_Tejo': 'Tejo',
    'agent_Brimstone': 'Brimstone',
    'agent_Omen': 'Omen',
    'agent_Viper': 'Viper',
    'agent_Astra': 'Astra',
    'agent_Harbor': 'Harbor',
    'agent_Clove': 'Clove',
    'agent_Sage': 'Sage',
    'agent_Cypher': 'Cypher',
    'agent_Killjoy': 'Killjoy',
    'agent_Chamber': 'Chamber',
    'agent_Deadlock': 'Deadlock',
    'agent_Vyse': 'Vyse',
    // Maps
    'map_Bind': 'Bind',
    'map_Haven': 'Haven',
    'map_Split': 'Split',
    'map_Ascent': 'Ascent',
    'map_Icebox': 'Icebox',
    'map_Breeze': 'Breeze',
    'map_Fracture': 'Fracture',
    'map_Pearl': 'Pearl',
    'map_Lotus': 'Lotus',
    'map_Sunset': 'Sunset',
    'map_Abyss': 'Abyss',
    'map_Corrode': 'Corrode',
    'importFilterSettings': 'Import Filter Settings',
    'settings': 'Settings',
    // Weapons
    'weapon_Vandal': 'Vandal',
    'weapon_Phantom': 'Phantom',
    'weapon_Bulldog': 'Bulldog',
    'weapon_Guardian': 'Guardian',
    'weapon_Spectre': 'Spectre',
    'weapon_Stinger': 'Stinger',
    'weapon_Judge': 'Judge',
    'weapon_Bucky': 'Bucky',
    'weapon_Operator': 'Operator',
    'weapon_Marshal': 'Marshal',
    'weapon_Outlaw': 'Outlaw',
    'weapon_Odin': 'Odin',
    'weapon_Ares': 'Ares',
    'weapon_Ghost': 'Ghost',
    'weapon_Sheriff': 'Sheriff',
    'weapon_Frenzy': 'Frenzy',
    'weapon_Classic': 'Classic',
    'weapon_Shorty': 'Shorty',
    'assignmentMode': 'Assignment Mode',
    'weaponSelection': 'Weapon Selection',
    'weaponGroupsUsed': 'Weapon Groups Used',
    'teamMode': 'Team Mode',
    'yes': 'Yes',
    'no': 'No',
    'weaponSelection_category': 'By Category',
    'weaponSelection_weapon': 'By Weapon',
    'teamMode_random': 'Random',
    'teamMode_manual': 'Manual',
    'save': 'Save',
    'cancel': 'Cancel',
    'useForRandomization': 'Use for Randomization',
    'randomizationSettings': 'Randomization Settings',
  },
  ja: {
    'title': 'VALORANT ランダマイザー',
    'subtitle': '競技用のプロフェッショナルチーム＆ロードアウトランダマイザー',
    'deathmatch': 'デスマッチ',
    'competitive': 'コンペティティブ',
    'players': 'プレイヤー',
    'enterPlayerName': 'プレイヤー名を入力',
    'randomTeams': 'ランダムチーム',
    'manualTeams': '手動チーム',
    'unassignedPlayers': '未割り当てプレイヤー',
    'team1': 'チーム1',
    'team2': 'チーム2',
    'maps': 'マップ',
    'active': '有効',
    'blocked': 'ブロック',
    'weapons': '武器',
    'createGroup': 'グループ作成',
    'weaponGroups': '武器グループ',
    'createWeaponGroup': '武器グループ作成',
    'groupName': 'グループ名',
    'enterGroupName': 'グループ名を入力',
    'primaryWeapon': 'メイン武器',
    'selectPrimaryWeapon': 'メイン武器を選択',
    'secondaryWeapon': 'サブ武器',
    'selectSecondaryWeapon': 'サブ武器を選択',
    'create': '作成',
    'rolesAgents': 'ロール＆エージェント',
    'rifles': 'ライフル',
    'smgs': 'SMG',
    'shotguns': 'ショットガン',
    'snipers': 'スナイパー',
    'lmg': 'LMG',
    'pistols': 'ピストル',
    'weaponRandomizer': '武器ランダマイザー',
    'weaponTypes': '武器タイプ',
    'individualWeapons': '個別武器',
    'randomizeWeapon': '武器をランダム化',
    'availableWeapons': '利用可能な武器',
    'selectedWeapon': '選択された武器',
    'randomizeAll': '全てランダム化',
    'matchResults': 'マッチ結果',
    'selectedMap': '選択されたマップ',
    'matchStatistics': 'マッチ統計',
    'teamBalance': 'チームバランス',
    'exportFilterSettings': 'フィルター設定をエクスポート',
    'randomizeAgain': '再ランダム化',
    'needAtLeast2Players': 'ランダム化には最低2人のプレイヤーが必要です',
    'results': '結果',
    'byCategory': 'カテゴリ別',
    'byWeapon': '武器別',
    'assignByAgent': 'エージェントで割り当て',
    'assignByRole': 'ロールで割り当て',
    'replication': 'レプリケーション',
    'agentAssignmentDuringRandomization': 'エージェントの割り当てはランダム化時に利用可能です。',
    'replicationMode': 'レプリケーションモード',
    'replicationModeDesc': '各チームにランダムなエージェントが選ばれ、そのチームの全プレイヤーに割り当てられます。',
    'assignByRoleDesc': '各プレイヤーにランダムなロールが割り当てられます。同じチーム内でロールは重複しません。',
    'assignByAgentDesc': '各プレイヤーにランダムなエージェントが割り当てられます。同じチーム内でエージェントは重複しません。',
    // Roles
    'role_Duelist': 'デュエリスト',
    'role_Initiator': 'イニシエーター',
    'role_Controller': 'コントローラー',
    'role_Sentinel': 'センチネル',
    // Agents
    'agent_Jett': 'ジェット',
    'agent_Phoenix': 'フェニックス',
    'agent_Reyna': 'レイナ',
    'agent_Raze': 'レイズ',
    'agent_Yoru': 'ヨル',
    'agent_Neon': 'ネオン',
    'agent_Iso': 'イソ',
    'agent_Waylay': 'ウェイレイ',
    'agent_Sova': 'ソーヴァ',
    'agent_Breach': 'ブリーチ',
    'agent_Skye': 'スカイ',
    'agent_KAY/O': 'KAY/O',
    'agent_Fade': 'フェイド',
    'agent_Gekko': 'ゲッコー',
    'agent_Tejo': 'テホ',
    'agent_Brimstone': 'ブリムストーン',
    'agent_Omen': 'オーメン',
    'agent_Viper': 'ヴァイパー',
    'agent_Astra': 'アストラ',
    'agent_Harbor': 'ハーバー',
    'agent_Clove': 'クローヴ',
    'agent_Sage': 'セージ',
    'agent_Cypher': 'サイファー',
    'agent_Killjoy': 'キルジョイ',
    'agent_Chamber': 'チェンバー',
    'agent_Deadlock': 'デッドロック',
    'agent_Vyse': 'ヴァイス',
    // Maps
    'map_Bind': 'バインド',
    'map_Haven': 'ヘイヴン',
    'map_Split': 'スプリット',
    'map_Ascent': 'アセント',
    'map_Icebox': 'アイスボックス',
    'map_Breeze': 'ブリーズ',
    'map_Fracture': 'フラクチャー',
    'map_Pearl': 'パール',
    'map_Lotus': 'ロータス',
    'map_Sunset': 'サンセット',
    'map_Abyss': 'アビス',
    'map_Corrode': 'コロード',
    'importFilterSettings': 'フィルター設定をインポート',
    'settings': '設定',
    // Weapons
    'weapon_Vandal': 'ヴァンダル',
    'weapon_Phantom': 'ファントム',
    'weapon_Bulldog': 'ブルドッグ',
    'weapon_Guardian': 'ガーディアン',
    'weapon_Spectre': 'スペクター',
    'weapon_Stinger': 'スティンガー',
    'weapon_Judge': 'ジャッジ',
    'weapon_Bucky': 'バッキー',
    'weapon_Operator': 'オペレーター',
    'weapon_Marshal': 'マーシャル',
    'weapon_Outlaw': 'アウトロー',
    'weapon_Odin': 'オーディン',
    'weapon_Ares': 'アレス',
    'weapon_Ghost': 'ゴースト',
    'weapon_Sheriff': 'シェリフ',
    'weapon_Frenzy': 'フレンジー',
    'weapon_Classic': 'クラシック',
    'weapon_Shorty': 'ショーティー',
    'assignmentMode': '割り当てモード',
    'weaponSelection': '武器選択',
    'weaponGroupsUsed': '武器グループ使用',
    'teamMode': 'チームモード',
    'yes': 'はい',
    'no': 'いいえ',
    'weaponSelection_category': 'カテゴリ別',
    'weaponSelection_weapon': '武器別',
    'teamMode_random': 'ランダム',
    'teamMode_manual': '手動',
    'save': '保存',
    'cancel': 'キャンセル',
    'useForRandomization': 'ランダム化に使用',
    'randomizationSettings': 'ランダマイゼーション設定',
  },
  ko: {
    'title': 'VALORANT 랜덤 생성기',
    'subtitle': '경쟁전용 프로팀 및 로드아웃 랜덤 생성기',
    'deathmatch': '데스매치',
    'competitive': '경쟁전',
    'players': '플레이어',
    'enterPlayerName': '플레이어 이름 입력',
    'randomTeams': '랜덤 팀',
    'manualTeams': '수동 팀',
    'unassignedPlayers': '미할당 플레이어',
    'team1': '팀 1',
    'team2': '팀 2',
    'maps': '맵',
    'active': '활성',
    'blocked': '차단됨',
    'weapons': '무기',
    'createGroup': '그룹 생성',
    'weaponGroups': '무기 그룹',
    'createWeaponGroup': '무기 그룹 생성',
    'groupName': '그룹 이름',
    'enterGroupName': '그룹 이름 입력',
    'primaryWeapon': '주무기',
    'selectPrimaryWeapon': '주무기 선택',
    'secondaryWeapon': '보조무기',
    'selectSecondaryWeapon': '보조무기 선택',
    'create': '생성',
    'rolesAgents': '역할 & 에이전트',
    'rifles': '라이플',
    'smgs': 'SMG',
    'shotguns': '샷건',
    'snipers': '저격총',
    'lmg': 'LMG',
    'pistols': '권총',
    'weaponRandomizer': '무기 랜덤 생성기',
    'weaponTypes': '무기 종류',
    'individualWeapons': '개별 무기',
    'randomizeWeapon': '무기 랜덤',
    'availableWeapons': '사용 가능한 무기',
    'selectedWeapon': '선택된 무기',
    'randomizeAll': '전체 랜덤',
    'matchResults': '매치 결과',
    'selectedMap': '선택된 맵',
    'matchStatistics': '매치 통계',
    'teamBalance': '팀 밸런스',
    'exportFilterSettings': '필터 설정 내보내기',
    'randomizeAgain': '다시 랜덤',
    'needAtLeast2Players': '랜덤을 위해 최소 2명의 플레이어가 필요합니다',
    'results': '결과',
    'byCategory': '카테고리별',
    'byWeapon': '무기별',
    'assignByAgent': '에이전트로 할당',
    'assignByRole': '역할로 할당',
    'replication': '복제',
    'agentAssignmentDuringRandomization': '에이전트 할당은 랜덤화 시에 가능합니다.',
    'replicationMode': '복제 모드',
    'replicationModeDesc': '각 팀에 무작위 에이전트가 선택되어 팀의 모든 플레이어에게 할당됩니다.',
    'assignByRoleDesc': '각 플레이어에게 무작위 역할이 할당됩니다. 한 팀 내에서 역할이 중복되지 않습니다.',
    'assignByAgentDesc': '각 플레이어에게 무작위 에이전트가 할당됩니다. 한 팀 내에서 에이전트가 중복되지 않습니다.',
    // Roles
    'role_Duelist': '듀얼리스트',
    'role_Initiator': '이니시에이터',
    'role_Controller': '컨트롤러',
    'role_Sentinel': '센티넬',
    // Agents
    'agent_Jett': '제트',
    'agent_Phoenix': '피닉스',
    'agent_Reyna': '레이나',
    'agent_Raze': '레이즈',
    'agent_Yoru': '요루',
    'agent_Neon': '네온',
    'agent_Iso': '이소',
    'agent_Waylay': '웨일레이',
    'agent_Sova': '소바',
    'agent_Breach': '브리치',
    'agent_Skye': '스카이',
    'agent_KAY/O': 'KAY/O',
    'agent_Fade': '페이드',
    'agent_Gekko': '게코',
    'agent_Tejo': '테호',
    'agent_Brimstone': '브림스톤',
    'agent_Omen': '오멘',
    'agent_Viper': '바이퍼',
    'agent_Astra': '아스트라',
    'agent_Harbor': '하버',
    'agent_Clove': '클로브',
    'agent_Sage': '세이지',
    'agent_Cypher': '사이퍼',
    'agent_Killjoy': '킬조이',
    'agent_Chamber': '체임버',
    'agent_Deadlock': '데드락',
    'agent_Vyse': '바이스',
    // Maps
    'map_Bind': '바인드',
    'map_Haven': '헤이븐',
    'map_Split': '스플릿',
    'map_Ascent': '어센트',
    'map_Icebox': '아이스박스',
    'map_Breeze': '브리즈',
    'map_Fracture': '프랙처',
    'map_Pearl': '펄',
    'map_Lotus': '로터스',
    'map_Sunset': '선셋',
    'map_Abyss': '어비스',
    'map_Corrode': '코로드',
    'importFilterSettings': '필터 설정 가져오기',
    'settings': '설정',
    // Weapons
    'weapon_Vandal': '반달',
    'weapon_Phantom': '팬텀',
    'weapon_Bulldog': '불독',
    'weapon_Guardian': '가디언',
    'weapon_Spectre': '스펙터',
    'weapon_Stinger': '스팅어',
    'weapon_Judge': '저지',
    'weapon_Bucky': '버키',
    'weapon_Operator': '오퍼레이터',
    'weapon_Marshal': '마샬',
    'weapon_Outlaw': '아웃로',
    'weapon_Odin': '오딘',
    'weapon_Ares': '아레스',
    'weapon_Ghost': '고스트',
    'weapon_Sheriff': '셰리프',
    'weapon_Frenzy': '프렌지',
    'weapon_Classic': '클래식',
    'weapon_Shorty': '쇼티',
    'assignmentMode': '할당 모드',
    'weaponSelection': '무기 선택',
    'weaponGroupsUsed': '무기 그룹 사용',
    'teamMode': '팀 모드',
    'yes': '예',
    'no': '아니오',
    'weaponSelection_category': '카테고리별',
    'weaponSelection_weapon': '무기별',
    'teamMode_random': '랜덤',
    'teamMode_manual': '수동',
    'save': '저장',
    'cancel': '취소',
    'useForRandomization': '랜덤에 사용',
    'randomizationSettings': '무작위 설정',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  // On mount, load language from localStorage if available
  useEffect(() => {
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
    if (storedLang === 'en' || storedLang === 'ja' || storedLang === 'ko') {
      setLanguageState(storedLang);
    }
  }, []);

  // Wrap setLanguage to also persist to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}