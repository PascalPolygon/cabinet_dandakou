// var inputs = document.querySelectorAll('#jumboImg');
$('#jumboImg').on('change', function() {
    var jumboImg = this.files[0];
    console.log(jumboImg);
    // $('label#jumboImg').innerHTLM = '<i class="fas fa-upload"></i> ' + 'Upload ' + jumboImg.name;
    // $('label#jumboImg').text('<i class="fas fa-upload"></i> ' + 'Upload ' + jumboImg.name);
    var fileSize = jumboImg.size / 1024;
    var roundedFileSize = Math.round(fileSize * 10) / 10;
    $('#uploadJumboImg').html('<i class="fas fa-upload"></i> ' + 'Upload <strong>' + jumboImg.name + "</strong> (" + roundedFileSize + ") kb");
    $('#uploadJumboImg').fadeIn();
    // $("#uploadJumboImg").hover(function() {
    //     $(this).css("background-color", "#00aa44");
    // });
    // $('#jumboImgLabel').hide();

    // $('#print-name').text(cad_file.name);

    // $('#print-size').text(roundedFileSize + ' Kb');

});