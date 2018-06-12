'use strict';

const jobs = require('./lib/jobs')
const cluster = require('./lib/cluster')
const assets = require('./lib/assets')

module.exports = function terasliceClient(config) {
    return {
        jobs: jobs(config),
        cluster: cluster(config),
        assets: assets(config)
    };
};
