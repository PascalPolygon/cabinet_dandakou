module.exports = {
    escapeHTMLtag: function (str, tag) {
        console.log('str in tools: ' + str);
        var start_delimiter = '<' + tag + '>';
        var end_delimiter = '</' + tag + '>';
        str = str.split(start_delimiter);
        console.log(str);
        str = str[1].split(end_delimiter);
        var myStr = str[0];
        console.log(myStr);
        return myStr;
    }
}

// module.exports = {
//     deriveFieldFrom: function (className) {
//         console.log('Class name before process: ' + className);
//         var fieldName = className.split('.editable-');
//         console.log('Derived field: ' + filedName);
//         return fieldName;
//     }
// }
// function escapeHTMLtag(str, tag) {
//     console.log('str in tools: ' + str);
//     var start_delimiter = '<' + tag + '>';
//     var end_delimiter = '</' + tag + '>';
//     str = str.split(start_delimiter);
//     console.log(str);
//     str = str[1].split(end_delimiter);
//     var myStr = str[0];
//     console.log(myStr);
//     return myStr;
// }


// export { escapeHTMLtag, deriveFieldFrom };