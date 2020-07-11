var express = require('express');
var router = express.Router();
var fs = require("fs");

router.get('/', function(req, res, next) {
    fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
        // console.log( data );
        res.send( data );
    });
    // res.send('respond with a resource');
});

//
//
// router.get('/server', function (req, res) {
//     fs.readFile( __dirname + "/" + "users.json", 'utf8', function (err, data) {
//         // console.log( data );
//         res.send( data );
//     });
// })
//
// var server = app.listen(8081, function () {
//     var host = server.address().address
//     var port = server.address().port
//     console.log("Example app listening at http://%s:%s", host, port)
// })

module.exports = router;