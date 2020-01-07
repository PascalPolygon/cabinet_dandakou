var express = require('express');
var router = express.Router();
const tools = require('../public/javascripts/tools');
// import { escapeHTMLtag } from '../public/javascripts/tools.js';
const Content = require("../models/Content");

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', {title: "cabinet_dandakou"});
  Content.find({}, function (err, content) {
    if (err) throw new err();
    if (!content)
      console.log('No content found on index get');
    else {
      console.log('Content found on index get: ');
      console.log(content);
      // console.log(content[0].title);
      var business_name = content[0].title;
      business_name = tools.escapeHTMLtag(business_name, 'p');
      // console.log('business_name: ' + business_name);

      res.render('index', {
        title: "Cabinet DANDAKOU",
        business_name
      });
    }
  });
});


module.exports = router;
