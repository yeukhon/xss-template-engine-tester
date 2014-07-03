var page = require('webpage').create(),
    system = require('system'),
    address;

page.onAlert = function (msg) {
    console.log("Received an alert: " + msg);
};

page.onConfirm = function (msg) {
    console.log("Received a confirm dialog: " + msg);
    return true;
};

if (system.args.length === 1) {
    console.log("Must provide the address of the webpage");
} else {
    address = system.args[1];
    page.open(address, function (status) {
        if (status === "success") {
            console.log("opened web page successfully!");
            page.evaluate(function () {
                // .click() is not standard
                // see https://github.com/ariya/phantomjs/issues/11153
                var e = document.createEvent('Events');
                e.initEvent('click', true, false);
                var a = document.getElementsByTagName("a");
                if (a && a.length >= 1) {
                    a[0].dispatchEvent(e);
                }
            });
        } else {
            console.log("Unable to open webpage at " + address);
            console.log("Exiting...");
            phantom.exit();
        }
    });
}
