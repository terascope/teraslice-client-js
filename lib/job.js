'use strict';

const _ = require('lodash');
const autoBind = require('auto-bind');
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
        autoBind(this);
    }

    id() { return this._jobId; }

    slicer() {
        return this.get(`/jobs/${this._jobId}/slicer`);
    }

    start(qs) {
        return this.post(`/jobs/${this._jobId}/_start`, { qs });
    }

    stop(qs) {
        return this.post(`/jobs/${this._jobId}/_stop`, { qs });
    }

    pause(qs) {
        return this.post(`/jobs/${this._jobId}/_pause`, { qs });
    }

    resume(qs) {
        return this.post(`/jobs/${this._jobId}/_resume`, { qs });
    }

    recover(qs) {
        return this.ex().then(exId => this.post(`/ex/${exId}/_recover`, { qs }));
    }

    ex() {
        return this.get(`/jobs/${this._jobId}/ex`)
            .then(jobSpec => jobSpec.ex_id);
    }

    status() {
        return this.get(`/jobs/${this._jobId}/ex`)
            .then(jobSpec => jobSpec._status);
    }

    waitForStatus(target, timeout = 1000) {
        // Not all terminal states considered failure.
        const terminal = {
            completed: false,
            failed: true,
            rejected: true,
            aborted: true
        };

        const checkStatus = async () => {
            const result = await this.status();
            // These are terminal states for a job so if we're not explicitly
            // watching for these then we need to stop waiting as the job
            // status won't change further.
            if (result === target && terminal[result]) {
                if (terminal[result]) {
                    throw new Error(`Job has status: "${result}" which is terminal so status: "${target}" is not possible. job_id: ${this._jobId}`);
                }
            } else if (result === target) {
                return result;
            }

            await Promise.delay(timeout);
            return checkStatus();
        };

        return Promise.resolve().then(() => checkStatus());
    }

    spec() {
        return this.get(`/jobs/${this._jobId}`);
    }

    errors() {
        return this.get(`/jobs/${this._jobId}/errors`);
    }

    workers() {
        return Promise.resolve().then(() => this._filterProcesses('worker'));
    }

    changeWorkers(action, workerNum) {
        if (action == null || workerNum == null) {
            return Promise.reject(new Error('changeWorkers requires action and count'));
        }
        if (!_.includes(['add', 'remove', 'total'], action)) {
            return Promise.reject(new Error('changeWorkers requires action to be one of add, remove, or total'));
        }

        const qs = {};
        qs[action] = workerNum;
        return this.post(`/jobs/${this._jobId}/_workers`, { qs });
    }

    async _filterProcesses(role) {
        const state = await this.get('/cluster/state');
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
    }
}

module.exports = Job;
