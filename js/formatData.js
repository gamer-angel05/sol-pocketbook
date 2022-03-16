class formatData {
    constructor(documentation) {
        this.addData(documentation);
    }

    addData(documentation) {
        /*  Add the data to drop menu and scroll
            set the footer as well and latest articles.
        */
        let footer = documentation.find(({Topic}) => Topic === 'Footer');
        footer.Tags = footer.Tags ? footer.Tags.replace(/\n/g, "").split(",") : [];
        footer.Text = this.substituteTags(footer.Text, footer.Tags);
        $('footer').text(footer.Text);

        documentation = documentation.filter(({Topic}) => Topic && Topic !== 'Footer');
        $('#scroll-content').append('<hr class="divider">');

        let topics = [...new Set(documentation.map(({Topic}) => Topic))];
        topics.forEach((topic, topic_index) => {
            let articleHref = topic.replace(/ /g, "-").toLowerCase();

            this.addDropDownMenu(topic, articleHref);
            $('#scroll-content').append('<h2 id="' + articleHref + '">' + topic + '</h2>');

            documentation.filter((article) => article.Topic === topic && article.Text)
            .forEach((article, index) => {
                let href = articleHref;
                article.Tags = article.Tags ? article.Tags.replace(/\n/g, "").split(",") : [];

                if (article.Article) {
                    href += "-" + article.Article.replace(/ /g, "-").toLowerCase();
                    this.addDropDownMenu("—" + article.Article, href);
                }
                article.Text = this.substituteTags(article.Text, article.Tags);
                this.addContent(article.Article, article.Text, href);

                // update documentation with href
                article.Href = href;
            })
            $('#scroll-content').append('<hr class="divider">');
        })

        // Latest articles section
        const latestArticles = $('#latest-articles');
        latestArticles.append('<h2>Last Updated</h2>');
        documentation.sort((a, b) => {
            const parsedA = Date.parse(a.Timestamp);
            const parsedB = Date.parse(b.Timestamp);

            if (parsedA > parsedB) return -1;
            if (parsedA < parsedB) return 1;
            
            return 0;
        })
        .slice(0, 5)
        .forEach((article) => {
            latestArticles.append('<a href="#' + article.Href + '">' + article.Topic + (article.Article ? ' - ' + article.Article : '') + '</a><br>');
        })
    }

    substituteTags(text, tags) {
        let matches = text.match(/\[(.*?)\]/);

        if (matches && tags) {
            let result = '';
            let label = matches[1].split(':', 2);

            switch (label[0]) {
                case 'image':
                    result = this.getImage(tags.shift(), label[1]);
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

    getImage(url, caption) {
        let image = '';

        if (!url) return image;

        if (caption) { // since figure can't exist within text, close and open paragraph around the figure
            image = '</p><figure class="figure"><a href="' + url + '" data-toggle="lightbox" data-max-width="800" data-footer="' + caption + '"><img title="help-image" src="' + url + '" class="figure-img img-fluid"></a><figcaption class="figure-caption text-center">' + caption + '</figcaption></figure><p style="white-space: pre-wrap;">';
        } else {
            image = '<a href="' + url + '" data-toggle="lightbox" data-max-width="800"><img title="help-image" src="' + url + '" class="img-max img-fluid" ></a>';
        }
        return image;
    }

    getLink(url, title) {
        title = title || url || "link";
        
        if (!url) return title;

        if (url.startsWith('#')) {
            return '<a title="' + title + '" href="' + url + '">' + title + '</a>';
        }
        return '<a title="' + title + '" target="_blank" href="' + url + '">' + title + '</a>';
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
