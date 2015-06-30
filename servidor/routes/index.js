var express = require('express');
var router = express.Router();

var codigo = "../../prueba.html";
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render("prueba.html");
});

module.exports = router;
