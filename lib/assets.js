'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const Client = require('./client');

class Assets extends Client {
    post(stream) {
        if (_.isEmpty(stream)) {
            return Promise.reject(new Error('Asset stream must not be empty'));
        }

        return super.post('/assets', stream).then((response) => {
            try {
                return JSON.parse(response);
            } catch (err) {
                return response;
            }
        });
    }

    delete(id) {
        if (_.isEmpty(id)) {
            return Promise.reject(new Error('Asset delete requires a ID'));
        }

        return super.delete(`/assets/${id}`);
    }
}

module.exports = Assets;
