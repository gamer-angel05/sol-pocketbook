var MAX_ENCOUNTERS = undefined;
var MIN_ENCOUNTERS = undefined;
var MAX_FPS = undefined;
var TOTAL_FPS = undefined;
var RELOAD_INFO = false;
var __instance__ = undefined;
let publicSpreadsheetUrl = "https://opensheet.elk.sh/1-XABpNzY6jgg_Bh9KaDKS-pPNgGF22d_yAxqKOAM6RI/GE%20Lotto"; // opensource redirect for google sheet w/o auth
let publicSpreadsheetDoc = "https://opensheet.elk.sh/1-XABpNzY6jgg_Bh9KaDKS-pPNgGF22d_yAxqKOAM6RI/Documentation";
var publicSheet = undefined;
var documentation = undefined;


function __init__() {
	/*	Load the public sheet data and cache it. Reload the data by using the Refresh button.
		This is to avoid pinging the limited api. 
	*/
	$('[data-toggle="tooltip"]').tooltip({trigger : 'hover'})

	/*fetch(publicSpreadsheetDoc)
	.then( response => response.json())
	.then( data => {
		documentation = data;
	});

	fetch(publicSpreadsheetUrl)
    .then( response => response.json())
    .then( data => {
    	console.log(data);
    	publicSheet = data;
	    let donors = publicSheet.filter((e) => e.Donations && e.Donations > 0);
	    let players = publicSheet.filter((e) => e.Encounters && e.Encounters > 0);
	    __instance__ = new Generate(donors, players);
	    show_info();
	    setRefreshButtonTooltip();
    });*/
}


class Generate {
	#donors;
	#players;

	fps = 0;
	players_filtered = undefined;
	players_selection = [];
	winner_list = [];

	constructor(donors, players) {
		this.#donors = donors;
		this.#players = players;
		
		this.shuffle();
	}
	set_donors(donors) {
		this.#donors 
	}

	get_donors() {
		return this.#donors;
	}

	get_players() {
		return this.#players;
	}

	shuffle() {
		this.fps = Math.min(MAX_FPS, TOTAL_FPS);
		this.players_filtered = this.#players.filter((e) => e.Building && e.Encounters > Number(MIN_ENCOUNTERS));
		this.players_selection = this.players_filtered.map(({Member}) => Member);
		this.shuffle_donors();
		this.shuffle_players();
	}

	shuffle_donors() {
		shuffle(this.#donors);
	}

	shuffle_players() {
		shuffle(this.players_selection);
	}

	get_winners() {
		this.winner_list = []
		this.get_winner()

		return this.assign_donors();
	}

	get_winner() {
		/*	Will loop until there is no more fps available.
			max can be updated with a capped value, meaning
			this is the max fps awarded per person. */
		const result = choice(this.players_selection);
		const winner = this.players_filtered.find(({ Member }) => Member === result);
		const winner_encounters = winner.Encounters;
		var winner_fps = Math.min(MAX_ENCOUNTERS, winner_encounters);

		if (this.fps < winner_fps) { // last winner
			winner_fps = this.fps;
		};

		//console.log(result + " / " + winner_encounters + " encounters / " + winner_fps + " fps");
		this.winner_list.push({"name": result, "building": winner.Building, "remain_fps": winner_fps, "total_fps": winner_fps, "donors": []});
		this.fps -= winner_fps;
		this.players_selection = this.players_selection.filter((e) => e !== result);
		add_row_table(result + " is awarded " + winner_fps + " FP", "#table_lotwinners");

		if (this.fps > 0 && this.players_selection.length) {
			return this.get_winner();
		}
	}

	assign_donors() {
		/* 	Donors are shuffled in case there is too many FPs
			available for the number of winners. 
		*/
		for (let i = 0; i < this.#donors.length; i++) {
			const donor = this.#donors[i];
			var fps_available = donor.Donations;
			var is_assigned = false;
			
			this.winner_list.forEach((winner, index) => {
				if (fps_available > 0 && winner.remain_fps > 0) {

					if (donor.Member.toLowerCase() == winner.name.toLowerCase()) {
						is_assigned = index === this.winner_list.length - 1
					} else {
						const fps_donate = Math.min(fps_available, winner.remain_fps);
						winner.donors.push([donor.Member, fps_donate]);
						winner.remain_fps -= fps_donate;
						fps_available -= fps_donate;
						is_assigned = true;
					};
				};
			});

			if (!is_assigned) {
				break;
			};
		};
	}

	get_assigned_donors() {
		/* pretty print the results
		*/
		const donor_list = {};

		this.winner_list.forEach((winner) => {
			winner.donors.forEach((donor) => {
				let donor_name = donor[0]
				
				if (!(donor_name in donor_list)) {
					donor_list[donor_name] = [];
				}
				donor_list[donor_name].push({"to": winner.name, "fps": donor[1], "building": winner.building});
				//donor_list[donor_name].push(donor_name + " -> " + winner.name + " : [" + donor[1] + "] FPs");
			});
		});

		for (const [key, value] of Object.entries(donor_list)) {
			value.forEach((donation) => {
				add_row_table(key + " pays " + donation.fps + " FP on " + donation.to + "'s " + donation.building, "#table_lotdonors");
			});
		}
	}
}

function load_encounter_input() {
	/*	Load values from form 
	*/
	old_max_encounters = MAX_ENCOUNTERS;
	old_min_encounters = MIN_ENCOUNTERS;
	old_max_fps = MAX_FPS;

	MAX_ENCOUNTERS = $("#inputMaxEncounters").val() || $("#inputMaxEncounters").attr("placeholder");;
	MIN_ENCOUNTERS = $("#inputMinEncounters").val() || $("#inputMinEncounters").attr("placeholder");
	MAX_FPS = $("#inputMaxFPs").val() || TOTAL_FPS;

	if (old_max_encounters !== MAX_ENCOUNTERS || old_min_encounters !== MIN_ENCOUNTERS || old_max_fps !== MAX_FPS) {
		RELOAD_INFO = true;
	}
}

function handleLotteryClick() {
	/* 	Reset tables and start the lottery process 
	*/
	load_encounter_input();
	$("#table_lotwinners tbody tr").remove();
	$("#table_lotdonors tbody tr").remove();
	
	__instance__.shuffle();
	__instance__.get_winners();
	__instance__.get_assigned_donors();

	$("#tables_lottery").css("display", "");
}

function handleInfoClick() {
	/*	Display the basic informations that is used
		in the shuffle for transparency 
	*/
	load_encounter_input();
	let tables_info = $("#tables_info");
	let info_button = $("#info_button")

	if (tables_info.css("display") === "none") {
		tables_info.css("display", "");
		info_button.text("Less Info");
	} else {
		tables_info.css("display", "none");
		info_button.text("More Info");
	};

	if (RELOAD_INFO) {
		show_info();
		RELOAD_INFO = false;
	};
	
}

function handleReloadData() {
	/*	Reload data from the sheet, so erase all loaded data
		and re-init everything as if first run. 
	*/
	//$("#table_lotwinners tbody tr").remove();
	//$("#table_lotdonors tbody tr").remove();
	$("#tables_info tbody tr").remove();
	$("#tables_lottery tbody tr").remove();
	$("#tables_info").css("display", "none");
	$("#info_button").text("More Info");
	$("#tables_lottery").css("display", "none");
	$("#create_post_area").text("");
	$("#create_post").css("display", "none");
	
	__init__();
}

function handleCreatePost() {
	/* Copy pasta to create the info post.
		Intro buildings
		Buildings
		Intro donors
		Donors
	*/
	let buildings_doc = documentation.find(o => o.Title === "intro-ge-buildings");
	let buildings2_doc = documentation.find(o => o.Title === "intro-ge-buildings2");
	let donors_doc = documentation.find(o => o.Title == "intro-ge-donors");
	var text = "";
	// Buildings
	text += buildings_doc.Text + "\n";
	$("#table_buildings tbody tr").each((idx, tr) => {
		text += "\n" + tr.innerText;
	});
	text += "\n\n";
	text += buildings2_doc.Text + "\n\n";
	// Donors
	text += donors_doc.Text + "\n"
	$("#table_donors tbody tr").each((idx, tr) => {
		text += "\n" + tr.innerText;
	});
	$("#create_post_area").val(text);
	$("#create_post").css("display", "");
}

function copyTextArea(el) {
	/* Copy text area, via button click.
	*/
	var urlField = document.getElementById(el);
	urlField.select();
	document.execCommand('copy');
}

function copyTable(el) {
	/*	Copy tables, via button click.
	*/
    var urlField = document.getElementById(el);
    var range = document.createRange();
    range.selectNode(urlField);
    window.getSelection().addRange(range);
    document.execCommand('copy');
}

  

function add_to_table(player, values, table, style=undefined) {
	var tbody = $(table).children('tbody');
	var tr = "<tr"

	if (style) {
		tr += " class=" + style
	}
	tr += "><td>" + player + "</td>"

	values.forEach((e) => tr += "<td>" + e + "</td>");
	tbody.append(tr + "</tr>");
}

function add_row_table(value, table, style=undefined) {
	var tbody = $(table).children('tbody');
	var tr = "<tr"

	if (style) {
		tr += " class=" + style
	}
	tr += ">" + "<td>" + value + "</td>";
	tbody.append(tr + "</tr>")
}

function show_info() {
	/*	Fill info tables
	*/
	$("#tables_info tbody tr").remove();
	load_encounter_input();

	__instance__.get_players().forEach((e) => {
		add_to_table(e.Member, [e.Building || "", e.Encounters], "#table_players", e.Building && e.Encounters > MIN_ENCOUNTERS && "table-success");
		if (e.Building) {
			add_to_table(e.Member, [e.Building], "#table_buildings");
		}
	});

	__instance__.get_donors().forEach((e) => {
		add_to_table(e.Member, [e.Donations + " FP"], "#table_donors");
	});
}

var refreshButtonTooltipFormat;
function setRefreshButtonTooltip() {
	const $refreshButton = $("#refresh_button");
	if (refreshButtonTooltipFormat === undefined ||
		refreshButtonTooltipFormat === "") {
		refreshButtonTooltipFormat = $refreshButton.attr("data-original-title");
	}
	let donors = __instance__.get_donors();
	TOTAL_FPS = donors.reduce((total, n) => total + Number(n.Donations), 0);
	$refreshButton.attr("title", refreshButtonTooltipFormat.format(__instance__.get_players().length, donors.length, TOTAL_FPS))
				  .tooltip("_fixTitle");

	$("#fps_available").text("FP available: " + TOTAL_FPS);
}

$(document).ready(__init__);
