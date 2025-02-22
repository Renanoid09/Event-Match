const TABS = document.getElementsByClassName("tab");
const MENU = document.getElementsByClassName("menu-item");

const LIST = {
    maps: ["Bind", "Haven", "Split", "Ascent", "Icebox", "Breeze", "Fracture", "Pearl", "Lotus", "Sunset", "Abyss"],
    guns: ["SMG / Sheriff", "Shotgun / Ghost", "Rifle / classic", "Sniper / Frenzy", "Machinegun / Shorty"],
    roles: ["Controller", "Initiator", "Sentinel", "Duelist", "Flex"],
    player: [], map: [], gun: [], role: []
}

const SelectTab = (tab) => {
    for (let i = 0; i < TABS.length; i++) {
        TABS[i].style.display = (i == tab) ? "grid" : "none";
        if (TABS[i].style.display == "none") MENU[i].classList.remove("selected");
        else MENU[i].classList.add("selected");
    }
}

const CreatePlayerOption = () => {
    for (let i = 0; i < 10; i++) {
        let playerName = document.createElement("input");
        playerName.classList.add("player-name");
        document.getElementById("player-list").appendChild(playerName);
    }
}

const SubmitPlayerName = () => {
    LIST.player = [];
    const PLAYER_NAMES = document.getElementsByClassName("player-name");
    for (let playerName of PLAYER_NAMES) {
        if (playerName.value == "" || LIST.player.includes(playerName.value)) {
            playerName.classList.add("invalid");
            continue;
        }   
        playerName.classList.remove("invalid");
        LIST.player.push(playerName.value);
    }
    if (LIST.player.length == 10) {
        SelectTeam();
        SelectTab(1);
        return true;
    }
    SelectTab(0);
    return false;
}

const CreateMapOption = () => {
    const MAP_LIST = document.getElementById("map-list");
    for (let [index, map] of LIST.maps.entries()) {
        const mapDiv = document.createElement("div");
        mapDiv.classList.add("map");
        mapDiv.classList.add("selected");
        mapDiv.innerHTML = map;
        mapDiv.value = map;
        mapDiv.onclick = () => FilterMap(index);
        MAP_LIST.appendChild(mapDiv);
    }
}

const FilterMap = (index) => {
    const selectedDiv = document.getElementsByClassName("map")[index];
    if ([...selectedDiv.classList].includes("selected")) selectedDiv.classList.remove("selected");
    else selectedDiv.classList.add("selected");
}

const SubmitMap = () => {
    LIST.map = [];
    for (let map of document.getElementsByClassName("map")) {
        map.classList.remove("invalid");
        if ([...map.classList].includes("selected")) LIST.map.push(map.value);
    }
    if (LIST.map.length == 0) {
        for (let map of document.getElementsByClassName("map")) {
            map.classList.add("invalid");
        }
        SelectTab(1);
        return false;
    }
    SelectTab(2);
    SelectMap();
    return true;
}

const CreateGunOption = () => {
    const GUN_LIST = document.getElementById("gun-list");
    for (let [index, gun] of LIST.guns.entries()) {
        const gunDiv = document.createElement("div");
        gunDiv.classList.add("gun");
        gunDiv.classList.add("selected");
        gunDiv.innerHTML = gun;
        gunDiv.value = gun;
        gunDiv.onclick = () => FilterGun(index);
        GUN_LIST.appendChild(gunDiv);
    }
}

const FilterGun = (index) => {
    const selectedDiv = document.getElementsByClassName("gun")[index];
    if ([...selectedDiv.classList].includes("selected")) selectedDiv.classList.remove("selected");
    else selectedDiv.classList.add("selected");
}

const SubmitGun = () => {
    LIST.gun = [];
    for (let gun of document.getElementsByClassName("gun")) {
        gun.classList.remove("invalid");
        if ([...gun.classList].includes("selected")) LIST.gun.push(gun.value);
    }
    if (LIST.gun.length == 0) {
        for (let gun of document.getElementsByClassName("gun")) {
            gun.classList.add("invalid");
        }
        SelectTab(2);
        return false;
    }
    SelectGun();
    SelectTab(3);
    return true;
}

const CreateRoleOption = () => {
    const ROLE_LIST = document.getElementById("role-list");
    for (let [index, role] of LIST.roles.entries()) {
        const roleDiv = document.createElement("div");
        roleDiv.classList.add("role");
        roleDiv.classList.add("selected");
        roleDiv.innerHTML = role;
        roleDiv.value = role;
        roleDiv.onclick = () => FilterRole(index);
        ROLE_LIST.appendChild(roleDiv);
    }
}

const FilterRole = (index) => {
    const selectedDiv = document.getElementsByClassName("role")[index];
    if ([...selectedDiv.classList].includes("selected")) selectedDiv.classList.remove("selected");
    else selectedDiv.classList.add("selected");
}

const SubmitRole = () => {
    LIST.role = [];
    for (let role of document.getElementsByClassName("role")) {
        role.classList.remove("invalid");
        if ([...role.classList].includes("selected")) LIST.role.push(role.value);
    }
    if (LIST.role.length == 0) {
        for (let role of document.getElementsByClassName("role")) {
            role.classList.add("invalid");
        }
        return false;
    }
    SelectRole();
    if (SubmitPlayerName() && SubmitMap() && SubmitGun()) SelectTab(4);
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

const SelectTeam = () => {
    let currentPlayer = [...LIST.player];
    for (let result of document.getElementsByClassName("result-player-name")) {
        const selectedPlayer = currentPlayer[Math.floor(Math.random() * currentPlayer.length)];
        currentPlayer.splice(currentPlayer.indexOf(selectedPlayer), 1);
        result.innerHTML = selectedPlayer;
    }
}

const SelectMap = () => {
    document.getElementById("map-result").innerHTML = `Map: ${LIST.map[Math.floor(Math.random() * LIST.map.length)]}`;
}

const SelectGun = () => {
    let currentGun = [...LIST.gun];
    for (let result of document.getElementsByClassName("result-player-gun")) {
        if (currentGun.length == 0) currentGun = [...LIST.gun];
        const selectedGun = currentGun[Math.floor(Math.random() * currentGun.length)];
        currentGun.splice(currentGun.indexOf(selectedGun), 1);
        result.innerHTML = selectedGun;
    }
}

const SelectRole = () => {
    let currentRole = [...LIST.role];
    for (let result of document.getElementsByClassName("result-player-role")) {
        if (currentRole.length == 0) currentRole = [...LIST.role];
        const selectedRole = currentRole[Math.floor(Math.random() * currentRole.length)];
        currentRole.splice(currentRole.indexOf(selectedRole), 1);
        result.innerHTML = selectedRole;
    }
}

window.onload = () => {
    CreatePlayerOption();
    CreateMapOption();
    CreateGunOption();
    CreateRoleOption();
    CreateResult();
    SelectTab(0);
}