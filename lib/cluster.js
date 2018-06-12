'use strict';

const clientRequest = require('./request');

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
        return request.get(`/txt/${type}`);
    }

    function getEndpoint(endpoint) {
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
