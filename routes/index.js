var express = require('express');
var router = express.Router();
var printer = require('printer');
var util = require('util');

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log("installed printers:\n" + util.inspect(printer.getPrinters(), {colors: true, depth: 10}));
    res.render('index', {title: 'Express', text: util.inspect(printer.getPrinters(), {colors: true, depth: 10})});
});

module.exports = router;
