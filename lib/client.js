'use strict';

const Promise = require('bluebird');
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

    get(...args) {
        return Promise.resolve().then(() => {
            const [endpoint, options] = getRequestOptionsWithQuery(...args);
            return this._request.get(endpoint, options);
        });
    }

    post(...args) {
        return Promise.resolve().then(() => {
            const [endpoint, options] = getRequestOptionsWithData(...args);
            return this._request.post(endpoint, options);
        });
    }

    put(...args) {
        return Promise.resolve().then(() => {
            const [endpoint, options] = getRequestOptionsWithData(...args);
            return this._request.put(endpoint, options);
        });
    }

    delete(...args) {
        return Promise.resolve().then(() => {
            const [endpoint, options] = getRequestOptionsWithData(...args);
            return this._request.delete(endpoint, options);
        });
    }
}

function getRequestOptionsWithData(endpoint, ...rest) {
    if (!endpoint) {
        throw new Error('endpoint must not be empty');
    }
    if (!_.isString(endpoint)) {
        throw new Error('endpoint must be a string');
    }
    if (rest.length === 0) {
        return [endpoint];
    }
    if (rest.length > 2) {
        throw new Error('Too many arguments passed to client');
    }
    const options = _getRequestOptionsWithData(...rest);
    return [endpoint, options];
}

function getRequestOptionsWithQuery(endpoint, ...rest) {
    if (!endpoint) {
        throw new Error('endpoint must not be empty');
    }
    if (!_.isString(endpoint)) {
        throw new Error('endpoint must be a string');
    }
    if (rest.length === 0) {
        return [endpoint];
    }
    if (rest.length > 2) {
        throw new Error('Too many arguments passed to client');
    }
    const options = _getRequestOptionsWithQuery(...rest);
    return [endpoint, options];
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
