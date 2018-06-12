'use strict';

module.exports = function _assets(config) {
    const request = require('./request')(config);
    const isStream = true;

    function postAsset(stream) {
        return request.post('/assets', stream, isStream);
    }

    function deleteAsset(id) {
        return request.delete(`/assets/${id}`);
    }

    return {
        post: postAsset,
        delete: deleteAsset
    };
};
