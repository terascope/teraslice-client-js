'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const Client = require('./client');

class Cluster extends Client {
    constructor(config = {}) {
        super(config);
    }

    state() {
        return this.get('/cluster/state');
    }

    stats() {
        return this.get('/cluster/stats');
    }

    slicers() {
        return this.get('/cluster/slicers');
    }

    txt(type) {
        const validTypes = ['slicers', 'ex', 'jobs', 'nodes', 'workers'];
        if (!_.includes(validTypes, type)) {
            const error = new Error(`"${type}" is not a valid type. Must be one of ${JSON.stringify(validTypes)}`);
            return Promise.reject(error);
        }
        return this.get(`/txt/${type}`, { json: false });
    }

    nodes() { // eslint-disable-line
        // not sure why this empty?
    }
}

module.exports = Cluster;
