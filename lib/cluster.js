'use strict';

const clientRequest = require('./request');
const _ = require('lodash');

module.exports = function _cluster(config) {
    const request = clientRequest(config);

    function state() {
        return request.get('/cluster/state');
    }

    function stats() {
        return request.get('/cluster/stats');
    }

    function slicers() {
        return request.get('/cluster/slicers');
    }

    function txt(type) {
        const validTypes = ['slicers', 'ex', 'jobs', 'nodes', 'workers'];
        if (!_.includes(validTypes, type)) {
            const error = new Error(`"${type}" is not a valid type. Must be one of ${JSON.stringify(validTypes)}`);
            return Promise.reject(error);
        }
        return request.get(`/txt/${type}`, { json: false });
    }

    function getEndpoint(endpoint) {
        if (!endpoint) {
            return Promise.reject(new Error('path must not be empty'));
        }
        if (!_.isString(endpoint)) {
            return Promise.reject(new Error('path must be a string'));
        }
        return request.get(endpoint);
    }

    function post(endpoint, data) {
        return request.post(endpoint, data);
    }

    function put(endpoint, data) {
        return request.put(endpoint, data);
    }

    function deleteFn(endpoint) {
        return request.delete(endpoint);
    }

    return {
        state,
        stats,
        slicers,
        nodes: () => {},
        txt,
        get: getEndpoint,
        post,
        put,
        delete: deleteFn

    };
};
