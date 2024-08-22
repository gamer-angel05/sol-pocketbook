/**
 * Format the sheet data for web presentation.
 */
class formatData
{
    constructor(documentation)
    {
        this.addData(documentation);
    }

    /**
     * Add the data to drop menu and scroll.
     * Set the footer as well and latest articles.
     * @param {object} documentation 
     */
    addData(documentation) 
    {
        // Process the footer
        const article = documentation.find(({Topic}) => Topic === "Footer");
        this.setFooter(article);

        // Get unique topics, create the articles and ignore footer
        const topics = [...new Set(documentation.map(({Topic}) => Topic))];
        topics.splice(topics.indexOf("Footer"), 1);
        topics.forEach((topic) => {

            // Add dropdown topic entry
            let articleHref = convertSpaceToHyphen(topic).toLowerCase();
            this.addDropDownMenu(topic, articleHref);

            // Add topic titles and their related articles
            $('#content').append(`<h2 id="${articleHref}">${topic}</h2>`);
            documentation.filter((article) => article.Topic === topic && article.Text).forEach((article) => {this.setArticle(article, articleHref)})
            $("#content").append("<hr>");
        })

        this.setLatestArticles(documentation);
    }

    /**
     * Add the topic or article entry to the section dropdown.
     * @param {string} title the title entry
     * @param {string} href the topic or article href
     */
    addDropDownMenu(title, href)
    {
        $("#scroll-dropmenu").append(`<li><a class="dropdown-item" href="#${href}">${title}</a></li>`);
    }
    /**
     * Set the latest articles section
     * @param {object} documentation 
     */
    setLatestArticles(documentation)
    {
        const container = $("#latest-articles");
        container.append("<h2>Last Updates</h2>");
        
        // Sort the articles by timestamp and grab the last 5.
        documentation.sort((a, b) => {
            const parsedA = Date.parse(a.Timestamp);
            const parsedB = Date.parse(b.Timestamp);

            if (parsedA > parsedB) return -1;
            else if (parsedA < parsedB) return 1;
            else return 0;
        })
        .slice(0, 5)
        .forEach((article) => {
            container.append(`<a href="#${article.Href}">${article.Topic}${(article.Article) ? ": " + article.Article : ""}</a><br>`);
        })
    }
    /**
     * Set the footer text.
     * @param {object} article the given article object
     */
    setFooter(article)
    {
        article.Tags = convertTagsToArray(article.Tags);
        article.Text = this.replaceTags(article.Text, article.Tags);
        $("footer > div:first-child").text(article.Text);
    }
    /**
     * Set the article, convert tags and content to display.
     * @param {object} article the given article object
     * @param {string} href the topic article href
     */
    setArticle(article, href)
    {
        article.Tags = convertTagsToArray(article.Tags);

        // Add dropdown article entry
        if (article.Article) {
            href += "-" + convertSpaceToHyphen(article.Article).toLowerCase();
            this.addDropDownMenu("—" + article.Article, href);
        }

        article.Text = this.replaceTags(article.Text, article.Tags);
        this.addContent(article.Article, article.Text, href);

        // Update documentation article with new href
        article.Href = href;
    }

    /**
     * Replace the tags in the given text with the tag values.
     * @param {string} text the text containing the tags
     * @param {array} tags the array of values for the tags
     * @returns the text with the tags replaced by their values
     */
    replaceTags(text, tags)
    {
        function getImage(url, caption) 
        {
            if (typeof(url) === "string") {
                return `<a href="${url}" data-toggle="lightbox" data-caption="${caption || ""}"><img src="${url}" class="img-max img-fluid"></a>`;
            } 
            else {
                return "";
            }
        }
        function getLink(url, title) 
        {
            title = title || url || "link";
            
            if (url) {
                return `<a title="${title}" ${(url.startsWith("#")) ? "" : 'target="_blank"'} href="${url}">${title}</a>`;
            }
            else {
                return title;
            }
        }
        // Replace all instances of brackets [text] with the appropriate substitution
        return text.replace(/\[(.*?)\]/g, function(match, p1) {
            const label = p1.split(":", 2);
            let result = "";
            
            switch (label[0]) {
                case "image":
                    result = getImage(tags.shift(), label[1]);
                    break;
                case "link":
                    result = getLink(tags.shift(), label[1]);
                    break;
                case "author":
                    result = `<span author>${label[1]}</span>`;
                    break;
            }
            return result;
        })
    }

    addContent(title, content, href)
    {
        // Create section
        const section = $("<section></section");
        $("#content").append(section);

        // Set the title
        if (title) {
            section.append(`<h4 id="${href}">${title}</h4>`);
        }

        // Set the content
        const filterTags = ["ul", "ol", "table", "h5", "h6"].join("|");
        const re = new RegExp(String.raw`(\<(?:${filterTags})[^\>]*\>[\s\S]*\<\/(?:${filterTags})\>)`, "g");

        for (let chunk of content.split(re)) {
            // Element
            if (re.test(chunk)) {
                let el = $(chunk);

                if (el.get(0).localName === "table") {
                    el = $(`<div class="table-wrapper"></div>`).append(el);
                }
                section.append(el);
            }
            // Paragraph
            else { 
                if (chunk.trim() === "") continue;

                section.append(`<p style="white-space: pre-wrap;">${chunk.trim()}</p>`);
            }
        }
    }
}
