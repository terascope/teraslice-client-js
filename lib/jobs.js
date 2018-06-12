'use strict';

const clientRequest = require('./request');
const newJob = require('./job');

module.exports = function _jobs(config) {
    const request = clientRequest(config);

    function submit(jobSpec, shouldNotStart) {
        let endpoint = '/jobs';
        if (shouldNotStart) endpoint += '?start=false';
        return request.post(endpoint, jobSpec)
            .then(result => newJob(config, result.job_id))
            .catch((err) => {
                throw err.error;
            });
    }

    function list(status = '*') {
        return request.get(`/ex?status=${status}`);
    }

    // Wraps the job_id with convenience functions for accessing
    // the state on the server.
    function wrap(jobId) {
        return newJob(config, jobId);
    }

    return {
        submit,
        list,
        wrap
    };
};
