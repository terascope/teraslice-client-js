'use strict';

const client = require('../');

describe('teraslice-client-js', () => {
    it('returns a function', () => {
        expect(typeof client).toEqual('function');
    });

    it('can return be constructed', () => {
        expect(() => client({})).not.toThrow();
    });
});
