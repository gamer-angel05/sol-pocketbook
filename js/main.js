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
			if (article.Text) {
				add_dropdownmenu("--" + article.Article, article_index);
				article.Text = substitute_tags(article.Text, tags);
				add_content(article.Article, article.Text, article_index);
			};
		});
	});
}


function substitute_tags(text, tags) {
	let matches = text.match(/\[(.*?)\]/);

	if (matches && tags) {
		let result = "";
		let label = matches[1].split(":", 2);

		switch (label[0]) {
			case 'image':
				result = get_image(tags.shift());
				break;
			case 'link':
				result = get_link(tags.shift(), label[1]);
				break;
		}
		text = text.replace(/\[(.*?)\]/, result);
		return substitute_tags(text, tags);
	}
	return text
}

function get_image(url) {
	return '<a href="' + url + '" data-toggle="lightbox"><img src="' + url + '" class="img-max" /></a>';
}

function get_link(url, title) {
	return '<a target="_blank" href="' + url + '">' + (title || url || "link") + '</a>';
}

function add_dropdownmenu(title, index) {
	let link = '<a class="dropdown-item" href="#' + index + '">' + title + '</a>';
	$("#scroll_dropmenu").append(link);
}

function add_content(title, content, index) {
	var s = '<h4 id="' + index + '">' + title + '</h4>';
	s += '<p style="white-space: pre-wrap;">' + content + '</p></br>';
	$("#scroll_content").append(s);
}


$(document).on('click', '[data-toggle="lightbox"]', function(event) {
                event.preventDefault();
                $(this).ekkoLightbox();
            });


$(document).ready(__init__);
