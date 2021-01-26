// ZeffUI globals
/* global abilityList, jobList, regexList, language */

// External Globals
/* global addOverlayListener, startOverlayEvents, interact */

// UI related global variables
var locked = true;
var gridshown = false;
var dragPosition = {};

// Global variables for maintaining gamestate and settings
var inCombat = false;
var blockRuinGained = false;
var currentSettings = null;
var currentPlayer = null;
var currentPartyList = [];
var currentStats = {
	skillSpeed: 0,
	spellSpeed: 0,
	stacks: 0,
	maxStacks: 0
};

// Global variables for maintaining active timers and elements that get reused
var activeDotBars = new Map();
var activeBuffBars = new Map();
var activeRaidBuffs = new Map();
var activeMitigations = new Map();
var activePartyCooldowns = new Map();
var activeCustomCooldowns = new Map();
var activeCountdowns = new Map();
var activeTTS = new Map();
var ttsElements = new Map();

const UPDATE_INTERVAL = 10;

// Add OverlayListeners
addOverlayListener("onPlayerChangedEvent", (e) => onPlayerChangedEvent(e));
addOverlayListener("onLogEvent", (e) => onLogEvent(e));
addOverlayListener("onPartyWipe", (e) => onPartyWipe(e));
addOverlayListener("onInCombatChangedEvent", (e) => onInCombatChangedEvent(e));
addOverlayListener("onZoneChangedEvent", (e) => onChangeZone(e));
addOverlayListener("PartyChanged", (e) => onPartyChanged(e));

$(function() {
	startZeffUI();
	toggleHideOutOfCombatElements();
});

function startZeffUI(){
	loadSettings();
	generateJobStacks();
	startOverlayEvents();
	console.log("ZeffUI fully loaded.");
}

// Settings
function checkAndInitializeSetting(settingsObject, setting, defaultValue) {
	// Thanks MikeMatrix
	if(settingsObject[setting] === undefined) settingsObject[setting] = defaultValue;
}

function loadSettings(){
	let settings = {};

	if(localStorage.getItem("settings") !== null){
		settings = JSON.parse(localStorage.getItem("settings"));
	}

	// OVERRIDE SETTINGS
	checkAndInitializeSetting(settings, "override", {});
	checkAndInitializeSetting(settings.override, "enabled", false);
	checkAndInitializeSetting(settings.override, "abilities", []);

	// SKIN SETTINGS
	checkAndInitializeSetting(settings, "skin", "default");

	// FONT SETTINGS
	checkAndInitializeSetting(settings, "font", "Arial");
	$("*").css("--defaultFont", `${settings.font}`);

	if($("#skin").length == 0){
		$("head").append(`<link id="skin" rel="stylesheet" href="skins/${settings.skin}/styles/resources.css">`);
	}else{
		$("#skin").attr("href", `skins/${settings.skin}/styles/resources.css`);
	}

	// DEBUG SETTINGS
	checkAndInitializeSetting(settings, "debug", {});
	checkAndInitializeSetting(settings.debug, "enabled", false);

	// GLOBAL SETTINGS
	checkAndInitializeSetting(settings, "partyorder",
		[
		// Tanks
			"PLD", "GLA", "WAR", "MRD", "DRK", "GNB",
			// Healers
			"WHM", "CNJ", "SCH", "AST",
			// Melee DPS
			"MNK", "PGL", "DRG", "LNC", "NIN", "ROG", "SAM",
			// Physical Ranged DPS
			"BRD", "ARC", "MCH", "DNC",
			// Caster DPS
			"BLM", "THM", "SMN", "ACN", "RDM", "BLU"]
	);

	// LANGUAGE SETTINGS
	checkAndInitializeSetting(settings, "language", "en");

	if($("#language").length == 0){
		$.getScript(`data/language/${settings.language}.js`, function() {
			loadContextMenu();
		});
	}else{
		$("#language").attr("src", `data/language/${settings.language}.js`);
	}

	// HEALTHBAR SETTINGS
	checkAndInitializeSetting(settings, "healthbar", {});
	checkAndInitializeSetting(settings.healthbar, "enabled", true);
	checkAndInitializeSetting(settings.healthbar, "hideoutofcombat", false);
	checkAndInitializeSetting(settings.healthbar, "textenabled", true);
	checkAndInitializeSetting(settings.healthbar, "color", "--filter-dark-green");
	checkAndInitializeSetting(settings.healthbar, "scale", 1);
	checkAndInitializeSetting(settings.healthbar, "rotation", 0);
	checkAndInitializeSetting(settings.healthbar, "x", 30);
	checkAndInitializeSetting(settings.healthbar, "y", 216);
	checkAndInitializeSetting(settings.healthbar, "font", "Arial");

	settings.healthbar.enabled ? $("#health-bar").show() : $("#health-bar").hide();

	$("#health-bar").css("--healthBarColor", `var(${settings.healthbar.color})`);
	$("#health-bar").css("width", settings.healthbar.scale * 154);
	$("#health-bar").css("height", settings.healthbar.scale * 15);
	$("#health-bar").css("left", settings.healthbar.x);
	$("#health-bar").css("top", settings.healthbar.y);
	$("#health-bar").css("--healthFont", settings.healthbar.font);
	$("#health-bar").css("-webkit-transform", `rotate(${settings.healthbar.rotation}deg)`);
	$("#health-bar").css("transform-origin", "top left");

	// MANABAR SETTINGS
	checkAndInitializeSetting(settings, "manabar", {});
	checkAndInitializeSetting(settings.manabar, "enabled", true);
	checkAndInitializeSetting(settings.manabar, "hideoutofcombat", false);
	checkAndInitializeSetting(settings.manabar, "textenabled", true);
	checkAndInitializeSetting(settings.manabar, "color", "--filter-light-pink");
	checkAndInitializeSetting(settings.manabar, "scale", 1);
	checkAndInitializeSetting(settings.manabar, "rotation", 0);
	checkAndInitializeSetting(settings.manabar, "x", 30);
	checkAndInitializeSetting(settings.manabar, "y", 232);
	checkAndInitializeSetting(settings.manabar, "font", "Arial");

	settings.manabar.enabled ? $("#mana-bar").show() : $("#mana-bar").hide();

	$("#mana-bar").css("--manaBarColor", `var(${settings.manabar.color})`);
	$("#mana-bar").css("width", settings.manabar.scale * 154);
	$("#mana-bar").css("height", settings.manabar.scale * 15);
	$("#mana-bar").css("left", settings.manabar.x);
	$("#mana-bar").css("top", settings.manabar.y);
	$("#mana-bar").css("--manaFont", settings.manabar.font);
	$("#mana-bar").css("-webkit-transform", `rotate(${settings.manabar.rotation}deg)`);
	$("#mana-bar").css("transform-origin", "top left");

	// PULLTIMER SETTINGS
	checkAndInitializeSetting(settings, "timerbar", {});
	checkAndInitializeSetting(settings.timerbar, "enabled", true);
	checkAndInitializeSetting(settings.timerbar, "textenabled", true);
	checkAndInitializeSetting(settings.timerbar, "color", "--filter-dark-red");
	checkAndInitializeSetting(settings.timerbar, "scale", 1);
	checkAndInitializeSetting(settings.timerbar, "rotation", 0);
	checkAndInitializeSetting(settings.timerbar, "x", 30);
	checkAndInitializeSetting(settings.timerbar, "y", 200);
	checkAndInitializeSetting(settings.timerbar, "font", "Arial");

	$("#timer-bar").css("--pulltimerBarColor", `var(${settings.timerbar.color})`);
	$("#timer-bar").css("width", settings.timerbar.scale * 154);
	$("#timer-bar").css("height", settings.timerbar.scale * 15);
	$("#timer-bar").css("left", settings.timerbar.x);
	$("#timer-bar").css("top", settings.timerbar.y);
	$("#timer-bar").css("--timerFont", settings.timerbar.font);
	$("#timer-bar").css("-webkit-transform", `rotate(${settings.timerbar.rotation}deg)`);
	$("#timer-bar").css("transform-origin", "top left");

	// DOT TIMER SETTINGS
	checkAndInitializeSetting(settings, "dottimerbar", {});
	checkAndInitializeSetting(settings.dottimerbar, "enabled", true);
	checkAndInitializeSetting(settings.dottimerbar, "hideoutofcombat", false);
	checkAndInitializeSetting(settings.dottimerbar, "hidewhendroppedoff", false);
	checkAndInitializeSetting(settings.dottimerbar, "textenabled", true);
	checkAndInitializeSetting(settings.dottimerbar, "imageenabled", true);
	checkAndInitializeSetting(settings.dottimerbar, "ttsenabled", false);
	checkAndInitializeSetting(settings.dottimerbar, "multidotenabled", true);
	checkAndInitializeSetting(settings.dottimerbar, "growdirection", 1);
	checkAndInitializeSetting(settings.dottimerbar, "padding", 20);
	checkAndInitializeSetting(settings.dottimerbar, "scale", 1);
	checkAndInitializeSetting(settings.dottimerbar, "rotation", 0);
	checkAndInitializeSetting(settings.dottimerbar, "x", 30);
	checkAndInitializeSetting(settings.dottimerbar, "y", 50);
	checkAndInitializeSetting(settings.dottimerbar, "font", "Arial");

	$("#dot-timer-bar").css("width", settings.dottimerbar.scale * 154);
	$("#dot-timer-bar").css("height", settings.dottimerbar.scale * 15);
	$("#dot-timer-bar").css("left", settings.dottimerbar.x);
	$("#dot-timer-bar").css("top", settings.dottimerbar.y);
	$("#dot-timer-bar").css("--dotFont", settings.dottimerbar.font);
	$("#dot-bar").css("-webkit-transform", `rotate(${settings.dottimerbar.rotation}deg)`);
	$("#dot-bar").css("transform-origin", "center");

	// BUFF TIMER SETTINGS
	checkAndInitializeSetting(settings, "bufftimerbar", {});
	checkAndInitializeSetting(settings.bufftimerbar, "enabled", true);
	checkAndInitializeSetting(settings.bufftimerbar, "hideoutofcombat", false);
	checkAndInitializeSetting(settings.bufftimerbar, "hidewhendroppedoff", false);
	checkAndInitializeSetting(settings.bufftimerbar, "textenabled", true);
	checkAndInitializeSetting(settings.bufftimerbar, "imageenabled", true);
	checkAndInitializeSetting(settings.bufftimerbar, "ttsenabled", false);
	checkAndInitializeSetting(settings.bufftimerbar, "growdirection", 1);
	checkAndInitializeSetting(settings.bufftimerbar, "padding", 20);
	checkAndInitializeSetting(settings.bufftimerbar, "scale", 1);
	checkAndInitializeSetting(settings.bufftimerbar, "rotation", 0);
	checkAndInitializeSetting(settings.bufftimerbar, "x", 30);
	checkAndInitializeSetting(settings.bufftimerbar, "y", 100);
	checkAndInitializeSetting(settings.bufftimerbar, "font", "Arial");

	$("#buff-timer-bar").css("width", settings.bufftimerbar.scale * 154);
	$("#buff-timer-bar").css("height", settings.bufftimerbar.scale * 15);
	$("#buff-timer-bar").css("left", settings.bufftimerbar.x);
	$("#buff-timer-bar").css("top", settings.bufftimerbar.y);
	$("#buff-timer-bar").css("--buffFont", settings.bufftimerbar.font);
	$("#buff-bar").css("-webkit-transform", `rotate(${settings.bufftimerbar.rotation}deg)`);
	$("#buff-bar").css("transform-origin", "center");

	// STACKBAR SETTINGS
	checkAndInitializeSetting(settings, "stacksbar", {});
	checkAndInitializeSetting(settings.stacksbar, "enabled", true);
	checkAndInitializeSetting(settings.stacksbar, "hideoutofcombat", false);
	checkAndInitializeSetting(settings.stacksbar, "color", "--filter-bright-red");
	checkAndInitializeSetting(settings.stacksbar, "scale", 1);
	checkAndInitializeSetting(settings.stacksbar, "x", 30);
	checkAndInitializeSetting(settings.stacksbar, "y", 170);

	settings.stacksbar.enabled ? $("#stacks-bar").show() : $("#stacks-bar").hide();

	$("#stacks-bar").attr("width", settings.stacksbar.scale * (4 * 25));
	$("#stacks-bar").attr("height", settings.stacksbar.scale * 21);
	$("#stacks-bar").css("left", settings.stacksbar.x);
	$("#stacks-bar").css("top", settings.stacksbar.y);
	$("#stacks-bar").css("transform", `scale(${settings.stacksbar.scale})`);
	$("[id^=stacks-background]").css("margin-left", 0 - (settings.stacksbar.scale * 4));
	$("#stacks-bar").css("--stacksColor", `var(${settings.stacksbar.color})`);

	// RAIDBUFF SETTINGS
	checkAndInitializeSetting(settings, "raidbuffs", {});
	checkAndInitializeSetting(settings.raidbuffs, "enabled", true);
	checkAndInitializeSetting(settings.raidbuffs, "ttsenabled", false);
	checkAndInitializeSetting(settings.raidbuffs, "alwaysshow", true);
	checkAndInitializeSetting(settings.raidbuffs, "hideoutofcombat", false);
	checkAndInitializeSetting(settings.raidbuffs, "hidewhensolo", false);
	checkAndInitializeSetting(settings.raidbuffs, "orderbypartymember", true);
	checkAndInitializeSetting(settings.raidbuffs, "growleft", false);
	checkAndInitializeSetting(settings.raidbuffs, "padding", 0);
	checkAndInitializeSetting(settings.raidbuffs, "scale", 1);
	checkAndInitializeSetting(settings.raidbuffs, "columns", 8);
	checkAndInitializeSetting(settings.raidbuffs, "x", 30);
	checkAndInitializeSetting(settings.raidbuffs, "y", 240);
	checkAndInitializeSetting(settings.raidbuffs, "font", "Arial");
	checkAndInitializeSetting(settings.raidbuffs, "durationoutline", true);
	checkAndInitializeSetting(settings.raidbuffs, "cooldownoutline", true);
	checkAndInitializeSetting(settings.raidbuffs, "durationbold", true);
	checkAndInitializeSetting(settings.raidbuffs, "cooldownbold", true);
	checkAndInitializeSetting(settings.raidbuffs, "durationcolor", "#FFA500");
	checkAndInitializeSetting(settings.raidbuffs, "cooldowncolor", "#FFFFFF");
	checkAndInitializeSetting(settings.raidbuffs, "durationoutlinecolor", "#000000");
	checkAndInitializeSetting(settings.raidbuffs, "cooldownoutlinecolor", "#000000");

	settings.raidbuffs.enabled ? $("#raid-buffs-bar").show() : $("#raid-buffs-bar").hide();
	settings.raidbuffs.hidewhensolo ? $("#raid-buffs-bar").hide() : $("#raid-buffs-bar").show();

	$("#raid-buffs-bar").css(settings.raidbuffs.growleft ? "right" : "left", settings.raidbuffs.x);
	$("#raid-buffs-bar").css("top", settings.raidbuffs.y);
	$("#raid-buffs-bar").css("font-family", settings.raidbuffs.font);

	// MITIGATION SETTINGS
	checkAndInitializeSetting(settings, "mitigation", {});
	checkAndInitializeSetting(settings.mitigation, "enabled", true);
	checkAndInitializeSetting(settings.mitigation, "ttsenabled", false);
	checkAndInitializeSetting(settings.mitigation, "alwaysshow", true);
	checkAndInitializeSetting(settings.mitigation, "hideoutofcombat", false);
	checkAndInitializeSetting(settings.mitigation, "hidewhensolo", false);
	checkAndInitializeSetting(settings.mitigation, "growleft", false);
	checkAndInitializeSetting(settings.mitigation, "padding", 0);
	checkAndInitializeSetting(settings.mitigation, "scale", 1);
	checkAndInitializeSetting(settings.mitigation, "columns", 8);
	checkAndInitializeSetting(settings.mitigation, "x", 30);
	checkAndInitializeSetting(settings.mitigation, "y", 280);
	checkAndInitializeSetting(settings.mitigation, "font", "Arial");
	checkAndInitializeSetting(settings.mitigation, "durationoutline", true);
	checkAndInitializeSetting(settings.mitigation, "cooldownoutline", true);
	checkAndInitializeSetting(settings.mitigation, "durationbold", true);
	checkAndInitializeSetting(settings.mitigation, "cooldownbold", true);
	checkAndInitializeSetting(settings.mitigation, "durationcolor", "#FFA500");
	checkAndInitializeSetting(settings.mitigation, "cooldowncolor", "#FFFFFF");
	checkAndInitializeSetting(settings.mitigation, "durationoutlinecolor", "#000000");
	checkAndInitializeSetting(settings.mitigation, "cooldownoutlinecolor", "#000000");

	settings.mitigation.enabled ? $("#mitigation-bar").show() : $("#mitigation-bar").hide();
	settings.mitigation.hidewhensolo ? $("#mitigation-bar").hide() : $("#mitigation-bar").show();

	$("#mitigation-bar").css(settings.mitigation.growleft ? "right" : "left", settings.mitigation.x);
	$("#mitigation-bar").css("top", settings.mitigation.y);
	$("#mitigation-bar").css("font-family", settings.mitigation.font);

	// PARTY COOLDOWN SETTINGS
	checkAndInitializeSetting(settings, "party", {});
	checkAndInitializeSetting(settings.party, "enabled", true);
	checkAndInitializeSetting(settings.party, "ttsenabled", false);
	checkAndInitializeSetting(settings.party, "alwaysshow", true);
	checkAndInitializeSetting(settings.party, "hideoutofcombat", false);
	checkAndInitializeSetting(settings.party, "hidewhensolo", false);
	checkAndInitializeSetting(settings.party, "growleft", false);
	checkAndInitializeSetting(settings.party, "padding", 0);
	checkAndInitializeSetting(settings.party, "scale", 0.8);
	checkAndInitializeSetting(settings.party, "x", 30);
	checkAndInitializeSetting(settings.party, "y", 320);
	checkAndInitializeSetting(settings.party, "font", "Arial");
	checkAndInitializeSetting(settings.party, "durationoutline", true);
	checkAndInitializeSetting(settings.party, "cooldownoutline", true);
	checkAndInitializeSetting(settings.party, "durationbold", true);
	checkAndInitializeSetting(settings.party, "cooldownbold", true);
	checkAndInitializeSetting(settings.party, "durationcolor", "#FFA500");
	checkAndInitializeSetting(settings.party, "cooldowncolor", "#FFFFFF");
	checkAndInitializeSetting(settings.party, "durationoutlinecolor", "#000000");
	checkAndInitializeSetting(settings.party, "cooldownoutlinecolor", "#000000");

	settings.party.enabled ? $("#party-bar").show() : $("#party-bar").hide();
	settings.party.hidewhensolo ? $("#party-bar").hide() : $("#party-bar").show();

	$("#party-bar").css(settings.party.growleft ? "right" : "left", settings.party.x);
	$("#party-bar").css("top", settings.party.y);
	$("#party-bar").css("font-family", settings.party.font);

	// CUSTOM COOLDOWN SETTINGS
	checkAndInitializeSetting(settings, "customcd", {});
	checkAndInitializeSetting(settings.customcd, "abilities", []);
	checkAndInitializeSetting(settings.customcd, "enabled", true);
	checkAndInitializeSetting(settings.customcd, "ttsenabled", false);
	checkAndInitializeSetting(settings.customcd, "alwaysshow", true);
	checkAndInitializeSetting(settings.customcd, "hideoutofcombat", false);
	checkAndInitializeSetting(settings.customcd, "hidewhensolo", false);
	checkAndInitializeSetting(settings.customcd, "growleft", false);
	checkAndInitializeSetting(settings.customcd, "padding", 0);
	checkAndInitializeSetting(settings.customcd, "scale", 1);
	checkAndInitializeSetting(settings.customcd, "columns", 8);
	checkAndInitializeSetting(settings.customcd, "x", 30);
	checkAndInitializeSetting(settings.customcd, "y", 320);
	checkAndInitializeSetting(settings.customcd, "font", "Arial");
	checkAndInitializeSetting(settings.customcd, "durationoutline", true);
	checkAndInitializeSetting(settings.customcd, "cooldownoutline", true);
	checkAndInitializeSetting(settings.customcd, "durationbold", true);
	checkAndInitializeSetting(settings.customcd, "cooldownbold", true);
	checkAndInitializeSetting(settings.customcd, "durationcolor", "#FFA500");
	checkAndInitializeSetting(settings.customcd, "cooldowncolor", "#FFFFFF");
	checkAndInitializeSetting(settings.customcd, "durationoutlinecolor", "#000000");
	checkAndInitializeSetting(settings.customcd, "cooldownoutlinecolor", "#000000");

	settings.customcd.enabled ? $("#customcd-bar").show() : $("#customcd-bar").hide();
	settings.customcd.hidewhensolo ? $("#customcd-bar").hide() : $("#customcd-bar").show();

	$("#customcd-bar").css(settings.customcd.growleft ? "right" : "left", settings.customcd.x);
	$("#customcd-bar").css("top", settings.customcd.y);
	$("#customcd-bar").css("font-family", settings.customcd.font);

	currentSettings = settings;
	saveSettings();
}

function saveSettings(){
	currentSettings.healthbar.x = parseInt($("#health-bar").css("left").replace("px", ""));
	currentSettings.healthbar.y = parseInt($("#health-bar").css("top").replace("px", ""));
	$("#health-bar").css("--healthFontSize", currentSettings.healthbar.scale * 10);
	$("#health-bar").css("--healthFontX", currentSettings.healthbar.scale * 5);
	$("#health-bar").css("--healthFontY", currentSettings.healthbar.scale * -14);

	currentSettings.manabar.x = parseInt($("#mana-bar").css("left").replace("px", ""));
	currentSettings.manabar.y = parseInt($("#mana-bar").css("top").replace("px", ""));
	$("#mana-bar").css("--manaFontSize", currentSettings.manabar.scale * 10);
	$("#mana-bar").css("--manaFontX", currentSettings.manabar.scale * 5);
	$("#mana-bar").css("--manaFontY", currentSettings.manabar.scale * -14);

	currentSettings.timerbar.x = parseInt($("#timer-bar").css("left").replace("px", ""));
	currentSettings.timerbar.y = parseInt($("#timer-bar").css("top").replace("px", ""));
	$("#timer-bar").css("--timerFontSize", currentSettings.timerbar.scale * 10);
	$("#timer-bar").css("--timerFontX", currentSettings.timerbar.scale * 5);
	$("#timer-bar").css("--timerFontY", currentSettings.timerbar.scale * -14);

	currentSettings.dottimerbar.x = parseInt($("#dot-timer-bar").css("left").replace("px", ""));
	currentSettings.dottimerbar.y = parseInt($("#dot-timer-bar").css("top").replace("px", ""));
	$("#dot-timer-bar").css("--dotFontSize", currentSettings.dottimerbar.scale * 10);
	$("#dot-timer-bar").css("--dotFontX", currentSettings.dottimerbar.scale * 5);
	$("#dot-timer-bar").css("--dotFontY", currentSettings.dottimerbar.scale * -14);

	currentSettings.bufftimerbar.x = parseInt($("#buff-timer-bar").css("left").replace("px", ""));
	currentSettings.bufftimerbar.y = parseInt($("#buff-timer-bar").css("top").replace("px", ""));
	$("#buff-timer-bar").css("--buffFontSize", currentSettings.bufftimerbar.scale * 10);
	$("#buff-timer-bar").css("--buffFontX", currentSettings.bufftimerbar.scale * 5);
	$("#buff-timer-bar").css("--buffFontY", currentSettings.bufftimerbar.scale * -14);

	currentSettings.stacksbar.x = parseInt($("#stacks-bar").css("left").replace("px", ""));
	currentSettings.stacksbar.y = parseInt($("#stacks-bar").css("top").replace("px", ""));

	currentSettings.raidbuffs.x = parseInt($("#raid-buffs-bar").css("left").replace("px", ""));
	currentSettings.raidbuffs.y = parseInt($("#raid-buffs-bar").css("top").replace("px", ""));

	currentSettings.mitigation.x = parseInt($("#mitigation-bar").css("left").replace("px", ""));
	currentSettings.mitigation.y = parseInt($("#mitigation-bar").css("top").replace("px", ""));

	currentSettings.customcd.x = parseInt($("#customcd-bar").css("left").replace("px", ""));
	currentSettings.customcd.y = parseInt($("#customcd-bar").css("top").replace("px", ""));

	currentSettings.party.x = parseInt($("#party-bar").css("left").replace("px", ""));
	currentSettings.party.y = parseInt($("#party-bar").css("top").replace("px", ""));

	localStorage.setItem("settings", JSON.stringify(currentSettings));
}

// UI Elements and functions
function loadContextMenu(){
	$(":root").contextMenu({
		selector: "body",
		callback: function(key) {
			switch(key){
			case "lock":{
				toggleLock();
				break;
			}
			case "grid":{
				toggleGrid();
				break;
			}
			case "settings":{
				let openSettings = window.open("settings.html");
				var settingsTimer = setInterval(function() {
					if(openSettings.closed) {
						clearInterval(settingsTimer);
						loadSettings();						
						if(currentPlayer === null) return;
						generateRaidBuffs();
						generateMitigation();
						generateCustomCooldowns();
						generatePartyCooldowns();
					}
				}, 1000);
				break;
			}
			}
		},
		items: {
			"lock": {name: language.find(x => x.id === "lock").string, icon: "fas fa-lock-open"},
			"grid": {name: language.find(x => x.id === "grid").string, icon: "fas fa-border-all"},
			"settings": {name: language.find(x => x.id === "settings").string, icon: "fas fa-cog"},
			"sep1": "---------",
			"quit": {name: language.find(x => x.id === "close").string, icon: function(){ return "context-menu-icon context-menu-icon-quit"; }}
		}
	});
}

function drawGrid(){
	let width = window.innerWidth;
	let height = window.innerHeight;

	let canvas = $("#grid").attr({width: window.innerWidth, height: window.innerHeight});
	let canvasContext = canvas.get(0).getContext("2d");
	canvasContext.beginPath();

	for (let x = 0; x <= width; x+= 25){
		canvasContext.moveTo(0.5 + x, 0);
		canvasContext.lineTo(0.5 + x, height);
	}

	for (let y = 0; y <= height; y+= 25){
		canvasContext.moveTo(0, 0.5 + y);
		canvasContext.lineTo(width, 0.5 + y);
	}

	canvasContext.strokeStyle = "black";
	canvasContext.stroke();
}

function clearGrid(){
	let canvas = $("#grid").attr({width: window.innerWidth, height: window.innerHeight});
	let canvasContext = $("#grid").get(0).getContext("2d");
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}

function toggleGrid(){
	if(!gridshown){
		drawGrid();
		gridshown = true;
	}else{
		clearGrid();
		gridshown = false;
	}
}

function toggleLock(){
	interact("[id$=bar]").draggable({
		enabled: locked,
		listeners: {
			start (event) {
				if(!dragPosition[event.target.id]) dragPosition[event.target.id] = {};
				dragPosition[event.target.id].x = parseInt(event.target.style.left.replace("px", ""));
				dragPosition[event.target.id].y = parseInt(event.target.style.top.replace("px", ""));
			},
			move (event) {
				dragPosition[event.target.id].x += event.dx;
				dragPosition[event.target.id].y += event.dy;
				event.target.style.left = `${dragPosition[event.target.id].x}px`;
				event.target.style.top = `${dragPosition[event.target.id].y}px`;
			},
			end () {
				saveSettings();
			}
		}
	});
	if(locked){
		$("#timer-bar").show();
		$("#dot-timer-bar").show();
		$("#buff-timer-bar").show();
		$("#raid-buffs-bar").append("<span id=\"raid-buffs-anchor\" class=\"anchor-text\">Raid Buffs Anchor</span>");
		$("#mitigation-bar").append("<span id=\"mitigation-anchor\" class=\"anchor-text\">Mitigations Anchor</span>");
		$("#customcd-bar").append("<span id=\"customcd-anchor\" class=\"anchor-text\">Custom Cooldown Anchor</span>");
		$("#party-bar").append("<span id=\"party-anchor\" class=\"anchor-text\">Party Cooldowns Anchor</span>");
		if(currentSettings.raidbuffs.hidewhensolo && currentPartyList.length == 1) $("#raid-buffs-bar").show();
		//$("[id$=bar]").draggable("enable");
		adjustJobStacks(2,4, true);
		if(!inCombat){
			toggleHideOutOfCombatElements();
		}
		locked = false;
		$("html").css("border", "solid");
	}else{
		$("#timer-bar").hide();
		$("#dot-timer-bar").hide();
		$("#buff-timer-bar").hide();
		$("#raid-buffs-anchor").remove();
		$("#mitigation-anchor").remove();
		$("#customcd-anchor").remove();
		$("#party-anchor").remove();
		if(currentSettings.raidbuffs.hidewhensolo && currentPartyList.length == 1) $("#raid-buffs-bar").hide();
		//$("[id$=bar]").draggable("disable");
		adjustJobStacks(currentStats.stacks, currentStats.maxStacks, true);
		if(!inCombat){
			toggleHideOutOfCombatElements();
		}
		locked = true;
		$("html").css("border", "none");
	}
}

// Helper functions
function applyFilterColorToElement(classId, filterColor){
	$("style").append(`.${classId}::-webkit-progress-value { filter: var(${filterColor}); }`);
}

function getSelectorProperties(selector){
	let object = {};
	switch(selector){
	case "RaidBuff":{
		object = {
			id: "raid-buffs",
			settings: currentSettings.raidbuffs,
			active: activeRaidBuffs
		};
		break;
	}
	case "Mitigation":{
		object = {
			id: "mitigation",
			settings: currentSettings.mitigation,
			active: activeMitigations
		};
		break;
	}
	case "Party":{
		object = {
			id: "party",
			settings: currentSettings.party,
			active: activePartyCooldowns
		};
		break;
	}
	case "CustomCooldown":{
		object = {
			id: "customcd",
			settings: currentSettings.customcd,
			active: activeCustomCooldowns
		};
		break;
	}
	}
	return object;
}

function toggleHideOutOfCombatElements(){
	currentSettings.healthbar.hideoutofcombat && !inCombat ? $("#health-bar").addClass("hide-in-combat") : $("#health-bar").removeClass("hide-in-combat");
	currentSettings.manabar.hideoutofcombat && !inCombat  ? $("#mana-bar").addClass("hide-in-combat") : $("#mana-bar").removeClass("hide-in-combat");
	currentSettings.dottimerbar.hideoutofcombat && !inCombat ? $("[id$=dot-timer]").addClass("hide-in-combat") : $("[id$=dot-timer]").removeClass("hide-in-combat");
	currentSettings.dottimerbar.hideoutofcombat && !inCombat ? $("[id$=dot-image]").addClass("hide-in-combat") : $("[id$=dot-image]").removeClass("hide-in-combat");
	currentSettings.bufftimerbar.hideoutofcombat && !inCombat ? $("[id$=buff-timer]").addClass("hide-in-combat") : $("[id$=buff-timer]").removeClass("hide-in-combat");
	currentSettings.bufftimerbar.hideoutofcombat && !inCombat ? $("[id$=buff-image]").addClass("hide-in-combat") : $("[id$=buff-image]").removeClass("hide-in-combat");
	currentSettings.stacksbar.hideoutofcombat && !inCombat ? $("#stacks-bar").addClass("hide-in-combat") : $("#stacks-bar").removeClass("hide-in-combat");
	currentSettings.raidbuffs.hideoutofcombat && !inCombat ? $("#raid-buffs-bar").addClass("hide-in-combat") : $("#raid-buffs-bar").removeClass("hide-in-combat");
	currentSettings.mitigation.hideoutofcombat && !inCombat ? $("#mitigation-bar").addClass("hide-in-combat") : $("#mitigation-bar").removeClass("hide-in-combat");
	currentSettings.customcd.hideoutofcombat && !inCombat ? $("#customcd-bar").addClass("hide-in-combat") : $("#customcd-bar").removeClass("hide-in-combat");
	currentSettings.party.hideoutofcombat && !inCombat ? $("#party-bar").addClass("hide-in-combat") : $("#party-bar").removeClass("hide-in-combat");
}

// UI Generation for Job Stacks
function generateJobStacks(){
	$("#stacks-bar").empty();
	for(let i = 1; i <=4; i++){
		$("#stacks-bar").append(`<div id="stacks-background-${i}" class="stack-background stack-hidden"><img id="stacks-${i}" class="stack-color" src="skins/${currentSettings.skin}/images/arrow-fill-empty.png" /></div>`);
	}
}

// UI Generation / Handling for all modules that use normal ability icons
function generateCustomCooldowns(){
	let customAbilityList = [];
	$("#customcd-bar").empty();
	let playerIndex = 0;
	let currentJob = jobList.find(x => x.name === currentPlayer.job);
	if(currentSettings.customcd.abilities.length === 0) return;
	for(let ability of currentSettings.customcd.abilities.filter(x => x.type === "CustomCooldown" && x.level <= currentPlayer.level)){
		let pushAbility = false;
		if(ability.job === currentJob.name || ability.job === currentJob.type || ability.job === currentJob.position_type){
			pushAbility = true;
		}
		if(pushAbility && ability.enabled){
			customAbilityList.push({
				player: currentPlayer.name,
				playerIndex: playerIndex,
				ability: ability
			});
		}
	}
	if(currentSettings.customcd.alwaysshow && currentSettings.customcd.enabled) generateIconBarElements("CustomCooldown", customAbilityList, currentSettings.customcd.columns);
}

function generateMitigation(){
	let mitigationAbilityList = [];
	$("#mitigation-bar").empty();
	let playerIndex = 0;
	let currentJob = jobList.find(x => x.name === currentPlayer.job);
	for(let ability of abilityList.filter(x => x.type === "Mitigation" && x.level <= currentPlayer.level)){
		if(currentSettings.override.abilities.some(x => x.name === ability.name)){
			ability = currentSettings.override.abilities.find(x => x.name === ability.name);
		}
		let pushAbility = false;
		if(ability.job === currentJob.name || ability.job === currentJob.type){
			pushAbility = true;
		}
		if(pushAbility && ability.enabled){
			mitigationAbilityList.push({
				player: currentPlayer.name,
				playerIndex: playerIndex,
				ability: ability
			});
		}
	}
	if(currentSettings.mitigation.alwaysshow && currentSettings.mitigation.enabled) generateIconBarElements("Mitigation", mitigationAbilityList, currentSettings.mitigation.columns);
}

function generatePartyCooldowns(){
	let partyAbilityList = [];
	$("#party-bar").empty();
	let playerIndex = 0;
	for(let partyMember of currentPartyList){
		for(let ability of abilityList.filter(x => x.type === "Party" && (x.job === partyMember.job.name || x.job === partyMember.job.type || x.job === partyMember.job.position_type) && x.level <= currentPlayer.level)){
			if(currentSettings.override.abilities.some(x => x.name === ability.name)){
				ability = currentSettings.override.abilities.find(x => x.name === ability.name);
			}
			let pushAbility = true;
			if(pushAbility && ability.enabled){
				partyAbilityList.push({
					player: partyMember,
					playerIndex: playerIndex,
					ability: ability
				});
			}
		}
		playerIndex++;
	}
	if(currentSettings.party.alwaysshow && currentSettings.party.enabled) generateIconBarElements("Party", partyAbilityList, 20);
}

function generateRaidBuffs(){
	let raidAbilityList = [];
	$("#raid-buffs-bar").empty();
	let playerIndex = 0;
	for(let partyMember of currentPartyList){
		for(let ability of abilityList.filter(x => x.type === "RaidBuff" && x.job === partyMember.job.name && x.level <= currentPlayer.level)){
			if(currentSettings.override.abilities.some(x => x.name === ability.name)){
				ability = currentSettings.override.abilities.find(x => x.name === ability.name);
			}
			let pushAbility = true;
			if(ability.hasOwnProperty("extra")){
				if(ability.extra.hasOwnProperty("is_card") || ability.extra.hasOwnProperty("is_song") || ability.extra.hasOwnProperty("is_ss") || ability.extra.hasOwnProperty("is_ts")) pushAbility = false;
			}
			if(pushAbility && ability.enabled){
				raidAbilityList.push({
					player: partyMember,
					playerIndex: playerIndex,
					ability: ability
				});
			}
		}
		playerIndex++;
	}
	if(!currentSettings.raidbuffs.orderbypartymember) raidAbilityList.sort((a, b) => a.ability.order - b.ability.order);
	if(currentSettings.raidbuffs.alwaysshow && currentSettings.raidbuffs.enabled) generateIconBarElements("RaidBuff", raidAbilityList, currentSettings.raidbuffs.columns);
}

function generateIconBarElements(selector, iconAbilityList, columns){
	let selectorProperties = getSelectorProperties(selector);
	let barSelector = selectorProperties.id;
	let selectedSettings = selectorProperties.settings;

	let rows = Math.ceil(iconAbilityList.length / columns);
	let abilityIndex = 0;
	if(selector !== "Party"){
		for(let i = 1; i <= rows; i++){
			$(`#${barSelector}-bar`).append(`<div id="${barSelector}-row-${i}" class="ability-row" style="padding-top: ${selectedSettings.padding}px;"><div id="${barSelector}-row-${i}-box" class="ability-box${selectedSettings.growleft ? " rtl" : ""}"></div></div>`);
			for (let j = 1; j <= columns; j++){
				let ability = iconAbilityList[abilityIndex];
				generateAbilityIcon(ability.playerIndex, ability.ability, i);
				if(abilityIndex == iconAbilityList.length - 1) break;
				abilityIndex++;
			}
		}
	}else{
		let currentPlayerIndex = 0;
		let players = 8;
		if(currentSettings.includealliance) players = 24;
		for (let i = 1; i <= players; i++){
			$(`#${barSelector}-bar`).append(`<div id="${barSelector}-row-${i}" class="ability-row" style="padding-top: ${selectedSettings.padding}px;"><div id="${barSelector}-row-${i}-box" class="ability-box${selectedSettings.growleft ? " rtl" : ""}"></div></div>`);
			if(iconAbilityList.filter(ability => ability.playerIndex === i - 1).length === 0){
				$(`#${barSelector}-row-${i}-box`).append(`<div id="${barSelector}-${i}-dummy-container" class="ability-container" style="width: ${selectedSettings.scale * 48}px; height: ${selectedSettings.scale * 48}px; padding-right: ${selectedSettings.padding}px;"></div>`);
				$(`#${barSelector}-${i}-dummy-container`).append(`<img id="${barSelector}-${i}-dummy-image" class="ability-image" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" width="${selectedSettings.scale * 40}px" height="${selectedSettings.scale * 40}px" style="top: ${selectedSettings.scale * 2}px;" />`);
			}
		}
		for (let ability of iconAbilityList){
			if(currentPlayerIndex != ability.playerIndex) currentPlayerIndex = ability.playerIndex;
			generateAbilityIcon(ability.playerIndex, ability.ability, ability.playerIndex + 1);
		}
	}
}

function generateAbilityIcon(playerIndex, ability, row, generateRow = false){
	let selectorProperties = getSelectorProperties(ability.type);
	let barSelector = selectorProperties.id;
	let selectedSettings = selectorProperties.settings;
	if(generateRow){
		if(row === 0) row = 1;
		if($(`#${barSelector}-row-${row}`).length === 0) $(`#${barSelector}-bar`).append(`<div id="${barSelector}-row-${row}" class="ability-row" style="padding-top: ${selectedSettings.padding}px;"><div id="${barSelector}-row-${row}-box" class="ability-box${selectedSettings.growleft ? " rtl" : ""}"></div></div>`);
	}

	let iconWidth = selectedSettings.scale * 40;
	let iconHeight = selectedSettings.scale * 40;
	let activeWidth = selectedSettings.scale * 42;
	let activeHeight = selectedSettings.scale * 42;
	let boxWidth = selectedSettings.scale * 48;
	let boxHeight = selectedSettings.scale * 48;
	let overlayWidth = selectedSettings.scale * 48;
	let overlayHeight = selectedSettings.scale * 48;
	let lineHeight = selectedSettings.scale * 44;

	let abilitySelector = `${barSelector}-${playerIndex}-${ability.id}`;
	let containerSelector = `#${abilitySelector}-container`;

	$(`#${barSelector}-row-${row}-box`).append(`<div id="${abilitySelector}-container" class="ability-container" style="width: ${boxWidth}px; height: ${boxHeight}px; padding-right: ${selectedSettings.padding}px;"></div>`);
	$(containerSelector).append(`<img id="${abilitySelector}-image" class="ability-image" src="${ability.icon}" width="${iconWidth}px" height="${iconHeight}px" style="top: ${selectedSettings.scale * 2}px;" />`);
	$(containerSelector).append(`<img id="${abilitySelector}-active" class="icon-active" src="skins/${currentSettings.skin}/images/combo.gif" width="${activeWidth}px" height="${activeHeight}px" style="top: ${selectedSettings.scale * 1}px; display: none;" />`);
	$(containerSelector).append(`<img id="${abilitySelector}-overlay" class="icon-overlay" src="skins/${currentSettings.skin}/images/icon-overlay.png" width="${overlayWidth}px" height="${overlayHeight}px" />`);
	$(containerSelector).append(`<span id="${abilitySelector}-cooldown" class="ability-text" style="line-height: ${lineHeight}px; padding-left: ${selectedSettings.scale * 2}px; ${selectedSettings.cooldownoutline ? `-webkit-text-stroke: 1.5px ${selectedSettings.durationoutlinecolor};` : ""} color: ${selectedSettings.cooldowncolor}; font-size: ${selectedSettings.scale * 24}px; font-weight:${selectedSettings.cooldownbold ? "bold" : "normal"}"></span>`);
	$(containerSelector).append(`<span id="${abilitySelector}-duration" class="ability-text" style="line-height: ${lineHeight}px; padding-left: ${selectedSettings.scale * 2}px; ${selectedSettings.durationoutline ? `-webkit-text-stroke: 1.5px ${selectedSettings.durationoutlinecolor};` : ""} color: ${selectedSettings.durationcolor}; font-size: ${selectedSettings.scale * 24}px; font-weight:${selectedSettings.durationbold ? "bold" : "normal"};"></span>`);
}

// Handlers for creating/maintaining party list
function generatePartyList(party){
	currentPartyList = [];
	for (let partyMember of party)
	{
		if(!partyMember.inParty && !currentSettings.includealliance) return;
		currentPartyList.push({
			id: partyMember.id,
			inParty: partyMember.inParty,
			job: jobList.find(x => x.id === partyMember.job),
			name: partyMember.name,
			worldId: partyMember.worldId
		});
	}
	let jobOrder = currentSettings.partyorder;
	let currentPlayerElement = currentPartyList.find(x => x.name === currentPlayer.name);
	currentPartyList.sort((a, b) => a.id - b.id);
	currentPartyList.sort((a, b) => jobOrder.indexOf(a.job.name) - jobOrder.indexOf(b.job.name));
	currentPartyList = currentPartyList.filter(x => x !== currentPlayerElement);
	if(currentSettings.includealliance){
		let ownParty = currentPartyList.filter(x => x.inParty);
		let alliance = currentPartyList.filter(x => !x.inParty);
		currentPartyList = ownParty.concat(alliance);
	}
	currentPartyList.unshift(currentPlayerElement);
	if(currentPartyList.length != 0) generateRaidBuffs(); generatePartyCooldowns();
}

function setupSoloParty(){
	currentPartyList.push({
		id: currentPlayer.id,
		inParty: false,
		job: jobList.find(x => x.name === currentPlayer.job),
		name: currentPlayer.name,
		worldId: null
	});
	generateRaidBuffs();
	generateMitigation();
	generateCustomCooldowns();
	generatePartyCooldowns();
}

// Timer and TTS handlers
function startAbilityIconTimers(playerIndex, ability, onYou = true, abilityHolder = null){
	toLog([`[StartAbilityIconTimers] PlayerIndex: ${playerIndex} On You: ${onYou} AbilityHolder: ${abilityHolder}`, ability]);
	let abilityUsed = abilityHolder === null ? ability : abilityHolder;
	let usingAbilityHolder = !(abilityHolder === null);

	let selectorProperties = getSelectorProperties(ability.type);
	let barSelector = selectorProperties.id;
	let selectedSettings = selectorProperties.settings;
	let selectedActive = selectorProperties.active;

	let selector = `#${barSelector}-${playerIndex}-${abilityUsed.id}`;
	if(selectedActive.has(`${playerIndex}-${ability.id}`)){
		if(activeCountdowns.has(`${selector}-duration`)){
			clearInterval(activeCountdowns.get(`${selector}-duration`));
		}
		if(activeCountdowns.has(`${selector}-cooldown`)){
			clearInterval(activeCountdowns.get(`${selector}-cooldown`));
		}
		stopAbilityTimer(`${selector}-cooldown`, null);
		stopAbilityTimer(`${selector}-duration`, null);
	}

	handleAbilityTTS(ability, selector, onYou);

	if(onYou){
		if(!selectedSettings.alwaysshow){
			generateAbilityIcon(playerIndex, ability, Math.ceil(selectedActive.size / selectedSettings.columns), true);
		}
		$(`${selector}-overlay`).attr("src", `skins/${currentSettings.skin}/images/icon-overlay.png`);
		$(`${selector}-active`).show();
		$(`${selector}-duration`).show();
		$(`${selector}-duration`).text(ability.duration);
		$(`${selector}-cooldown`).hide();
		if(usingAbilityHolder){
			let previousIcon = `${abilityHolder.icon}`;
			$(`${selector}-image`).attr("src", `${ability.icon}`);
			startAbilityTimer(ability.duration, `${selector}-duration`, previousIcon);
		}else{
			startAbilityTimer(ability.duration, `${selector}-duration`);
		}

	}else{
		$(`${selector}-overlay`).attr("src", ability.cooldown > 0 ? `skins/${currentSettings.skin}/images/icon-overlay-cooldown.png` : `skins/${currentSettings.skin}/images/icon-overlay.png`);
		$(`${selector}-cooldown`).show();
		$(`${selector}-cooldown`).text(ability.cooldown);
	}
	if(selectedSettings.alwaysshow) startAbilityTimer(ability.cooldown, `${selector}-cooldown`);

	selectedActive.set(`${playerIndex}-${ability.id}`, selector);
}

function startAbilityBarTimer(ability, duration, onYou){
	if(!currentSettings[`${ability.type.toLowerCase()}timerbar`].enabled) return;
	let targetBarSelector = `#${ability.type.toLowerCase()}-timer-bar`;
	let targetImageSelector = `#${ability.type.toLowerCase()}-image`;
	let selectorBar = `#${ability.id}-${ability.type.toLowerCase()}-timer`;
	let selectorImage = `#${ability.id}-${ability.type.toLowerCase()}-image`;
	ability.duration = parseInt(duration);
	if(!activeDotBars.has(ability.id) && !activeBuffBars.has(ability.id)){
		switch(ability.type){
		case "DoT":{
			activeDotBars.set(ability.id, selectorBar);
			break;
		}
		case "Buff":{
			activeBuffBars.set(ability.id, selectorBar);
			break;
		}
		}
		let newBar = $(targetBarSelector).clone().prop("id", selectorBar.replace("#", ""));
		$(targetBarSelector).after(newBar);
		let newImage = $(targetImageSelector).clone().prop("id", selectorImage.replace("#", ""));
		$(targetImageSelector).after(newImage);

		$(selectorBar).show();
		$(selectorBar).addClass(`bar-${ability.id}`);
		$(selectorBar).addClass(`${ability.type.toLowerCase()}-font-size`);
		applyFilterColorToElement(`bar-${ability.id}`, ability.color);

		$(targetBarSelector).attr("data-font-size", currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 10);

		switch(parseInt(currentSettings[`${ability.type.toLowerCase()}timerbar`].growdirection)){
		case 1:{
			// Down
			$(selectorBar).css("left", $(targetBarSelector).css("left"));
			$(selectorBar).css("top", parseInt($(targetBarSelector).css("top").replace("px", "")) + (currentSettings[`${ability.type.toLowerCase()}timerbar`].padding * ability.order));
			break;
		}
		case 2:{
			// Up
			$(selectorBar).css("left", $(targetBarSelector).css("left"));
			$(selectorBar).css("top", parseInt($(targetBarSelector).css("top").replace("px", "")) - (currentSettings[`${ability.type.toLowerCase()}timerbar`].padding * ability.order));
			break;
		}
		case 3:{
			// Left
			$(selectorBar).css("top", $(targetBarSelector).css("top"));
			$(selectorBar).css("left", parseInt($(targetBarSelector).css("left").replace("px", "")) - (currentSettings[`${ability.type.toLowerCase()}timerbar`].padding * ability.order));
			break;
		}
		case 4:{
			// Right
			$(selectorBar).css("top", $(targetBarSelector).css("top"));
			$(selectorBar).css("left", parseInt($(targetBarSelector).css("left").replace("px", "")) + (currentSettings[`${ability.type.toLowerCase()}timerbar`].padding * ability.order));
			break;
		}
		}

		if(currentSettings[`${ability.type.toLowerCase()}timerbar`].imageenabled){
			$(selectorImage).show();
			$(selectorImage).attr("src", `${ability.icon}`);
			$(selectorImage).css("image-rendering", currentSettings[`${ability.type.toLowerCase()}timerbar`].scale > 1 ? "pixelated" : "-webkit-optimize-contrast" );
			$(selectorImage).css("height", currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 22);

			let left = parseInt($(targetBarSelector).css("left").replace("px", ""));
			let top = parseInt($(targetBarSelector).css("top").replace("px", ""));

			switch(parseInt(currentSettings[`${ability.type.toLowerCase()}timerbar`].growdirection)){
			case 1:{
				// Down
				left = left - (currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 20);
				top = top + (currentSettings[`${ability.type.toLowerCase()}timerbar`].padding * ability.order) - (currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 4);
				break;
			}
			case 2:{
				// Up
				left = left - (currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 20);
				top = top - (currentSettings[`${ability.type.toLowerCase()}timerbar`].padding * ability.order) - (currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 4);
				break;
			}
			case 3:{
				// Left
				top = top - (currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 4);
				left = left - (currentSettings[`${ability.type.toLowerCase()}timerbar`].padding * ability.order) - (currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 20);
				break;
			}
			case 4:{
				// Right
				top = top - (currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 4);
				left = left + (currentSettings[`${ability.type.toLowerCase()}timerbar`].padding * ability.order) - (currentSettings[`${ability.type.toLowerCase()}timerbar`].scale * 20);
				break;
			}
			}

			$(selectorImage).css("left", left);
			$(selectorImage).css("top", top);
		}
	}
	if(activeCountdowns.has(selectorBar)) clearInterval(activeCountdowns.get(selectorBar));
	handleAbilityTTS(ability, selectorBar, onYou);
	startBarTimer(duration, selectorBar, currentSettings[`${ability.type.toLowerCase()}timerbar`].hidewhendroppedoff);
}

function startAbilityTimer(duration, selector, previousIcon = null){
	let timems = duration * 1000;

	$(selector).text(duration);

	let timeLeft = timems;
	let countdownTimer = setInterval(function(){
		timeLeft -= UPDATE_INTERVAL;

		$(selector).text((timeLeft / 1000).toFixed(0));
		if(timeLeft <= 0){
			clearInterval(countdownTimer);
			setTimeout(function(){
				stopAbilityTimer(selector, previousIcon);
			}, UPDATE_INTERVAL);
		}
	}, UPDATE_INTERVAL);
	activeCountdowns.set(selector, countdownTimer);
}

function startBarTimer(duration, selector, hideTimer = false){
	toLog([`[StartBarTimer] Duration: ${duration} Selector: ${selector} Hidetimer: ${hideTimer}`]);
	let timems = duration * 1000;
	$(selector).attr("max", timems);
	$(selector).attr("value", timems);
	$(selector).attr("data-label", timems);

	if(hideTimer) $(selector).show();

	let timeLeft = timems;
	let countdownTimer = setInterval(function(){
		timeLeft -= UPDATE_INTERVAL;
		$(selector).attr("value", timeLeft);
		$(selector).attr("data-label", (timeLeft / 1000).toFixed(1));
		if(timeLeft <= 0){
			clearInterval(countdownTimer);
			setTimeout(function(){
				if(hideTimer){
					if(selector !== "#timer-bar"){
						removeTimerBar(selector);
					}else{
						$(selector).hide();
					}
				}
			}, UPDATE_INTERVAL);
		}
	}, UPDATE_INTERVAL);
	activeCountdowns.set(selector, countdownTimer);
}


function stopAbilityTimer(selector, previousIcon = null){
	if(currentSettings.raidbuffs.alwaysshow){
		$(selector).text("");
		if(selector.endsWith("duration")){
			if(previousIcon !== null) $(selector.replace("duration", "image")).attr("src", previousIcon);
			$(selector.replace("duration", "cooldown")).show();
			$(selector.replace("duration", "active")).hide();

			if($(selector.replace("duration", "cooldown")).text().length !== 0){
				$(selector.replace("duration", "overlay")).attr("src", `skins/${currentSettings.skin}/images/icon-overlay-cooldown.png`);
			}
		}
		if(selector.endsWith("cooldown")){
			$(selector.replace("cooldown", "overlay")).attr("src", `skins/${currentSettings.skin}/images/icon-overlay.png`);
		}
	}else{
		$(selector.replace("-duration", "").replace("-cooldown", "")).remove();
		activeCountdowns.delete(selector);
	}
}

function stopPlayerDurationTimers(playerindex){
	activePartyCooldowns.forEach((value, key) =>{
		if(key.split("-")[0] == playerindex){
			if(activeCountdowns.has(`${value}-duration`)){
				clearInterval(activeCountdowns.get(`${value}-duration`));
			}
			stopAbilityTimer(`${value}-duration`, null);
		}
	});

	if(playerindex === 0){
		activeCountdowns.forEach((value, key) =>{
			let split = key.split("-");
			let last = split[split.length - 1];
			console.log(last);
			if(last == "duration"){
				console.log(value);
				clearInterval(activeCountdowns.get(key));
				stopAbilityTimer(key, null);
			}
		});
	}
}

function removeTimerBar(selector){
	$(selector).remove();
	$(selector.replace("timer", "image")).remove();
	if(activeBuffBars.has(parseInt(selector.match(/[0-9]+/g)[0]))) activeBuffBars.delete(parseInt(selector.match(/[0-9]+/g)[0]));
	if(activeDotBars.has(parseInt(selector.match(/[0-9]+/g)[0]))) activeDotBars.delete(parseInt(selector.match(/[0-9]+/g)[0]));
}

function resetTimers(){
	for(let [, countdownTimer] of activeCountdowns){
		clearInterval(countdownTimer);
	}
	for(let [, selector] of activeBuffBars){
		removeTimerBar(selector);
	}
	for(let [, selector] of activeDotBars){
		removeTimerBar(selector);
	}
	activeBuffBars.clear();
	activeDotBars.clear();
	activeCountdowns.clear();
}

function startTTSTimer(duration, selector, text, timeWhen = 2000){
	toLog([`[StartTTSTimer] Duration: ${duration} Selector: ${selector} Text: ${text} TimeWhen: ${timeWhen}`]);
	if(!ttsElements.has(selector)){
		ttsElements[selector] = setGoogleTTS(text);
	}

	let timems = duration * 1000;
	let timeLeft = timems;
	let ttsTimer = setInterval(function(){
		timeLeft -= UPDATE_INTERVAL;
		if(timeLeft <= timeWhen){
			ttsElements[selector].play();
			clearInterval(ttsTimer);
			setTimeout(function(){
			}, UPDATE_INTERVAL);
		}
	}, UPDATE_INTERVAL);
	activeTTS.set(selector, ttsTimer);
}

function handleAbilityTTS(ability, selector, onYou = true){
	if(activeTTS.has(selector)) clearInterval(activeTTS.get(selector));
	switch(ability.type){
	case "DoT":
		if(!currentSettings.dottimerbar.ttsenabled) return;
		break;
	case "Buff":
		if(!currentSettings.bufftimerbar.ttsenabled) return;
		break;
	case "RaidBuff":
		if(!currentSettings.raidbuffs.ttsenabled) return;
		break;
	case "Mitigation":
		if(!currentSettings.mitigation.ttsenabled) return;
		break;
	case "Party":
		if(!currentSettings.party.ttsenabled) return;
		break;
	case "CustomCooldown":
		if(!currentSettings.customcd.ttsenabled) return;
		break;
	default:
		break;
	}

	let name = ability.name;
	switch(currentSettings.language){
	case "en":
		name = ability.name_en;
		break;
	case "cn":
		name = ability.name_cn;
		break;
	case "de":
		name = ability.name_de;
		break;
	case "fr":
		name = ability.name_fr;
		break;
	case "jp":
		name = ability.name_jp;
		break;
	case "kr":
		name = ability.name_kr;
		break;
	default:
		break;
	}
	if(ability.tts){
		switch(ability.ttstype){
		case 0:
			startTTSTimer(ability.cooldown, selector, name);
			break;
		case 1:
			startTTSTimer(ability.duration, selector, name);
			break;
		case 2:
			if(!onYou && ability.type == "RaidBuff") return;
			startTTSTimer(0, selector, name, 0);
			break;
		default:
			break;
		}
	}
}

function setGoogleTTS(text){
	let iframe = document.createElement("iframe");
	iframe.removeAttribute("sandbox");
	iframe.style.display = "none";
	document.body.appendChild(iframe);
	let encText = encodeURIComponent(text);

	let ttsLang = currentSettings.language;
	if(currentSettings.language == "jp") ttsLang = "ja";

	if(currentSettings.language == "cn"){
		// For CN User
		// https://fanyi.baidu.com/gettts?lan=zh&spd=5&source=web&text=
		iframe.contentDocument.body.innerHTML = "<audio src=\"https://fanyi.baidu.com/gettts?lan=zh&spd=5&source=web&text=" + encText + "\" id=\"TTS\">";
	} else{
		iframe.contentDocument.body.innerHTML = "<audio src=\"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=" + ttsLang + "&q=" + encText + "\" id=\"TTS\">";
	}
	this.item = iframe.contentDocument.body.firstElementChild;
	return this.item;
}

// Stack maintaining functions
function adjustJobStacks(value, max, noAdd = false){
	if(!noAdd){
		currentStats.stacks = value;
		if(currentPlayer.job === "SMN" && currentStats.maxStacks === 0 && !noAdd){
			initializeSmn(true);
			max = 4;
		}
	}

	for(let i = 1; i <= 4; i++){
		let backgroundSelector = `#stacks-background-${i}`;
		let selector = `#stacks-${i}`;
		if(i <= max){
			if($(backgroundSelector).hasClass("stack-hidden")){
				$(backgroundSelector).removeClass("stack-hidden");
			}
		}else{
			if(!$(backgroundSelector).hasClass("stack-hidden")){
				$(backgroundSelector).addClass("stack-hidden");
			}
		}
		$(selector).attr("src", i <= value ? `skins/${currentSettings.skin}/images/arrow-fill.png` : `skins/${currentSettings.skin}/images/arrow-fill-empty.png`);
	}
}

function initializeSmn(addStack = false){
	currentStats.stacks = addStack ? 1 : 0;
	currentStats.maxStacks = 4;
}

// OverlayPlugin and Cactbot Event Handlers
function onChangeZone(){
	if(currentPlayer === null) return;
	if(currentPlayer.job === "SMN") {
		initializeSmn();
		adjustJobStacks(currentStats.stacks, currentStats.maxStacks);
	}
	resetTimers();
}

function onInCombatChangedEvent(e){
	if(inCombat === e.detail.inGameCombat){
		return;
	}

	inCombat = e.detail.inGameCombat;
	toggleHideOutOfCombatElements();
}

function onLogEvent(e){
	for (let logLine of e.detail.logs){
		toLog([logLine]);
		for(let logType of Object.keys(regexList)){
			let regexObject = regexList[logType];
			let regex = new RegExp(regexObject.regex);
			if(regex.test(logLine)){
				let matches = regexObject.matches;
				for(let match of Object.keys(matches)){
					let matchObject = matches[match];
					let innerRegex = new RegExp(matchObject.regex);
					let regexMatch = innerRegex.exec(logLine);
					if(regexMatch !== null){
						let logFunction = window[matchObject.function];
						if (typeof logFunction === "function") {
							toLog([`Executing function ${matchObject.function}`,regexMatch.groups]);
							logFunction(regexMatch.groups);
						}
					}
				}
			}
		}
	}
}

document.addEventListener("onOverlayStateUpdate", function(e) {
	if (!e.detail.isLocked) {
		$(":root").css("background", "rgba(0,0,255,0.5)");
	}else{
		$(":root").css("background", "");
	}
});

function onPartyChanged(e){
	if(currentPlayer === null) return;
	generatePartyList(e.party);
}

function onPartyWipe(){
	if(currentPlayer === null) return;
	if(currentPlayer.job === "SMN") {
		initializeSmn();
		adjustJobStacks(currentStats.stacks, currentStats.maxStacks);
	}
	resetTimers();
	generateRaidBuffs();
	generateMitigation();
	generateCustomCooldowns();
	generatePartyCooldowns();
}

function onPlayerChangedEvent(e){
	if(currentPlayer !== null && currentPlayer.job !== e.detail.job){
		if(e.detail.job === "SMN") {
			initializeSmn();
			adjustJobStacks(currentStats.stacks, currentStats.maxStacks);
			$("#stacks-bar").show();
		}else{
			$("#stacks-bar").hide();
		}
		resetTimers();
		if(currentPartyList.length === 1){
			currentPartyList = [];
		}
	}
	currentPlayer = e.detail;
	if(currentPartyList.length === 0){
		setupSoloParty();
	}

	$("#health-bar").attr("max", currentPlayer.maxHP);
	$("#health-bar").attr("value", currentPlayer.currentHP);
	$("#health-bar").attr("data-label", currentSettings.healthbar.textenabled ? `${currentPlayer.currentHP} / ${currentPlayer.maxHP}` : "");

	$("#mana-bar").attr("max", currentPlayer.maxMP);
	$("#mana-bar").attr("value", currentPlayer.currentMP);
	$("#mana-bar").attr("data-label", currentSettings.manabar.textenabled ? `${currentPlayer.currentMP} / ${currentPlayer.maxMP}` : "");
}

// Regex Event Handlers from ../data/regex.js
/* exported onInstanceStart */
function onInstanceStart(){
	generateRaidBuffs();
	generateMitigation();
	generateCustomCooldowns();
	generatePartyCooldowns();
}

/* exported onInstanceEnd */
function onInstanceEnd(){
	resetTimers();
	generateRaidBuffs();
	generateMitigation();
	generateCustomCooldowns();
	generatePartyCooldowns();
}

/* exported handleCountdownTimer */
function handleCountdownTimer(parameters){
	if(!currentSettings.timerbar.enabled) return;
	startBarTimer(parameters.seconds, "#timer-bar", true);
}

/* exported handleSkill */
function handleSkill(parameters){
	if(currentPlayer === null) return;
	let byYou = (parameters.player === currentPlayer.name);
	let onYou = false;
	if (parameters.target){
		if(parameters.target === currentPlayer.name) onYou = true;
	}

	let playerIndex = currentPartyList.findIndex(x => x.name === parameters.player);
	let ability = undefined;
	for (ability of abilityList.filter(x => x.id == parseInt(parameters.skillid, 16))){
		if(ability === undefined) return;
		if(currentSettings.override.abilities.some(x => x.id == parseInt(parameters.skillid, 16))){
			ability = currentSettings.override.abilities.find(x => x.id == parseInt(parameters.skillid, 16));
		}
		if(!ability.enabled) return;
		if(ability.name === "Shoha" && byYou){
			adjustJobStacks(0, currentStats.maxStacks);
		}
		if(ability.name === "Ruin IV" && byYou){
			adjustJobStacks(currentStats.stacks - 1, currentStats.maxStacks);
			blockRuinGained = true;
			setTimeout(function(){
				blockRuinGained = false;
			}, 1000);
		}
		if(ability.type === "RaidBuff"){
			if(ability.hasOwnProperty("extra")){
				if(ability.extra.is_card){
					let abilityHolder = abilityList.find(x => x.name === "Play");
					if(onYou){
						startAbilityIconTimers(playerIndex, ability, true, currentSettings.raidbuffs.alwaysshow ? abilityHolder : ability);
					}
				}
				if(ability.extra.cooldown_only){
					startAbilityIconTimers(playerIndex, ability, false);
				}
				if(ability.extra.is_song){
					let abilityHolder = abilityList.find(x => x.name === "Song");
					if(byYou){
						if(!currentSettings.raidbuffs.alwaysshow) {
							for(let song of abilityList.filter(x => x.hasOwnProperty("extra") && x.extra.hasOwnProperty("is_song"))){
								let selector = `#raid-buffs-${playerIndex}-${song.id}`;
								if(activeCountdowns.has(`${selector}-duration`)){
									clearInterval(activeCountdowns.get(`${selector}-duration`));
								}
								if(activeCountdowns.has(`${selector}-cooldown`)){
									clearInterval(activeCountdowns.get(`${selector}-cooldown`));
								}
								stopAbilityTimer(`${selector}-cooldown`, null);
								stopAbilityTimer(`${selector}-duration`, null);
							}
						}
						startAbilityIconTimers(playerIndex, ability, true, currentSettings.raidbuffs.alwaysshow ? abilityHolder : ability);
					}
				}
				if(ability.extra.is_ss){
					let abilityHolder = abilityList.find(x => x.id === 15997);
					startAbilityIconTimers(playerIndex, ability, true, currentSettings.raidbuffs.alwaysshow ? abilityHolder : ability);
				}
				if(ability.extra.is_ts){
					let abilityHolder = abilityList.find(x => x.id === 16004);
					startAbilityIconTimers(playerIndex, ability, true, currentSettings.raidbuffs.alwaysshow ? abilityHolder : ability);
				}
			}
			else{
				if ((!onYou && ability.name === "Dragon Sight") || (byYou && ability.name === "Battle Voice")){
					onYou = false;
				}else{
					onYou = true;
				}
				startAbilityIconTimers(playerIndex, ability, onYou);
			}
		}
		if(ability.type === "Mitigation"){
			if(onYou || byYou) startAbilityIconTimers(playerIndex, ability, true);
		}
		if(ability.type === "Party"){
			startAbilityIconTimers(playerIndex, ability, true);
		}
	}
	if(currentSettings.customcd.abilities.length > 0){
		for (ability of currentSettings.customcd.abilities.filter(x => x.id == parseInt(parameters.skillid, 16))){
			if(byYou) startAbilityIconTimers(playerIndex, ability, true);
		}
	}

}

/* exported handleGainEffect */
function handleGainEffect(parameters){
	if(currentPlayer === null) return;
	let byYou = (parameters.player === currentPlayer.name);
	let onYou = (parameters.target === currentPlayer.name);
	let playerIndex = currentPartyList.findIndex(x => x.name === parameters.player);
	let ability = undefined;
	for (ability of abilityList.filter(x => x[`name_${currentSettings.language}`].toLowerCase() == parameters.effect.toLowerCase())){
		if(ability === undefined) return;
		if(currentSettings.override.abilities.some(x => x.name === ability.name)){
			ability = currentSettings.override.abilities.find(x => x.name === ability.name);
		}
		if(!ability.enabled) return;
		if(ability.type === "RaidBuff"){
			if(ability.name === "Standard Step" || ability.name === "Technical Step" || ability.name === "Embolden") return;
			if(ability.hasOwnProperty("extra")){
				if(ability.extra.is_song){
					let abilityHolder = abilityList.find(x => x.name === "Song");
					if(byYou){
						return;
					}
					if(onYou){
						ability.duration = 5;
						startAbilityIconTimers(playerIndex, ability, true, currentSettings.raidbuffs.alwaysshow ? abilityHolder : ability);
					}
				}
			}
			if(onYou) startAbilityIconTimers(playerIndex, ability, true);
		}
		if(ability.type === "Mitigation"){
			if(onYou || byYou) {
				if(ability.hasOwnProperty("extra")){
					if(ability.hasOwnProperty("shares_cooldown")){
						startAbilityIconTimers(playerIndex, ability, true);
						startAbilityIconTimers(playerIndex, abilityList.find(x => x.id === ability.extra.shares_cooldown), false);
					}
				}else{
					startAbilityIconTimers(playerIndex, ability, true);
				}
			}

		}
		if(ability.type === "Stacks" && byYou){
			if(!blockRuinGained) adjustJobStacks(currentStats.stacks + 1, currentStats.maxStacks);
		}
		if((ability.type === "DoT"  && byYou) || (ability.type === "Buff" && byYou)){
			startAbilityBarTimer(ability, parameters.duration, onYou);
		}
	}
}

/* exported handleLoseEffect */
function handleLoseEffect(parameters){
	if(currentPlayer === null) return;
	let byYou = (parameters.player === currentPlayer.name);
	let onYou = (parameters.target === currentPlayer.name);
	let playerIndex = currentPartyList.findIndex(x => x.name === parameters.player);
	let ability = undefined;
	let mergedAbilityList = abilityList.concat(currentSettings.customcd.abilities);
	for (ability of mergedAbilityList.filter(x => x[`name_${currentSettings.language}`].toLowerCase() == parameters.effect.toLowerCase())){
		let selectorProperties = getSelectorProperties(ability.type);
		let barSelector = selectorProperties.id;
		let abilitySelector = `#${barSelector}-${playerIndex}-${ability.id}`;

		if(activeCountdowns.has(`${abilitySelector}-duration`)){
			clearInterval(activeCountdowns.get(`${abilitySelector}-duration`));
		}
		stopAbilityTimer(`${abilitySelector}-duration`, null);
	}
}

/* exported handleDeath */
function handleDeath(parameters){
	let you = (parameters.target === currentPlayer.name);
	let playerIndex = currentPartyList.findIndex(x => x.name === parameters.player);
	stopPlayerDurationTimers(playerIndex);
	if(you){
		if(currentPlayer.job === "SMN") {
			initializeSmn();
			adjustJobStacks(currentStats.stacks, currentStats.maxStacks);
		}
	}
}

/* exported handlePlayerStats */
function handlePlayerStats(parameters){
	currentStats.skillSpeed = (1000 + Math.floor(130 * (parameters.sks - 380) / 3300)) / 1000;
	currentStats.spellSpeed = (1000 + Math.floor(130 * (parameters.sps - 380) / 3300)) / 1000;
}

// Functions for debugging
function toLog(parameters){
	if(!currentSettings.debug.enabled) return;
	for(let parameter of parameters){
		console.log(parameter);
	}
}

/* exported testLog */
function testLog(logLine){
	let logEvent = {
		type: "onLogEvent",
		detail: {
			logs: [
				logLine
			]
		}
	};
	onLogEvent(logEvent);
}