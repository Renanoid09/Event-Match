const SelectTab = (value) => {
    for (let i = 0; i < TABS.length; i++) {
        TABS[i].style.display = "none";
        MENUS[i].classList.remove("selected");
    }
    MENUS[INDEX[value]].classList.add("selected");
    TABS[INDEX[value]].style.display = "grid";
}

const ActivateMenuButton = () => {
    for (let menu of MENUS) {
        menu.onclick = () => SelectTab(menu.getAttribute("value").toLowerCase());
    }
}

const Filter = (list, element) => {
    if (CURRENT[list].length == 1 && [...document.getElementById(element).classList].includes("selected")) return;
    document.getElementById(element).classList.toggle("selected");
    if (CURRENT[list].includes(element)) CURRENT[list].splice(CURRENT[list].indexOf(element), 1);
    else CURRENT[list].push(element);
}

SUBMITS[INDEX["player"]].onclick = () => {
    CURRENT.player = [];
    for (let playerName of PLAYER_NAMES) {
        const playerNameValue = (playerName.value == "") ? playerName.placeholder : playerName.value;
        if (CURRENT.player.includes(playerNameValue)) {
            playerName.classList.add("invalid");
            continue;
        }
        CURRENT.player.push(playerNameValue);
        playerName.classList.remove("invalid");
    }
    if (CURRENT.player.length != 10) return;
    for (let resultName of RESULT_PLAYER_NAMES) {
        const selectedPlayer = CURRENT.player.splice(Math.floor(Math.random() * CURRENT.player.length), 1);
        resultName.innerHTML = selectedPlayer;
    }
    SelectTab("map");
}

SUBMITS[INDEX["map"]].onclick = () => {
    MENUS[INDEX["map"]].classList.remove("invalid");
    const selectedMap = CURRENT.map[Math.floor(Math.random() * CURRENT.map.length)];
    RESULT_MAP.innerHTML = `${LANGUAGE[LANGUAGE.option[languageIndex]]["Map"]}: ${LANGUAGE[LANGUAGE.option[languageIndex]][selectedMap]}`;
    RESULT_MAP.value = selectedMap;
    SelectTab("gun");
}

SUBMITS[INDEX["gun"]].onclick = () => {
    MENUS[INDEX["gun"]].classList.remove("invalid");
    let availableGun = [...CURRENT.gun];
    for (let i = 0; i < 10; i++) {
        if (i == 5 || availableGun.length == 0) availableGun = [...CURRENT.gun];
        const selectedGun = availableGun.splice(Math.floor(Math.random() * availableGun.length), 1);
        RESULT_PLAYER_GUNS[i].value = selectedGun;
        RESULT_PLAYER_GUNS[i].innerHTML = `${LANGUAGE[LANGUAGE.option[languageIndex]][selectedGun]}`;
    }
    SelectTab("role");
}

SUBMITS[INDEX["role"]].onclick = () => {
    MENUS[INDEX["role"]].classList.remove("invalid");
    let availableRole = [...CURRENT.role];
    for (let i = 0; i < 10; i++) {
        if (i == 5 || availableRole.length == 0) availableRole = [...CURRENT.role];
        const selectedRole = availableRole.splice(Math.floor(Math.random() * availableRole.length), 1);
        RESULT_PLAYER_ROLES[i].value = selectedRole;
        RESULT_PLAYER_ROLES[i].innerHTML = `${LANGUAGE[LANGUAGE.option[languageIndex]][selectedRole]}`;
    }
    SelectTab("team");
}

LANGUAGE_TAB.onclick = () => {
    languageIndex = (languageIndex + 1) % LANGUAGE.option.length;
    const language = LANGUAGE.option[languageIndex];
    LANGUAGE_TAB.innerHTML = LANGUAGE.option[(languageIndex + 1) % LANGUAGE.option.length];
    for (let menu of MENUS) {
        menu.innerHTML = LANGUAGE[language][menu.getAttribute("value")];
    }
    for (let i = 0; i < PLAYER_NAMES.length; i++) {
        PLAYER_NAMES[i].placeholder = `${LANGUAGE[language]["Player"]} ${i + 1}`;
    }
    SUBMITS[INDEX["player"]].innerHTML = LANGUAGE[language]["Create Team"];
    for (let map of LISTS[INDEX["map"]].children) {
        map.innerHTML = LANGUAGE[language][map.id];
    }
    SUBMITS[INDEX["map"]].innerHTML = LANGUAGE[language]["Choose Map"];
    for (let gun of LISTS[INDEX["gun"]].children) {
        gun.innerHTML = LANGUAGE[language][gun.id];
    }
    SUBMITS[INDEX["gun"]].innerHTML = LANGUAGE[language]["Assign Guns"];
    for (let role of LISTS[INDEX["role"]].children) {
        role.innerHTML =  LANGUAGE[language][role.id];
    }
    SUBMITS[INDEX["role"]].innerHTML = LANGUAGE[language]["Assign Role"];
    RESULT_MAP.innerHTML = (CURRENT.map.length == 0 || RESULT_MAP.value == undefined) ? "" : `${LANGUAGE[language]["Map"]}: ${LANGUAGE[language][RESULT_MAP.value]}`;
    RESULT_ATTACKER.innerText = LANGUAGE[language]["Attacker"];
    RESULT_DEFENDER.innerText = LANGUAGE[language]["Defender"];
    for (let indicator of RESULT_INDICATORS) {
        for (let text of indicator.children) {
            text.innerHTML = LANGUAGE[language][text.getAttribute("value")];
        }
    }
    for (let resultGun of RESULT_PLAYER_GUNS) {
        resultGun.innerHTML = ((resultGun.value == undefined) ? "" : LANGUAGE[language][resultGun.value]);
    }
    for (let resultRole of RESULT_PLAYER_ROLES) {
        resultRole.innerHTML = ((resultRole.value == undefined) ? "" : LANGUAGE[language][resultRole.value]);
    }
    for (let resultRole of RESULT_PLAYER_ROLES) {
        resultRole.innerHTML = ((resultRole.value == undefined) ? "" : LANGUAGE[language][resultRole.value]);
    }
}

window.onload = () => {
    SelectTab("player");
    ActivateMenuButton();
    CreatePlayerOption();
    CreateMapOption();
    CreateGunOption();
    CreateRoleOption();
    CreateResult();
}