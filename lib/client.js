'use strict';

const rp = require('request-promise');
const _ = require('lodash');
const { URL } = require('url');

class Client {
    constructor(config = {}) {
        const baseUrl = new URL(config.host || config.baseUrl || 'http://localhost:5678');
        delete baseUrl.path;
        delete baseUrl.hash;

        this._request = rp.defaults({
            baseUrl: baseUrl.toString(),
            headers: {
                'User-Agent': 'Teraslice Client',
                Accept: 'application/json'
            },
            json: true
        });
    }

    get(endpoint, ...rest) {
        if (!endpoint) {
            return Promise.reject(new Error('endpoint must not be empty'));
        }
        if (!_.isString(endpoint)) {
            return Promise.reject(new Error('endpoint must be a string'));
        }
        return this._request.get(endpoint, ...rest);
    }

    post(endpoint, ...rest) {
        if (!endpoint) {
            return Promise.reject(new Error('endpoint must not be empty'));
        }
        if (!_.isString(endpoint)) {
            return Promise.reject(new Error('endpoint must be a string'));
        }
        return this._request.post(endpoint, ...rest);
    }

    put(endpoint, ...rest) {
        if (!endpoint) {
            return Promise.reject(new Error('endpoint must not be empty'));
        }
        if (!_.isString(endpoint)) {
            return Promise.reject(new Error('endpoint must be a string'));
        }
        return this._request.put(endpoint, ...rest);
    }

    delete(endpoint, ...rest) {
        if (!endpoint) {
            return Promise.reject(new Error('endpoint must not be empty'));
        }
        if (!_.isString(endpoint)) {
            return Promise.reject(new Error('endpoint must be a string'));
        }
        return this._request.delete(endpoint, ...rest);
    }
}

module.exports = Client;
