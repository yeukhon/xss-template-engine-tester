var kue = require('kue'),
    jobs = kue.createQueue();
var Q = require('q');

var db = {};

function parentJob(id, done) {
    var job = jobs.create('parent', {
        type: 'PARENT',
        id: id,
        total: 2
    });
    job
        .on('complete', function() {
            console.log('Job', job.id, 'of type', job.data.type, '#', job.data.id, ' is done');
            done();
        })
        .on('failed', function() {
            console.log('Job', job.id, 'of type', job.data.type, '#', job.data.id, ' has failed');
            done();
        })
    job.save();
}

function setJobProgress(pjob) {
    kue.Job.get(pjob.id, function (err, j) {
        j.progress(j._progress + 1, j.data.total);
    });
};

function childJob(cid, parentJob, done) {
    var deferred = Q.defer();
    var job = jobs.create('child', {
        type: 'CHILD',
        cid: cid
    });
    job
        .on('complete', function() {
            setJobProgress(parentJob);
            console.log('Job', job.id, 'of type', job.data.type,
                '#', job.data.cid, ' is done');
            deferred.resolve({
                done: true,
                job: job.data,
                success: true
            });
        })
        .on('failed', function() {
            console.log('Job', job.id, 'of type', job.data.type,
                '#', job.data.cid, ' has failed');
            deferred.resolve({
                done: true,
                job: job.data,
                success: false
            });
        })
    job.save();
    return deferred.promise;
}

jobs.process('parent', function(job, done) {
    /* carry out all the parent job functions here */
    var promises = [
        job.data.id + '-' + 1,
        job.data.id + '-' + 2
    ].map(
        function(x) {
            return childJob(x, job, done)
        });

    Q.all(promises)
        .then(function(res) {
            console.log('all jobs for parent ', job.data.id,
                ' completed');
            console.log(res);
            done();
        });

})

jobs.process('child', function(job, done) {
    /* carry out all the child job functions here */
    setTimeout(function() {
        console.log('working on child job ' + job.data.cid);
        done();
    }, 2000);
})

parentJob(13, function() {});
//parentJob(14, function() {});
//parentJob(15, function() {});
//parentJob(16, function() {});
