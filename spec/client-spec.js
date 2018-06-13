'use strict';

const client = require('../');

describe('Teraslice Client', () => {
    it('returns a function', () => {
        expect(typeof client).toEqual('function');
    });

    it('should not throw an error if constructed with nothing', () => {
        expect(() => client()).not.toThrow();
    });
});
