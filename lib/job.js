'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

/*
 * This is basically a wrapper around the job_id that acts as a proxy
 * to the server. It looks like an object but does not store the job
 * state internally. Any access to the state currently goes to the server.
 * Depending on how usage of this API develops we may want to reconsider this.
 */
module.exports = function _job(config, jobId) {
    const request = require('./request')(config);

    function slicer() {
        return request.get(`/jobs/${jobId}/slicer`);
    }

    function jobAction(action, options) {
        let url = `/jobs/${jobId}/${action}`;

        // options are converted into URL parameters.
        if (options) {
            url += '?';
            _.forOwn(options, (value, option) => {
                url += `${option}=${value}`;
            })
        }

        return request.post(url, {});
    }

    function exAction(action, options) {
        return exId()
            .then((exId) => {
                const url = `/ex/${exId}/${action}`;
                // options are converted into URL parameters.
                if (options) {
                    url += '?';
                    _.forOwn(options, function(value, option) {
                        url += `${option}=${value}`;
                    })
                }
        
                return request.post(url, {});
            });
    }

    function exId() {
        return request.get(`/jobs/${jobId}/ex`)
            .then(jobSpec => jobSpec.exId);
    }

    function status() {
        return request.get(`/jobs/${jobId}/ex`)
            .then(jobSpec => jobSpec._status);
    }

    function waitForStatus(target, timeout = 1000) {
        return new Promise(((resolve, reject) => {
            // Not all terminal states considered failure.
            const terminal = {
                completed: false,
                failed: true,
                rejected: true,
                aborted: true
            };
            function wait() {
                status()
                    .then((result) => {
                        if (result === target) {
                            resolve(result);
                        } else {
                            setTimeout(wait, timeout);
                        }

                        // These are terminal states for a job so if we're not explicitly
                        // watching for these then we need to stop waiting as the job
                        // status won't change further.
                        if (terminal[result] !== undefined) {
                            if (terminal[result]) {
                                reject(`Job has status: "${result}" which is terminal so status: "${target}" is not possible. job_id: ${jobId}`);
                            } else {
                                resolve(result);
                            }
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }

            wait();
        }));
    }

    function spec() {
        return request.get(`/jobs/${jobId}`);
    }

    function errors() {
        return request.get(`/jobs/${jobId}/errors`);
    }

    function _filterProcesses(role) {
        return request.get('/cluster/state')
            .then((state) => {
                const filteredWorkers = _.reduce(state, (workers, node) => {
                    _.forEach(node.active, (_activeProcess) => {
                        const activeProcess = _.cloneDeep(_activeProcess);
                        if (activeProcess.assignment === role && activeProcess.job_id === jobId) {
                            activeProcess.node_id = node.node_id;
                            workers.push(activeProcess);
                        }
                    });

                    return workers;
                }, []);

                return filteredWorkers;
            });
    }

    function changeWorkers(param, workerNum) {
        const url = `/jobs/${jobId}/_workers?${param}=${workerNum}`;
        return request.post(url);
    }

    return {
        start: options => jobAction('_start', options),
        recover: options => exAction('_recover', options),
        stop: options => jobAction('_stop', options),
        pause: options => jobAction('_pause', options),
        resume: options => jobAction('_resume', options),
        slicer,
        status,
        spec,
        errors,
        id: () => jobId,
        ex: exId,
        waitForStatus,
        workers: () => _filterProcesses('worker'),
        changeWorkers
    };
};
