﻿/* exported language */
var language = [
	{ id: "settingsheader", string: "Paramètres" },
	{ id: "savesettings", string: "Sauvegarder les paramètres" },
	{ id: "deletesettings", string: "Supprimer les paramètres" },
	{ id: "applytoallelements", string: "Applique la police par défaut à tous les éléments" },
	{ id: "generaloptions", string: "Options Générales" },
	{ id: "exportsettings", string: "Exporter les paramètres" },
	{ id: "importsettings", string: "Importer les paramètres" },
	// COMPONENTS
	{ id: "healthbar", string: "Barre de vie" },
	{ id: "manabar", string: "Barre de mana" },
	{ id: "pulltimers", string: "Minuteur de Pull" },
	{ id: "bufftimers", string: "Minuteurs de buffs" },
	{ id: "dottimers", string: "Minuteurs de DoT" },
	{ id: "stacksbar", string: "Barres des stacks" },
	{ id: "raidbuffs", string: "Buffs de raid" },
	{ id: "party", string: "Party Cooldowns" },
	{ id: "skin", string: "Skin" },
	{ id: "language", string: "Langue" },
	{ id: "mitigations", string: "Mitigations" },
	{ id: "customcooldowns", string: "Custom Cooldowns" },
	{ id: "editcustomcooldowns", string: "Edit Custom Cooldowns" },
	{ id: "overrideoptions", string: "Options d'écrasement" },
	{ id: "importexport", string: "Importer / Exporter" },
	{ id: "debug", string: "Debug" },
	// DESCRIPTIONS
	{ id: "generaldescription", string: "Ici, vous trouverez des options générales pour ZeffUI." },
	{ id: "healthbardescription", string: "Ici, vous pouvez changer les options de la barre de vie." },
	{ id: "manabardescription", string: "Ici, vous pouvez changer les options de la barre de mana." },
	{ id: "bufftimersdescription", string: "Ici, vous pouvez changer les options de vos buffs personnels." },
	{ id: "dottimersdescription", string: "Ici, vous pouvez changer les paramètres des DoT." },
	{ id: "pulltimersdescription", string: "Ici, vous pouvez changer les paramètres du minuteur de Pull." },
	{ id: "stacksbardescription", string: "Ici, vous pouvez changer les paramètres de vos barres de stacks" },
	{ id: "raidbuffdescription", string: "Ici, vous pouvez changer les paramètres des buffs de raid (DPS Buffs/Debuffs seulement)." },
	{ id: "mitigationdescription", string: "Ici, vous pouvez changer les paramètres de votre barre de mitigation." },
	{ id: "customcooldownsdescription", string: "Here you can set your options for your custom cooldowns." },
	{ id: "editcustomcooldownsdescription", string: "Here you can edit custom cooldown abilities." },
	{ id: "partydescription", string: "Here you can set your options for your party cooldowns." },
	{ id: "overridedescription", string: "Ici, vous pouvez changer certains paramètres par défaut pour toutes les compétences." },
	{ id: "importexportdescription", string: "Ici, vous pouvez importer ou exporter vos paramètres." },
	{ id: "debugdescription", string: "Here you can find debug options for ZeffUI." },
	// COMPONENT PROPERTIES
	{ id: "posx", string: "Position X" },
	{ id: "posy", string: "Position Y" },
	{ id: "scale", string: "Échelle" },
	{ id: "rotation", string: "Rotation" },
	{ id: "padding", string: "Marge" },
	{ id: "color", string: "Couleur" },
	{ id: "image", string: "Image" },
	{ id: "example", string: "Exemple" },
	{ id: "growleft", string: "Dérouler les icônes vers la gauche" },
	{ id: "growdirection", string: "Sens de déroulement" },
	{ id: "down", string: "Bas" },
	{ id: "up", string: "Haut" },
	{ id: "left", string: "Gauche" },
	{ id: "right", string: "Droite" },
	{ id: "columns", string: "Colonne par ligne" },
	{ id: "hideoutofcombat", string: "Cacher quand vous êtes hors combat" },
	{ id: "hidesolo", string: "Cacher quand vous n'êtes pas dans un groupe (party)" },
	{ id: "droppedoff", string: "Cacher quand perdu" },
	{ id: "alwaysshow", string: "Toujours montrer les compétences (quand pas en recharge)" },
	{ id: "textformat", string: "Format du texte" },
	{ id: "font", string: "Police" },
	{ id: "healthtext", string: "Texte de la barre de vie" },
	{ id: "manatext", string: "Texte de la barre de mana" },
	{ id: "pulltimertext", string: "Texte du Pulltimer" },
	{ id: "bufftext", string: "Texte des Buffs" },
	{ id: "dottext", string: "Texte des DoT" },
	{ id: "multidot", string: "MultiDoT (non-implémenté)" },
	{ id: "ability", string: "Compétence" },
	{ id: "abilityenabled", string: "Activer la Compétence" },
	{ id: "duration", string: "Durée" },
	{ id: "cooldown", string: "Cooldown" },
	{ id: "overridedefaults", string: "Remplacer les paramètres par défaut" },
	{ id: "ttsenabled", string: "Activer le TTS" },
	{ id: "ttstype", string: "Type de TTS" },
	{ id: "abilitycooldown", string: "Cooldown de la compétence" },
	{ id: "abilityduration", string: "Durée de la compétence" },
	{ id: "oncast", string: "Au lancement de la compétence" },
	{ id: "durationcolor", string: "Duration Color" },
	{ id: "cooldowncolor", string: "Cooldown Color" },
	{ id: "durationoutlinecolor", string: "Duration Outline Color" },
	{ id: "cooldownoutlinecolor", string: "Cooldown Outline Color" },
	{ id: "durationbold", string: "Duration Bold Text" },
	{ id: "cooldownbold", string: "Cooldown Bold Text" },
	{ id: "durationoutline", string: "Duration Outline" },
	{ id: "cooldownoutline", string: "Cooldown Outline" },
	{ id: "includealliance", string: "Include Alliance in Party Members" },
	{ id: "orderbypartymember", string: "Order by Party Member" },
	{ id: "order", string: "Order" },
	{ id: "partyorder", string: "Party Order (drag and drop)" },
	{ id: "mode", string: "Mode" },
	{ id: "add", string: "Add" },
	{ id: "edit", string: "Edit" },
	{ id: "delete", string: "Delete" },
	{ id: "save", string: "Save" },
	{ id: "noabilitiesfound", string: "No abilities found..." },
	{ id: "search", string: "Search" },
	{ id: "id", string: "ID" },
	{ id: "jobrole", string: "Job / Role" },
	{ id: "pvp", string: "PvP" },
	// SKINS
	{ id: "skindefault", string: "Défaut (par Square Enix)" },
	{ id: "skinmaterialdark", string: "Material Dark (par skotlex)" },
	{ id: "skinmaterialdiscord", string: "Material Discord (par skotlex)" },
	// COLORS
	{ id: "colordarkred", string: "Rouge foncé" },
	{ id: "colorbrightred", string: "Rouge vif" },
	{ id: "colorbabyblue", string: "Bleu bébé" },
	{ id: "colorgreenblue", string: "Vert bleu" },
	{ id: "colortoxicgreen", string: "Vert toxic" },
	{ id: "colorlightblue", string: "Bleu clair" },
	{ id: "colordarkblue", string: "Bleu foncé" },
	{ id: "colordarkgreen", string: "Vert foncé" },
	{ id: "colorjunglegreen", string: "Vert jungle" },
	{ id: "colorpurple", string: "Violet" },
	{ id: "colorfuchsia", string: "Fuchsia" },
	{ id: "colorlightpink", string: "Rose clair" },
	{ id: "colorlightgold", string: "Doré clair" },
	{ id: "colordarkgold", string: "Doré foncé" },
	{ id: "colororange", string: "Orange" },
	{ id: "colorgrey", string: "Gris" },
	// JOBS	
	{ id: "pld", string: "Paladin" },
	{ id: "gla", string: "Gladiator" },
	{ id: "war", string: "Warrior" },
	{ id: "mrd", string: "Marauder" },
	{ id: "drk", string: "Dark Knight" },
	{ id: "gnb", string: "Gunblade" },
	{ id: "whm", string: "White Mage" },
	{ id: "cnj", string: "Conjurer" },
	{ id: "sch", string: "Scholar" },
	{ id: "ast", string: "Astrologian" },
	{ id: "mnk", string: "Monk" },
	{ id: "pgl", string: "Pugilist" },
	{ id: "drg", string: "Dragoon" },
	{ id: "lnc", string: "Lancer" },
	{ id: "nin", string: "Ninja" },
	{ id: "rog", string: "Rogue" },
	{ id: "sam", string: "Samurai" },
	{ id: "brd", string: "Bard" },
	{ id: "arc", string: "Archer" },
	{ id: "mch", string: "Machinist" },
	{ id: "dnc", string: "Dancer" },
	{ id: "blm", string: "Black Mage" },
	{ id: "thm", string: "Thaumaturge" },
	{ id: "smn", string: "Summoner" },
	{ id: "acn", string: "Arcanist" },
	{ id: "rdm", string: "Red Mage" },
	{ id: "blu", string: "Blue Mage" },
	{ id: "tank", string: "Tank" },
	{ id: "healer", string: "Healer" },
	{ id: "meleedps", string: "Melee DPS" },
	{ id: "rangeddps", string: "Physical Ranged DPS" },
	{ id: "casterdps", string: "Magic Ranged DPS" },
	{ id: "melee", string: "Melee" },
	{ id: "ranged", string: "Ranged" },
	{ id: "caster", string: "Caster" },
	// CONTEXT MENU
	{ id: "lock", string: "Verrouiller/Déverrouiller les barres" },
	{ id: "grid", string: "Activer/Désactiver la grille" },
	{ id: "settings", string: "Paramètres" },
	{ id: "close", string: "Fermer"	}
];