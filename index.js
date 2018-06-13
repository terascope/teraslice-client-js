'use strict';

const Jobs = require('./lib/jobs')
const Job = require('./lib/job')
const Cluster = require('./lib/cluster')
const Client = require('./lib/client')
// const assets = require('./lib/assets')

module.exports = function (config) {
    return {
        jobs: new Jobs(config),
        cluster: new Cluster(config),
        // assets: assets(config)
    };
};

module.exports.Client = Client;
module.exports.Cluster = Cluster;
module.exports.Jobs = Jobs;
module.exports.Job = Job;
