const mongoose = require("mongoose");

const ImagesSchema = new mongoose.Schema({
    imageId: {
        type: String,
        required: true
    },
    imageName: {
        type: String,
        required: true
    },
    imageType: {
        type: String,
        required: true
    }
});

const Images = mongoose.model("Images", ImagesSchema);

module.exports = Images;