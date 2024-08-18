/**
 * Convert the given string of tags with values separated by a comma to 
 * be converted into an array.
 * @param {string} tagsStr the string values separated by comma
 * @returns array of tags
 */
function convertTagsToArray(strTags)
{
    return (strTags) ? strTags.replace(/\n/g, "").split(",") : [];
}

/**
 * Convert the given string spaces to hyphen.
 * @param {string} str the given string
 * @returns the update string
 */
function convertSpaceToHyphen(str)
{
    return str.replace(/ /g, "-");
}
