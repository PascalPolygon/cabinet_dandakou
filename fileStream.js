const mongoose = require("mongoose");
const path = require("path");
const conn = mongoose.connection;
const Images = require("./models/Images");
var fs = require("fs");
//let gfs;
const Grid = require("gridfs-stream");
let mongoDriver;
// let image_file;

conn.once("open", function() {
  console.log("Mongo connection open!");
  mongoDriver = mongoose.mongo;
  //init Stream
  gfs = Grid(conn.db, mongoDriver);
  gfs.collection("fs");
});

module.exports.uploadAndReplace = function(imageFile, imageType) {
  //var mongoDriver = mongoose.mongo;

  const gridFSBucket = new mongoDriver.GridFSBucket(conn.db);
  const writeStream = gridFSBucket.openUploadStream(imageFile.name);
  fs.createReadStream(imageFile.path).pipe(writeStream);

  writeStream.on("finish", function(imageFile) {
    //query data and add to matching manufactuers
    console.log("Uploaded");
    console.log("file id:" + imageFile._id);
    //res.redirect('/Admin/dashboard');

    Images.findOneAndRemove({ imageType: imageType }, function(
      err,
      imageToDelete
    ) {
      if (err) return handleError(err);
      // deleted at most one image document
      console.log("Deleting image:");
      console.log(imageToDelete);

      if (imageToDelete != null) {
        imageToDeleteId = imageToDelete.imageId;
        console.log("Image to delete Id is: " + imageToDeleteId);
        if (imageToDeleteId != null) {
          console.log(
            "Image to delete id is not null, it is : " + imageToDeleteId
          );

          console.log("type of imageToDeleteId " + typeof imageToDeleteId);

          gfs.remove({ _id: imageToDeleteId, root: "fs" }, function(
            error,
            gridStore
          ) {
            if (error) {
              return res.status(404).json({ err: err });
              //throw new error();
              //console.log(error);
            }
            if (!gridStore) console.log("Found no file to delete");
            else console.log("Deleted old cover image");
          });
        } else {
          console.log("Image to delete Id is null: " + imageToDeleteId);
        }
      }
    });
    //create new image and update datase
    const image = new Images({
      imageId: imageFile._id,
      imageName: imageFile.filename,
      imageType: imageType
    });

    image.save();
    console.log("Database updated");
  });
};

///// DOWNLOAD /////
module.exports.download = function(imageType, res) {
  //Query images collection for cover image id
  Images.findOne({ imageType: imageType }, function(err, imageRecord) {
    if (err) throw new err();
    if (!imageRecord) {
      return res.status(404).json({
        err: "Could not " + imageType + " image"
      });
      // TODO: Handle this to use image from images folder
    } else {
      console.log("Found " + imageType + " image: ");
      console.log(imageRecord);
      // use id to query uploads and down stream cover image
      gfs.findOne({ _id: imageRecord.imageId }, function(err, imageFile) {
        console.log("Finding image to download...");
        console.log(imageFile);
        if (!imageFile || imageFile.length == 0) {
          console.log("No Image found");
          return res.status(404).json({
            err: "File does not exist"
          });
        }
        console.log("Creating read stream ...");
        //return gfs.createReadStream(imageFile._id);
        const readstream = gfs.createReadStream(imageFile._id);
        console.log("Piping...");
        readstream.pipe(res);
        //return readstream;
      });
      //readstream.pipe(res);
    }
  });
};
