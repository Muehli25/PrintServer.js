var express = require('express');
var router = express.Router();
var printer = require('printer');
var util = require('util');
var busboy = require('connect-busboy'); //middleware for form/file upload
var fs = require('fs-extra');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('main');
});

router.get('/default', function (req,res,next) {
    console.log('default printer name: ' + (printer.getDefaultPrinterName() || 'is not defined on your computer'));
    res.render('index', {
        title: 'Express',
        text: util.inspect(printer.getDefaultPrinterName(), {colors: true, depth: 10})
    });
});
router.get('/support', function (req,res,next) {
    console.log("supported formats are:\n"+util.inspect(printer.getSupportedPrintFormats(), {colors:true, depth:10}));
    res.render('index', {
        title: 'Express',
        text: util.inspect(printer.getSupportedJobCommands(), {colors: true, depth: 10})
    });
});

router.get('/printer', function (req, res, next) {
    //console.log("installed printers:\n" + util.inspect(printer.getPrinters(), {colors: true, depth: 10}));
    res.render('index', {
        title: 'Express',
        text: util.inspect(printer.getPrinters(), {colors: true, depth: 10})
    });
});

router.get('/test', function (req, res, next) {
    printer.printDirect({
        data: "print from Node.JS buffer" // or simple String: "some text"
        //, printer:'Foxit Reader PDF Printer' // printer name, if missing then will print to default printer
        , type: 'AUTO' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
        , success: function (jobID) {
            console.log("sent to printer with ID: " + jobID);
            res.render('index', {title: 'Express', text: util.inspect(printer.getPrinters(), {colors: true, depth: 10})});
        }
        , error: function (err) {
            console.log(err);
            res.render('index', {title: 'Express', text: util.inspect(printer.getPrinters(), {colors: true, depth: 10})});
        }
    });

});

router.post('/upload', function (req, res, next) {
    let fstream;
    let savePath;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);

        //Path where image will be uploaded
        savePath = __dirname + '/uploads/' + filename;
        fstream = fs.createWriteStream(savePath);
        file.pipe(fstream);
        fstream.on('close', function () {
            console.log("Upload Finished of " + filename);
            printer.printDirect({
                data: fs.readFileSync(savePath),
                type: 'AUTO',
                success: function (jobID) {
                    console.log("sent to printer with ID: " + jobID);
                },
                error: function (err) {
                    console.log(err);
                }
            });
            res.redirect('back');
        });
    });
});


module.exports = router;
