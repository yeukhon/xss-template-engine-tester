var chai = require("chai"),
    chaiAsPromised = require("chai-as-promised")
    wd = require('wd'),
    Q = require('q'),
        require('colors');

chai.use(chaiAsPromised);
chai.should();

// enables chai assertion chaining
chaiAsPromised.transferPromiseness = wd.transferPromiseness;

wd.addPromiseChainMethod(
    'checkAlert',
    function () {
        var deferred = Q.defer();
        var result = {
            "type": "alert",
            "seen": false,
            "text": ""
        }
//        try {
            this.alertText(function (cb, text) {
                if (text !== undefined) {
                    result.seen = true;
                    result.text = text;
                }
                deferred.resolve(result);
           });
//        } catch (NoAlertOpenError) {
            //console.log("no alert");
//        }
        return deferred.promise;
    }
);

wd.addPromiseChainMethod(
    'check',
    function () {
        //TODO: Enable multiple assertions
        return Q.all([this.checkAlert()]);
    }
);

var browser = wd.promiseChainRemote();

var openHTML = function (filename) {
    var deferred = Q.defer();
    browser
        .init({
            browserName: 'firefox'
        })
        .get("http://localhost:8000/" + filename)
        .check()
        .then(function (results) {
            deferred.resolve(results[0]);
        })
        .fin(function () {
            return browser.quit();
        })
        .done();
    return deferred.promise;
};

/*
function testMain(tests) {
    Q.try(function (tests) {
            var A = [];
            for (var i = 0; i < tests.length; i++) {
                A.push(openHTML(tests[i]));
            }
            return Q.all(A);
        }(tests))
        .then(function (results) {
            console.log(results.length);
            console.log(results[0]);
            console.log(results[1]);
        })
        .catch(function (error) {
            console.log("exception caught");
            console.log(error);
        });;
}
*/

function testMain(tests) {
    var A = [];
    for (var i = 0; i < tests.length; i++) {
        A.push(openHTML(tests[i]));
    }
    return Q.all(A)
}
testMain(["bad.html", "output/0_0_django.html",
    "bad.html", "bad.html"])
    .then(function (results) {
        console.log(results);
    });
exports.testMain = testMain;
