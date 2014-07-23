var restify = require('restify');
var Q = require('q');
var fs = require('fs');
var testing = require('./main.js').main;

var getFileNames = function (fdata) {
    var fnames = fdata.trim().split("\n");
    return fnames;
};

var respond = function (results) {
    console.log("I will return now.");
    console.log(results);
    res.send(results);
    return next();
};

var runTest = function (req, res, next) {
    var indexName = "output/output.txt";

    /*
    Q.nfcall(fs.readFile, indexName, "utf-8")
        .then(getFileNames)
        .then(testing)
        .then(respond);    
    */

    testing.setUp(indexName)
        .then(testing.run)
        .then(function (d) {
            console.log(d);
        });

}

/*var server = restify.createServer();
server.post('/test', runTest);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
*/
runTest(1,2,function(){});
