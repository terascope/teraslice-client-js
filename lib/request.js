'use strict';

const request = require('request-promise');

module.exports = function _request(config = {}) {
    let terasliceHost = config.host;

    if (!terasliceHost) {
        terasliceHost = 'http://localhost:5678';
    }

    function get(path) {
        return request({
            method: 'GET',
            baseUrl: terasliceHost,
            uri: path,
            json: true // Automatically stringifies the body to JSON
        });
    }

    function post(path, record, isStream) {
        const options = {
            method: 'POST',
            baseUrl: terasliceHost,
            uri: path,
            body: record
        };

        if (!isStream) options.json = true;
        return request(options);
    }


    function put(path, record) {
        return request({
            method: 'PUT',
            baseUrl: terasliceHost,
            uri: path,
            body: record,
            json: true // Automatically stringifies the body to JSON
        });
    }

    function deleteFn(path) {
        return request({
            method: 'DELETE',
            baseUrl: terasliceHost,
            uri: path
        });
    }

    return {
        get,
        post,
        put,
        delete: deleteFn
    };
};
