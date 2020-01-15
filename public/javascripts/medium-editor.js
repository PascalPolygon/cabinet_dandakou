console.log('Inside medium editor');
var toolbar = {
    /* These are the default options for the toolbar,
           if nothing is passed this is what is used */
    allowMultiParagraphSelection: true,
    buttons: ["bold", "italic", "underline", "anchor", "h2", "h3", "quote"],
    diffLeft: 0,
    diffTop: -10,
    firstButtonClass: "medium-editor-button-first",
    lastButtonClass: "medium-editor-button-last",
    relativeContainer: null,
    standardizeSelectionStart: false,
    static: false,
    /* options which only apply when static is true */
    align: "center",
    sticky: false,
    updateOnEmptySelection: false
}

const editable_content = [
    ".editable-business-name",
    ".editable-big-title",
    ".editable-subt-title",
    ".editable-nos-valeurs-title",
    ".editable-nos-valeurs-subt-title",
    ".editable-valeur-1-title",
    ".editable-valeur-1",
    ".editable-valeur-2-title",
    ".editable-valeur-2",
    ".editable-valeur-3-title",
    ".editable-valeur-3",
    ".editable-clients-title",
    ".editable-clients-1-title",
    ".editable-clients-1",
    ".editable-clients-2-title",
    ".editable-clients-2",
    ".editable-clients-3-title",
    ".editable-clients-3",
    ".editable-clients-4-title",
    ".editable-clients-4",
    ".editable-clients-5-title",
    ".editable-clients-5",
    ".editable-clients-6-title",
    ".editable-clients-6",
    ".editable-blog-title",
    ".editable-contactez-nous",
    ".editable-business-location",
    ".editable-business-hours",
    ".editable-business-phone-number",
    ".editable-footer-business-name",
    ".editable-footer-business-recap",
    ".editable-business-services-title",
    ".editable-service-1",
    ".editable-service-2",
    ".editable-service-3",
    ".editable-service-4",
    ".editable-liens-utils-title",
    ".editable-lien-1",
    ".editable-lien-2",
    ".editable-lien-3",
    ".editable-lien-4",
    ".editable-contact-title",
    ".editable-location",
    ".editable-email",
    ".editable-phone-number",
    ".editable-fax-number"
];



var editor_handles = new Array(editable_content.length); //store new MediumEditor call return in this array

for (let i = 0; i < editable_content.length; i++) {
    editor_handles[i] = createEditorObject(editable_content[i]);
}


$("#saveBtn").click(function() {
    console.log('Click!');

    var content = {};

    for (let i = 0; i < editable_content.length; i++) {
        content[deriveFieldFrom(editable_content[i])] = editor_handles[i].getContent();
        //Derives content object field name from editable content and assigns matching value
    }
    if (content.business_name[0] == '<') //Check if you need to escape it. (p tags are only added if you edit)
        content.business_name = escapeHTMLtag(content.business_name, 'p');
    // content.business_name = escapeHTMLtag(content.business_name, "p");
    console.log(content);
    //last 4 fields need to be tag espaced before being written to database
    // console.log(content.location);
    // content.location = escapeHTMLtag(content.location, 'i');
    // content.email = escapeHTMLtag(content.email, 'i');
    // content.phone_number = escapeHTMLtag(content.phone_number, 'i');
    // content.fax_number = escapeHTMLtag(content.fax_number, 'i');

    // console.log('After escaping last 3 fields:');
    // console.log(content);

    // console.log(content.business_name);

    var contentJson = JSON.stringify(content);
    $.ajax({
        type: "POST",
        url: '/Admin/dashboard',
        // contentType: 'application/json',
        data: {
            content: contentJson
        }
    }).done(function(res) {
        if (res.success) {
            alert('Website updated!');
            // window.location.reload();
        } else {
            console.log('error...ajax');
        }
    });
});

function createEditorObject(className) {
    return new MediumEditor(className, {
        toolbar
    });
}

function deriveFieldFrom(className) {
    // console.log('Class name before process: ' + className);
    var fieldName = className.split('.editable-');
    // console.log('Derived field: ' + fieldName[1]);
    //replace dashes with underscore
    fieldName = replaceDashWithUnderscore(fieldName[1]);

    return fieldName;
}

function replaceDashWithUnderscore(string) {
    string = string.split('-');
    return string.join('_');;
}

function escapeHTMLtag(str, tag) {
    if (str == "") return str; //return if the string is empty
    console.log('str in tools: ' + str);
    str = str.split("<" + tag + ">");
    //str = str.split(/>(.+)/)[1]; //splits at first occurence of >
    // str = str.split(/>(.+)/)[1]
    //str.replace(/\>/, '&').split('&')
    console.log('After first split: ' + str);
    str = str[1];
    console.log('Before 148: ' + str);
    str = str.split('</' + tag + '>');
    return str[0] + str[1]
}