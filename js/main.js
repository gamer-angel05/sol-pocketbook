let publicSpreadsheetDoc = "https://opensheet.elk.sh/1-XABpNzY6jgg_Bh9KaDKS-pPNgGF22d_yAxqKOAM6RI/Documentation"; // opensource redirect for google sheet w/o auth

function __init__() {
	/*	Load the public sheet data and cache it.
	*/
	fetch(publicSpreadsheetDoc)
	.then( response => response.json())
	.then( data => {
		add_data(data.filter((e) => e.Title));
	});
}

function add_data(documentation) {
	/*	Add the data to drop menu and scroll
	*/
	documentation.forEach((entry, index) => {
		add_dropdownmenu(entry.Title, index);
		add_content(entry.Title, entry.Text, entry.Images, index);
	});
}

function add_dropdownmenu(title, index) {
	let link = '<a class="dropdown-item" href="#' + index + '">' + title + '</a>';
	$("#scroll_dropmenu").append(link);
}

function add_content(title, content, images, index) {
	var s = '<h4 id="' + index + '">' + title + '</h4>';
	s += '<p>' + content + '</p>';
	if (images) {
		s += '<img src="'+ images + '"/>'
	}
	$("#scroll_content").append(s);
}

$(document).ready(__init__);
