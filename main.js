var webdriver = require('selenium-webdriver');
var Q = require('q');

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

    driver.get("http://localhost:8000/" + fpath)
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

function main () {
    var tests = ["gooda.html", "bad.html", "bad.html", "good.html"];
    var testPromises = tests.map(browser);
    return Q.all(testPromises);
}

main()
 .then(function (results) {
    console.log("Receving results...");
    console.log(results);
  })

/*
browser("bad.html")
 .then(function (result) {
    console.log("Receving result...");
    console.log(result);
  })
*/
