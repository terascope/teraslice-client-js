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

    get(...rest) {
        return getRequestOptionsWithQuery(...rest)
            .then(args => this._request.get(...args));
    }

    post(...rest) {
        return getRequestOptionsWithData(...rest)
            .then(args => this._request.post(...args));
    }

    put(...rest) {
        return getRequestOptionsWithData(...rest)
            .then(args => this._request.put(...args));
    }

    delete(...rest) {
        return getRequestOptionsWithData(...rest)
            .then(args => this._request.delete(...args));
    }
}

function getRequestOptionsWithData(endpoint, ...rest) {
    if (!endpoint) {
        return Promise.reject(new Error('endpoint must not be empty'));
    }
    if (!_.isString(endpoint)) {
        return Promise.reject(new Error('endpoint must be a string'));
    }
    if (rest.length === 0) {
        return Promise.resolve([endpoint]);
    }
    if (rest.length > 2) {
        return Promise.reject(new Error('Too many arguments passed to client'));
    }
    const options = _getRequestOptionsWithData(...rest);
    return Promise.resolve([endpoint, options]);
}

function getRequestOptionsWithQuery(endpoint, ...rest) {
    if (!endpoint) {
        return Promise.reject(new Error('endpoint must not be empty'));
    }
    if (!_.isString(endpoint)) {
        return Promise.reject(new Error('endpoint must be a string'));
    }
    if (rest.length === 0) {
        return Promise.resolve([endpoint]);
    }
    if (rest.length > 2) {
        return Promise.reject(new Error('Too many arguments passed to client'));
    }
    const options = _getRequestOptionsWithQuery(...rest);
    return Promise.resolve([endpoint, options]);
}

function isRequestOptions(input) {
    if (!_.isPlainObject(input)) return false;
    if (_.has(input, 'qs')) return true;
    if (_.has(input, 'body')) return true;
    if (_.has(input, 'headers')) return true;
    if (_.has(input, 'json')) return true;
    return false;
}

function _getRequestOptionsWithData(...rest) {
    if (isRequestOptions(rest[0])) {
        return rest[0];
    }
    const [data, options = {}] = rest;
    if (_.isPlainObject(data) || _.isArray(data)) {
        return _.defaults({}, options, { json: data });
    }
    return _.defaults({}, options, { body: data, json: false });
}

function _getRequestOptionsWithQuery(...rest) {
    if (isRequestOptions(rest[0])) {
        return rest[0];
    }
    const [data, options = {}] = rest;
    return _.defaults({}, options, { qs: data });
}

module.exports = Client;
