'use strict';

const rp = require('request-promise');
const { URL } = require('url');

module.exports = function _request(config = {}) {
    const baseUrl = new URL(config.host || config.baseUrl || 'http://localhost:5678');
    delete baseUrl.path;
    delete baseUrl.hash;

    const request = rp.defaults({
        baseUrl: baseUrl.toString(),
        headers: {
            'User-Agent': 'Teraslice Client',
            Accept: 'application/json'
        },
        json: true
    });

    return request;
};
