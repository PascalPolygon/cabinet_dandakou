// var inputs = document.querySelectorAll('#jumboImg');
const uploadablelImages = [
    "jumboImg",
    "client1Img",
    "client2Img",
    "client3Img",
    "client4Img",
    "client5Img",
    "client6Img",
];

for (let i = 0; i < uploadablelImages.length; i++) {
    initImageSelection(uploadablelImages[i]);
}

// $('#jumboImg').on('change', function() {
//     var jumboImg = this.files[0];
//     console.log(jumboImg);
//     var fileSize = jumboImg.size / 1024;
//     var roundedFileSize = Math.round(fileSize * 10) / 10;
//     $('#uploadJumboImg').html('<i class="fas fa-upload"></i> ' + 'Upload <strong>' + jumboImg.name + "</strong> (" + roundedFileSize + ") kb");
//     $('#uploadJumboImg').fadeIn();

// });

function initImageSelection(imageId) {
    $('#' + imageId).on('change', function() {
        var img = this.files[0];
        console.log(img);
        var fileSize = img.size / 1024;
        var roundedFileSize = Math.round(fileSize * 10) / 10;
        $('#upload_' + imageId).html('<i class="fas fa-upload"></i> ' + 'Upload <strong>' + img.name + "</strong> (" + roundedFileSize + ") kb");
        $('#upload_' + imageId).fadeIn();
    })
}