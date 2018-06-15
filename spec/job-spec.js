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

    describe('->start', () => {
        describe('when called with nothing', () => {
            let result;
            beforeEach((done) => {
                scope.post('/jobs/some-job-id/_start')
                    .reply(200, {
                        id: 'example'
                    });

                new Job({ baseUrl }, 'some-job-id')
                    .start()
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

        describe('when called with a query', () => {
            let result;
            beforeEach((done) => {
                scope.post('/jobs/some-job-id/_start')
                    .query({ someParam: 'yes' })
                    .reply(200, {
                        key: 'some-other-key'
                    });

                new Job({ baseUrl }, 'some-job-id')
                    .start({ someParam: 'yes' })
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve json result from Teraslice', () => {
                expect(result).toEqual({
                    key: 'some-other-key'
                });
            });
        });
    });

    ['start', 'stop', 'pause', 'resume', 'recover'].forEach((method) => {
        describe(`->${method}`, () => {
            describe('when called with nothing', () => {
                let result;
                beforeEach((done) => {
                    scope.post(`/jobs/some-job-id/_${method}`)
                        .reply(200, {
                            id: 'example'
                        });

                    new Job({ baseUrl }, 'some-job-id')[method]()
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

            describe('when called with a query', () => {
                let result;
                beforeEach((done) => {
                    scope.post(`/jobs/some-job-id/_${method}`)
                        .query({ someParam: 'yes' })
                        .reply(200, {
                            key: 'some-other-key'
                        });

                    new Job({ baseUrl }, 'some-job-id')[method]({ someParam: 'yes' })
                        .then((_result) => {
                            result = _result;
                            done();
                        }).catch(fail);
                });

                it('should resolve json result from Teraslice', () => {
                    expect(result).toEqual({
                        key: 'some-other-key'
                    });
                });
            });
        });
    });
});
