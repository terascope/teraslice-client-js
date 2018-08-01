'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const rp = require('request-promise');
const { STATUS_CODES } = require('http');
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
            resolveWithFullResponse: true,
            json: true
        });
    }

    get(...args) {
        const [errorMsg, endpoint, options] = getRequestOptionsWithQuery(...args);

        if (errorMsg) return Promise.reject(new Error(errorMsg));

        return handleResponse(this._request.get(endpoint, options));
    }

    post(...args) {
        const [errorMsg, endpoint, options] = getRequestOptionsWithData(...args);

        if (errorMsg) return Promise.reject(new Error(errorMsg));

        return handleResponse(this._request.post(endpoint, options));
    }

    put(...args) {
        const [errorMsg, endpoint, options] = getRequestOptionsWithData(...args);

        if (errorMsg) return Promise.reject(new Error(errorMsg));

        return handleResponse(this._request.put(endpoint, options));
    }

    delete(...args) {
        const [errorMsg, endpoint, options] = getRequestOptionsWithData(...args);

        if (errorMsg) return Promise.reject(new Error(errorMsg));

        return handleResponse(this._request.delete(endpoint, options));
    }
}

function handleResponse(req) {
    return req.promise().then((response) => {
        const { body, statusCode } = response;

        if (response.statusCode >= 400) {
            const defaultErrorMessage = STATUS_CODES[statusCode];
            const errorMsg = _.get(body, 'error', _.get(body, 'message', defaultErrorMessage));
            return Promise.reject(new Error(errorMsg));
        }

        return Promise.resolve(body);
    });
}

function getRequestOptionsWithData(endpoint, ...rest) {
    if (!endpoint) {
        return ['endpoint must not be empty'];
    }
    if (!_.isString(endpoint)) {
        return ['endpoint must be a string'];
    }
    if (rest.length === 0) {
        return [null, endpoint];
    }
    if (rest.length > 2) {
        return ['Too many arguments passed to client'];
    }
    const options = _getRequestOptionsWithData(...rest);
    return [null, endpoint, options];
}

function getRequestOptionsWithQuery(endpoint, ...rest) {
    if (!endpoint) {
        return ['endpoint must not be empty'];
    }
    if (!_.isString(endpoint)) {
        return ['endpoint must be a string'];
    }
    if (rest.length === 0) {
        return [null, endpoint];
    }
    if (rest.length > 2) {
        return ['Too many arguments passed to client'];
    }
    const options = _getRequestOptionsWithQuery(...rest);
    return [null, endpoint, options];
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
