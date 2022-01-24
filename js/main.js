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
	let topics = [...new Set(documentation.map(({Topic}) => Topic))];

	topics.forEach((topic, topic_index) => {
		add_dropdownmenu(topic, topic_index);
		$("#scroll_content").append("<h2 id=" + topic_index + ">" + topic + "</h2>");

		let articles = documentation.filter((e) => e.Topic === topic);
		articles.forEach((article, index) => {
			let article_index = topic_index + "." + index;
			let tags = article.Tags ? article.Tags.replace(/\n/g, "").split(",") : [];
			add_dropdownmenu("--" + article.Article, article_index);
			console.log(article.Text);
			add_content(article.Article, article.Text, article_index);
		});
	});
}


function create_link() {}

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
	s += "</br>"
	$("#scroll_content").append(s);
}

$(document).ready(__init__);
