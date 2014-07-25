var kue = require('kue'),
    jobs = kue.createQueue(),
    Q = require('q'),
    browser = require('./main.js').browser;

jobs.process('tests', function (job, done) {
    var files = job.data.files;
    var promises = files.map(testHTML);
    Q.all(promises)
        .then(function(res) {
            console.log("TESTS", job.id, "returning:", res);
            return res;
        });
});

var TestsJob = function (filenames) {
    var job = jobs.create('tests', {
        files: filenames
    });
    job
        .on('complete', function (res) {
            console.log('TESTS', job.id, 'is done');
            console.log('Result:', res);
        })
        .on('failed', function () {
            console.log('TESTS', job.id, 'has failed');
        })
    job.save();
};

function testHTML(filename) {
    return browser(filename);
}

function setJobProgress(pjob) {
    kue.Job.get(pjob.id, function (err, j) {
        j.progress(j._progress + 1, j.data.total);
    });
};

var t1 = TestsJob(["bad.html", "good.html"]);
