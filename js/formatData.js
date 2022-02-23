class formatData {
    constructor(documentation) {
        this.addData(documentation);
    }

    addData(documentation) {
        /*  Add the data to drop menu and scroll
        */
        let topics = [...new Set(documentation.map(({Topic}) => Topic))];

        topics.forEach((topic, topic_index) => {
            if (!topic) return;

            let article_href = topic.replace(/ /g, "-").toLowerCase();
            this.addDropDownMenu(topic, article_href);
            $('#scroll-content').append('<h2 id="' + article_href + '">' + topic + '</h2>');

            let articles = documentation.filter((e) => e.Topic === topic);
            articles.forEach((article, index) => {
                let tags = article.Tags ? article.Tags.replace(/\n/g, "").split(",") : [];

                if (article.Text) {
                    let href = article_href;

                    if (article.Article) {
                        href += "-" + article.Article.replace(/ /g, "-").toLowerCase();
                        this.addDropDownMenu("—" + article.Article, href);
                    };
                    article.Text = this.substituteTags(article.Text, tags);
                    this.addContent(article.Article, article.Text, href);
                }
            })
            $('#scroll-content').append('<hr class="divider">');
        });
    }

    substituteTags(text, tags) {
        let matches = text.match(/\[(.*?)\]/);

        if (matches && tags) {
            let result = "";
            let label = matches[1].split(':', 2);

            switch (label[0]) {
                case 'image':
                    result = this.getImage(tags.shift());
                    break;
                case 'link':
                    result = this.getLink(tags.shift(), label[1]);
                    break;
            }
            text = text.replace(/\[(.*?)\]/, result);
            return this.substituteTags(text, tags);
        }
        return text
    }

    getImage(url) {
        if (!url) return '';

        return '<a href="' + url + '" data-toggle="lightbox"><img src="' + url + '" class="img-max" /></a>';
    }

    getLink(url, title) {
        if (!url) return title;

        if (url.startsWith('#')) {
            return '<a href="' + url + '">' + (title || url || "link") + '</a>';
        }
        return '<a target="_blank" href="' + url + '">' + (title || url || "link") + '</a>';
    }

    addDropDownMenu(title, index) {
        let link = '<a class="dropdown-item" href="#' + index + '">' + title + '</a>';
        $('#scroll-dropmenu').append(link);
    }

    addContent(title, content, index) {
        var string = title ? '<h4 id="' + index + '">' + title + '</h4>' : '';
        string += '<p style="white-space: pre-wrap;">' + content + '</p>';
        $('#scroll-content').append(string);
    }
}
