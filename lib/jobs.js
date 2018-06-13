'use strict';

const Client = require('./client');
const Promise = require('bluebird');
const _ = require('lodash');
const Job = require('./job');

class Jobs extends Client {
    constructor(config) {
        super(config);
        this._config = config;
    }

    submit(jobSpec, shouldNotStart) {
        if (!jobSpec) {
            return Promise.reject(new Error('submit requires a jobSpec'));
        }

        const options = {
            json: jobSpec,
            qs: { start: !shouldNotStart }
        };

        return this.post('/jobs', options)
            .then(result => this.wrap(result.job_id))
            .catch((err) => {
                if (err.error) {
                    return Promise.reject(new Error(err.error));
                }
                return Promise.reject(err);
            });
    }

    list(options) {
        const qs = _parseListOptions(options);
        return this.get('/ex', { qs });
    }

    // Wraps the job_id with convenience functions for accessing
    // the state on the server.
    wrap(jobId) {
        return new Job(this._config, jobId);
    }
}

function _parseListOptions(options) {
    // support legacy
    if (!options) return { status: '*' };
    if (_.isString(options)) return { status: options };
    return options;
}

module.exports = Jobs;
