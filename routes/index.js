var express = require('express');
var router = express.Router();
var printer = require('printer');
var util = require('util');
var busboy = require('connect-busboy'); //middleware for form/file upload
var fs = require('fs-extra');

/* GET home page. */
router.get('/', function (req, res, next) {
    //console.log("installed printers:\n" + util.inspect(printer.getPrinters(), {colors: true, depth: 10}));
    res.render('index', {
        title: 'Express',
        text: 'Text'/*util.inspect(printer.getPrinters(), {colors: true, depth: 10})*/
    });
});

router.get('/test', function (req, res, next) {
    printer.printDirect({
        data: "print from Node.JS buffer" // or simple String: "some text"
        //, printer:'Foxit Reader PDF Printer' // printer name, if missing then will print to default printer
        , type: 'RAW' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
        , success: function (jobID) {
            console.log("sent to printer with ID: " + jobID);
        }
        , error: function (err) {
            console.log(err);
        }
    });
    res.render('index', {title: 'Express', text: util.inspect(printer.getPrinters(), {colors: true, depth: 10})});
});


/*router.post('/upload', function (req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    /*printer.printDirect({
        data: req.files // or simple String: "some text"
        //, printer:'Foxit Reader PDF Printer' // printer name, if missing then will print to default printer
        , type: 'PDF' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
        , success: function (jobID) {
            console.log("sent to printer with ID: " + jobID);
        }
        , error: function (err) {
            console.log(err);
        }
    });*/
/*printer.printDirect({
    data: req.files,
    type: 'PDF',
    success: function (id) {
        console.log('printed with id ' + id);
    },
    error: function (err) {
        console.error('error on printing: ' + err);
    }
});

res.render('index', {title: 'Express', text: util.inspect(printer.getPrinters(), {colors: true, depth: 10})});*/
/*if (!req.files)
    return res.status(400).send('No files were uploaded.');

// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
let sampleFile = req.files.sampleFile;

// Use the mv() method to place the file somewhere on your server
sampleFile.mv(__dirname + '/uploads/filename.jpg', function (err) {
    if (err) return res.status(500).send(err);

    res.send('File uploaded!');
});*/
/*});*/

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
                printer: process.env[3], // printer name, if missing then will print to default printer
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
