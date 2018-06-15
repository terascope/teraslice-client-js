'use strict';

const { Job } = require('../');
const nock = require('nock');

describe('Teraslice Job', () => {
    let scope;
    const baseUrl = 'http://teraslice.example.dev';

    beforeEach(() => {
        scope = nock(baseUrl);
    });

    afterEach(() => {
        scope = null;
        nock.cleanAll();
    });


    describe('->id', () => {
        describe('when constructed without a jobId', () => {
            it('should throw an error', () => {
                expect(() => new Job()).toThrowError('Job requires jobId');
            });
        });

        describe('when constructed with a invalid jobId', () => {
            it('should throw an error', () => {
                expect(() => new Job({}, { invalid: true })).toThrowError('Job requires jobId to be a string');
            });
        });

        describe('when constructed with a jobId', () => {
            let job;

            beforeEach(() => {
                job = new Job({}, 'some-job-id');
            });

            it('should return the jobId', () => {
                expect(job.id()).toEqual('some-job-id');
            });
        });
    });

    describe('->slicer', () => {
        describe('when called with nothing', () => {
            let result;
            beforeEach((done) => {
                scope.get('/jobs/some-job-id/slicer')
                    .reply(200, {
                        id: 'example'
                    });

                new Job({ baseUrl }, 'some-job-id').slicer()
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve json result from Teraslice', () => {
                expect(result).toEqual({
                    id: 'example'
                });
            });
        });
    });
});
