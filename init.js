const MENUS = document.getElementsByClassName("menu-item");
const TABS = document.getElementsByClassName("tab");
const LANGUAGE_TAB = document.getElementsByClassName("extra-menu")[0];
const LISTS = document.getElementsByClassName("list");
const SUBMITS = document.getElementsByClassName("submit");

const PLAYER_NAMES = document.getElementsByClassName("player-name");
const MAP_LIST = document.getElementById("map-list");
const GUN_LIST = document.getElementById("gun-list");
const ROLE_LIST = document.getElementById("role-list");

const RESULT_MAP = document.getElementById("map-result");
const RESULT_ATTACKER = document.getElementsByClassName("result-text")[0];
const RESULT_DEFENDER =  document.getElementsByClassName("result-text")[1];
const RESULT_INDICATORS = document.getElementsByClassName("indicator");
const RESULT_PLAYER_NAMES = document.getElementsByClassName("result-player-name");
const RESULT_PLAYER_GUNS = document.getElementsByClassName("result-player-gun");
const RESULT_PLAYER_ROLES = document.getElementsByClassName("result-player-role");

const INDEX = {"player": 0, "map": 1, "gun": 2, "role": 3, "team": 4};

const OPTIONS = {
    maps: ["Bind", "Haven", "Split", "Ascent", "Icebox", "Breeze", "Fracture", "Pearl", "Lotus", "Sunset", "Abyss"],
    guns: ["SMG / Sheriff", "Shotgun / Ghost", "Rifle / classic", "Sniper / Frenzy", "Machinegun / Shorty", "Flex"],
    roles: ["Controller", "Initiator", "Sentinel", "Duelist", "Flex"]
};

const CURRENT = {
    player: [], 
    map: [...OPTIONS.maps], 
    gun: [...OPTIONS.guns], 
    role: [...OPTIONS.roles]
};

const LANGUAGE = {
    option: ["English", "日本語"],
    "English": {
        "Player": "Player",
        "Map": "Map",
        "Gun": "Gun",
        "Role": "Role",
        "Team": "Team",
        "Create Team": "Create Team",
        "Bind": "Bind", 
        "Haven": "Haven", 
        "Split": "Split", 
        "Ascent": "Ascent", 
        "Icebox": "Icebox", 
        "Breeze": "Breeze", 
        "Fracture": "Fracture", 
        "Pearl": "Pearl", 
        "Lotus": "Lotus", 
        "Sunset": "Sunset", 
        "Abyss": "Abyss",
        "Choose Map": "Choose Map",
        "SMG / Sheriff": "SMG / Sheriff", 
        "Shotgun / Ghost": "Shotgun / Ghost", 
        "Rifle / classic": "Rifle / classic", 
        "Sniper / Frenzy": "Sniper / Frenzy", 
        "Machinegun / Shorty": "Machinegun / Shorty",
        "Assign Guns": "Assign Guns",
        "Controller": "Controller", 
        "Initiator": "Initiator", 
        "Sentinel": "Sentinel", 
        "Duelist": "Duelist", 
        "Flex": "Flex",
        "Assign Role": "Assign Role",
        "Attacker": "Attacker",
        "Defender": "Defender"
    },
    "日本語": {
        "Player": "プレイヤー",
        "Map": "マップ",
        "Gun": "武器",
        "Role": "ロール",
        "Team": "チーム",
        "Create Team": "チームを構成",
        "Bind": "バインド", 
        "Haven": "ヘイブン", 
        "Split": "スプリット", 
        "Ascent": "アッセント", 
        "Icebox": "アイスボックス", 
        "Breeze": "ブリーズ", 
        "Fracture": "フラクチャー", 
        "Pearl": "パール", 
        "Lotus": "ロータス", 
        "Sunset": "サンセット", 
        "Abyss": "アビス",
        "Choose Map": "マップを選択",
        "SMG / Sheriff": "サブマシンガン / シェリフ", 
        "Shotgun / Ghost": "ショットガン / ゴースト", 
        "Rifle / classic": "ライフル / クラシック", 
        "Sniper / Frenzy": "スナイパー / フレンジー", 
        "Machinegun / Shorty": "マシンガン / ショーティー",
        "Assign Guns": "武器を配布",
        "Controller": "コントローラー", 
        "Initiator": "イニシエータ", 
        "Sentinel": "センチネル", 
        "Duelist": "デュエリスト", 
        "Flex": "自由",
        "Assign Role": "ロールを配る",
        "Attacker": "アタッカー",
        "Defender": "ディフェンダー"
    }
};

let languageIndex = 0;

const CreatePlayerOption = () => {
    for (let i = 0; i < 10; i++) {
        let playerName = document.createElement("input");
        playerName.classList.add("player-name");
        playerName.id = `Player ${i + 1}`;
        playerName.name = `Player ${i + 1}`;
        playerName.placeholder = `Player ${i + 1}`;
        LISTS[INDEX["player"]].appendChild(playerName);
    }
}

const CreateMapOption = () => {
    for (let map of OPTIONS.maps) {
        const mapDiv = document.createElement("div");
        mapDiv.classList.add("map");
        mapDiv.classList.add("selected");
        mapDiv.innerHTML = map;
        mapDiv.id = map;
        mapDiv.onclick = () => Filter("map", map);
        LISTS[INDEX["map"]].appendChild(mapDiv);
    }
}

const CreateGunOption = () => {
    for (let gun of OPTIONS.guns) {
        const gunDiv = document.createElement("div");
        gunDiv.classList.add("gun");
        gunDiv.classList.add("selected");
        gunDiv.innerHTML = gun;
        gunDiv.value = gun;
        gunDiv.id = gun;
        gunDiv.onclick = () => Filter("gun", gun);
        LISTS[INDEX["gun"]].appendChild(gunDiv);
    }
}

const CreateRoleOption = () => {
    for (let role of OPTIONS.roles) {
        const roleDiv = document.createElement("div");
        roleDiv.classList.add("role");
        roleDiv.classList.add("selected");
        roleDiv.innerHTML = role;
        roleDiv.value = role;
        roleDiv.id = role;
        roleDiv.onclick = () => Filter("role", role);
        LISTS[INDEX["role"]].appendChild(roleDiv);
    }
}

const CreateResult = () => {
    for (let result of document.getElementsByClassName("result")) {
        for (let i = 0; i < 5; i++) {
            const resultDiv = document.createElement("div");
            resultDiv.classList.add("result-player");
            const playerName = document.createElement("div");
            playerName.classList.add("result-player-name");
            resultDiv.appendChild(playerName);
            const gun = document.createElement("div");
            gun.classList.add("result-player-gun");
            resultDiv.appendChild(gun);
            const role = document.createElement("div");
            role.classList.add("result-player-role");
            resultDiv.appendChild(role);
            result.appendChild(resultDiv);
        }
    }
}