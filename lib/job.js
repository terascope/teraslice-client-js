'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Client = require('./client');

/*
 * This is basically a wrapper around the job_id that acts as a proxy
 * to the server. It looks like an object but does not store the job
 * state internally. Any access to the state currently goes to the server.
 * Depending on how usage of this API develops we may want to reconsider this.
 */

class Job extends Client {
    constructor(config, jobId) {
        super(config);
        if (!jobId) {
            throw new Error('Job requires jobId');
        }
        if (!_.isString(jobId)) {
            throw new Error('Job requires jobId to be a string');
        }
        this._jobId = jobId;
    }

    id() { return this._jobId; }

    slicer() {
        return this.get(`/jobs/${this._jobId}/slicer`);
    }

    start(options) {
        return this._jobAction('_start', options);
    }

    stop(options) {
        return this._jobAction('_stop', options);
    }

    pause(options) {
        return this._jobAction('_pause', options);
    }

    resume(options) {
        return this._jobAction('_resume', options);
    }

    recover(options) {
        return this._exAction('_recover', options);
    }

    _jobAction(action, options) {
        let url = `/jobs/${this._jobId}/${action}`;

        // options are converted into URL parameters.
        if (options) {
            url += '?';
            _.forOwn(options, (value, option) => {
                url += `${option}=${value}`;
            })
        }

        return this.post(url, {});
    }

    _exAction(action, options) {
        return this.ex().then((exId) => {
            let url = `/ex/${exId}/${action}`;

            // options are converted into URL parameters.
            if (options) {
                url += '?';
                _.forOwn(options, (value, option) => {
                    url += `${option}=${value}`;
                })
            }

            return this._request.post(url, {});
        })
    }

    ex() {
        return this.get(`/jobs/${this._jobId}/ex`)
            .then(jobSpec => jobSpec.exId);
    }

    status() {
        return this.get(`/jobs/${this._jobId}/ex`)
            .then(jobSpec => jobSpec._status);
    }

    waitForStatus(target, timeout = 1000) {
        return new Promise(((resolve, reject) => {
            // Not all terminal states considered failure.
            const terminal = {
                completed: false,
                failed: true,
                rejected: true,
                aborted: true
            };
            const wait = () => {
                this.status()
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
                                reject(`Job has status: "${result}" which is terminal so status: "${target}" is not possible. job_id: ${this._jobId}`);
                            } else {
                                resolve(result);
                            }
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
            };

            wait();
        }));
    }

    spec() {
        return this.get(`/jobs/${this._jobId}`);
    }

    errors() {
        return this.get(`/jobs/${this._jobId}/errors`);
    }

    workers() {
        return this._filterProcesses('worker');
    }

    _filterProcesses(role) {
        return this.get('/cluster/state')
            .then((state) => {
                const filteredWorkers = _.reduce(state, (workers, node) => {
                    _.forEach(node.active, (_activeProcess) => {
                        const activeProcess = _.cloneDeep(_activeProcess);
                        if (activeProcess.assignment !== role) return;
                        if (activeProcess.job_id !== this._jobId) return;
                        activeProcess.node_id = node.node_id;
                        workers.push(activeProcess);
                    });

                    return workers;
                }, []);

                return filteredWorkers;
            });
    }

    changeWorkers(param, workerNum) {
        const url = `/jobs/${this._jobId}/_workers?${param}=${workerNum}`;
        return this.post(url);
    }
}

module.exports = Job;
