class formatData {
    constructor(documentation) {
        this.addData(documentation);
    }

    addData(documentation) {
        /*  Add the data to drop menu and scroll
            set the footer as well.
        */
        let topics = [...new Set(documentation.filter(({Topic}) => Topic && Topic !== 'Footer').map(({Topic}) => Topic))];
        let footer = documentation.find(({Topic}) => Topic === 'Footer');

        footer.Tags = footer.Tags ? footer.Tags.replace(/\n/g, "").split(",") : [];
        footer.Text = this.substituteTags(footer.Text, footer.Tags);
        $('footer').text(footer.Text);

        topics.forEach((topic, topic_index) => {
            let article_href = topic.replace(/ /g, "-").toLowerCase();

            this.addDropDownMenu(topic, article_href);
            $('section').append('<h2 id="' + article_href + '">' + topic + '</h2>');

            documentation.filter((article) => article.Topic === topic && article.Text)
            .forEach((article, index) => {
                let href = article_href;
                article.Tags = article.Tags ? article.Tags.replace(/\n/g, "").split(",") : [];

                if (article.Article) {
                    href += "-" + article.Article.replace(/ /g, "-").toLowerCase();
                    this.addDropDownMenu("—" + article.Article, href);
                }
                article.Text = this.substituteTags(article.Text, article.Tags);
                this.addContent(article.Article, article.Text, href);
            })
            $('section').append('<hr class="divider">');
        })
    }

    substituteTags(text, tags) {
        let matches = text.match(/\[(.*?)\]/);

        if (matches && tags) {
            let result = '';
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
        return text;
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
        $('section').append(string);
    }
}
