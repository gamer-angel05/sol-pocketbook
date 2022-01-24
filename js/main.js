let publicSpreadsheetDoc = "https://opensheet.elk.sh/1-XABpNzY6jgg_Bh9KaDKS-pPNgGF22d_yAxqKOAM6RI/FoE%20Tips"; // opensource redirect for google sheet w/o auth

function __init__() {
	/*	Load the public sheet data and cache it.
	*/
	fetch(publicSpreadsheetDoc)
	.then( response => response.json())
	.then( data => {
		add_data(data);
	});
}

function add_data(documentation) {
	/*	Add the data to drop menu and scroll
	*/
	let topics = documentation.map(({Topic}) => Topic);

	documentation.forEach((entry, index) => {
		let topic_index = topics.indexOf(entry.Topic)
		let article_index = topic_index + "." + index
		let tags = entry.Tags ? entry.Tags.replace(/\n/g, "").split(",") : [];
		add_dropdownmenu(entry.Article, article_index);
		add_content(entry.Article, entry.Text, article_index);
	})

	/*documentation.filter((c, index) => documentation.indexOf(c.Topic) === index);
	console.log(topics)
	documentation.forEach((entry, index) => {
		add_dropdownmenu(entry.Title, index);
		add_content(entry.Title, entry.Text, entry.Images, index);
	});*/
}

function add_dropdownmenu(title, index) {
	let link = '<a class="dropdown-item" href="#' + index + '">' + title + '</a>';
	$("#scroll_dropmenu").append(link);
}

function add_content(title, content, index) {
	var s = '<h4 id="' + index + '">' + title + '</h4>';
	s += '<p>' + content + '</p>';
	/*if (images) {
		s += '<img src="'+ images + '"/>'
	}*/
	s += "</br></br>"
	$("#scroll_content").append(s);
}

$(document).ready(__init__);
