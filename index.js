'use strict';

const Jobs = require('./lib/jobs')
const Job = require('./lib/job')
const cluster = require('./lib/cluster')
const assets = require('./lib/assets')

module.exports = function terasliceClient(config) {
    return {
        jobs: new Jobs(config),
        cluster: cluster(config),
        assets: assets(config)
    };
};

module.exports.Jobs = Jobs;
module.exports.Job = Job;
