var webdriver = require('selenium-webdriver');
var Q = require('q');
var fs = require('fs');

function browser(fpath) {

    var deferred = Q.defer();
    var driver;

    var result = {
        type: "alert",
        seen: "",
        data: "",
        error: ""
    }

    var seenAlert = function (alert) {
        var d = Q.defer();
        alert.getText().then(function (text) {
            console.log("seen alert msg: " + text);
            result.seen = true;
            result.data = text;
            d.resolve(result);
        });
        return d.promise;
    };

    var noAlert = function (e) {
        console.log("no alert caught");
        result.seen = false;
        return result;
    };

    var cleanUpAndResolve = function (result) {
        console.log("quitting ....");
        driver.quit();
        deferred.resolve(result);
    };

    driver = new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build();  

    driver.get("http://localhost:8000/output/" + fpath)
    setTimeout(function () {
        var alert = driver.switchTo().alert();
        setTimeout(function () {
            alert
             .then(seenAlert, noAlert)
             .then(cleanUpAndResolve);
        }, 500);
    }, 500);

    return deferred.promise;
}

var main = {
    setUp: function (indexName) {
       var deferred = Q.defer();
        Q.nfcall(fs.readFile, indexName, "utf-8")
            .then(function (fdata) {
                deferred.resolve(fdata.trim().split("\n"));
            });
        return deferred.promise;
    },
    run: function (testList) {
        var testPromises = testList.map(browser);
        return Q.all(testPromises);
    }
};

exports.main = main;
