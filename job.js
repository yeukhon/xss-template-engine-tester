var kue = require('kue'),
    jobs = kue.createQueue(),
    Q = require('q'),
    browser = require('./main.js').browser;

var dumbDB = {
    db: {},
    push: function (data) {
        this.db[data.rid] = data;
    },
    update: function (rid, data) {
        for (key in data) {
            this.db[rid][key] = data[key];
        }
    },
    dump: function () {
        return this.db;
    }
};

jobs.process('tests', function (job, done) {
    var files = job.data.files;
    var job_promises = files.map(createHTMLJob);
    Q.all(job_promises)
     .then(function (res) {
        console.log(res);
        dumbDB.update(job.data.rid, {
            result: res
        });
        done();
    });
});

var TestsJob = function (data) {
    // First, create an entry in the database
    dumbDB.push(data);
    var job = jobs.create('tests', data);
    job
        .on('complete', function () {
            console.log('TESTS', job.id, 'is done');
            dumbDB.update(job.data.rid, {
                finished: true,
                running: false,
                success: true
            });
        })
        .on('failed', function () {
            console.log('TESTS', job.id, 'has failed');
            dumbDB.update(job.data.rid, {
                finished: true,
                running: false,
                success: false
            });
        })
    job.save();
};

function createHTMLJob(filename) {
    var deferred = Q.defer();
    browser(filename)
        .then(function (res) {
            deferred.resolve(res);
        });
    return deferred.promise;
}

function setJobProgress(pjob) {
    kue.Job.get(pjob.id, function (err, j) {
        j.progress(j._progress + 1, j.data.total);
    });
};

var t1 = TestsJob({
    rid: 11111111,
    files: ["bad.html", "good.html"]
});

setTimeout(function () {
    var a = dumbDB.dump();
    console.log("results: ", a["11111111"].result[0],
        a["11111111"].result[1]);
}, 5000);
