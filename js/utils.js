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