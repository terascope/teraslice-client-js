'use strict';

const clientRequest = require('./request');
const Promise = require('bluebird');
const Job = require('./job');

module.exports = function _jobs(config) {
    const request = clientRequest(config);

    function submit(jobSpec, shouldNotStart) {
        if (!jobSpec) {
            return Promise.reject(new Error('submit requires a jobSpec'));
        }

        const options = {
            json: jobSpec,
            qs: { start: !shouldNotStart }
        };

        return request.post('/jobs', options)
            .then(result => new Job(config, result.job_id))
            .catch((err) => {
                if (err.error) {
                    return Promise.reject(new Error(err.error));
                }
                return Promise.reject(err);
            });
    }

    function list(status = '*') {
        return request.get(`/ex?status=${status}`);
    }

    // Wraps the job_id with convenience functions for accessing
    // the state on the server.
    function wrap(jobId) {
        return new Job(config, jobId);
    }

    return {
        submit,
        list,
        wrap
    };
};
