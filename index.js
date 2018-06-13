'use strict';

const Jobs = require('./lib/jobs')
const Job = require('./lib/job')
const Cluster = require('./lib/cluster')
// const assets = require('./lib/assets')

module.exports = function terasliceClient(config) {
    return {
        jobs: new Jobs(config),
        cluster: new Cluster(config),
        // assets: assets(config)
    };
};

module.exports.Cluster = Cluster;
module.exports.Jobs = Jobs;
module.exports.Job = Job;
