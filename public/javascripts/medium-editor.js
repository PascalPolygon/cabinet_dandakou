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
var editor = new MediumEditor(".editable", {
    toolbar
});

var editor1 = new MediumEditor(".editable1", {
    toolbar
});

var editor2 = new MediumEditor(".editable2", {
    toolbar
});



$("#saveBtn").click(function () {
    console.log('Click!');
    var content = editor.getContent();
    console.log(content);
    var content1 = editor1.getContent();
    console.log(content1);
    var content2 = editor2.getContent();
    console.log(content2);


    // $.ajax({
    //     type: "POST",
    //     url: '/Admin/dashboard',  
    //     data: {
    //         content: logoContent
    //     },
    // }).done(function (res) {
    //     if (res.success) {
    //         alert('Website updated!');
    //         // window.location.reload();
    //     } else {
    //         console.log('error...ajax');
    //     }
    // });
}); 
