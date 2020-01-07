const mongoose = require("mongoose");

const ContentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },

});

const Content = mongoose.model("Content", ContentSchema);

module.exports = Content;
