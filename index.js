'use strict';

module.exports = function terasliceClient(config) {
    return {
        jobs: require('./lib/jobs')(config),
        cluster: require('./lib/cluster')(config),
        assets: require('./lib/assets')(config)
    };
};
