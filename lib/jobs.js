'use strict';

module.exports = function _jobs(config) {
    const request = require('./request')(config);
    const newjob = require('./job');

    function submit(jobSpec, shouldNotStart) {
        let endpoint = '/jobs';
        if (shouldNotStart) endpoint += '?start=false';
        return request.post(endpoint, jobSpec)
            .then(result => newjob(config, result.job_id))
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
        return newjob(config, jobId);
    }

    return {
        submit,
        list,
        wrap
    };
};
