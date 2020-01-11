module.exports = {
    escapeHTMLtag: function(str, tag) {
        console.log('str in tools: ' + str);
        str = str.split(/>(.+)/); //splits at first occurence of >
        console.log(str);
        // var str0 = str[0];
        str = str[1];
        str = str.split('</' + tag + '>');
        console.log(str[0] + str[1]);
        return str[0] + str[1]
    }
}