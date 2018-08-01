'use strict';

const nock = require('nock');
const { Job } = require('../');

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

    ['start', 'stop', 'pause', 'resume'].forEach((method) => {
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

    describe('->recover', () => {
        beforeEach(() => {
            scope.get('/jobs/some-job-id/ex')
                .reply(200, {
                    ex_id: 'some-ex-id'
                });
        });

        describe('when called with nothing', () => {
            let result;
            beforeEach((done) => {
                scope.post('/ex/some-ex-id/_recover')
                    .reply(200, {
                        id: 'example'
                    });

                new Job({ baseUrl }, 'some-job-id')
                    .recover()
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
                scope.post('/ex/some-ex-id/_recover')
                    .query({ cleanup: 'errors' })
                    .reply(200, {
                        key: 'some-other-key'
                    });

                new Job({ baseUrl }, 'some-job-id')
                    .recover({ cleanup: 'errors' })
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

    describe('->ex', () => {
        describe('when called with nothing', () => {
            let result;
            beforeEach((done) => {
                scope.get('/jobs/some-job-id/ex')
                    .reply(200, {
                        ex_id: 'example-ex-id'
                    });

                new Job({ baseUrl }, 'some-job-id')
                    .ex()
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve json result from Teraslice', () => {
                expect(result).toEqual('example-ex-id');
            });
        });
    });

    describe('->status', () => {
        describe('when called with nothing', () => {
            let result;
            beforeEach((done) => {
                scope.get('/jobs/some-job-id/ex')
                    .reply(200, {
                        ex_id: 'example-ex-id',
                        _status: {
                            example: 'status-data'
                        }
                    });

                new Job({ baseUrl }, 'some-job-id')
                    .status()
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve json result from Teraslice', () => {
                expect(result).toEqual({
                    example: 'status-data'
                });
            });
        });
    });

    describe('->spec', () => {
        describe('when called with nothing', () => {
            let result;
            beforeEach((done) => {
                scope.get('/jobs/some-job-id')
                    .reply(200, {
                        jobId: 'example-job-id',
                        example: 'job-spec'
                    });

                new Job({ baseUrl }, 'some-job-id')
                    .spec()
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve json result from Teraslice', () => {
                expect(result).toEqual({
                    jobId: 'example-job-id',
                    example: 'job-spec'
                });
            });
        });
    });

    describe('->errors', () => {
        describe('when called with nothing', () => {
            let result;
            beforeEach((done) => {
                scope.get('/jobs/some-job-id/errors')
                    .reply(200, [
                        { error: 'example' },
                        { error: 'example-2' }
                    ]);

                new Job({ baseUrl }, 'some-job-id')
                    .errors()
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve json result from Teraslice', () => {
                expect(result).toEqual([
                    { error: 'example' },
                    { error: 'example-2' }
                ]);
            });
        });
    });


    describe('->changeWorkers', () => {
        describe('when called with add and num', () => {
            let result;
            beforeEach((done) => {
                scope.post('/jobs/some-job-id/_workers')
                    .query({ add: 2 })
                    .reply(200, 'Changed workers!');

                new Job({ baseUrl }, 'some-job-id')
                    .changeWorkers('add', 2)
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve json result from Teraslice', () => {
                expect(result).toEqual('Changed workers!');
            });
        });

        describe('when called with remove and num', () => {
            let result;
            beforeEach((done) => {
                scope.post('/jobs/some-job-id/_workers')
                    .query({ remove: 2 })
                    .reply(200, 'Changed workers!');

                new Job({ baseUrl }, 'some-job-id')
                    .changeWorkers('remove', 2)
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve json result from Teraslice', () => {
                expect(result).toEqual('Changed workers!');
            });
        });

        describe('when called with total and num', () => {
            let result;
            beforeEach((done) => {
                scope.post('/jobs/some-job-id/_workers')
                    .query({ total: 2 })
                    .reply(200, 'Changed workers!');

                new Job({ baseUrl }, 'some-job-id')
                    .changeWorkers('total', 2)
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve json result from Teraslice', () => {
                expect(result).toEqual('Changed workers!');
            });
        });

        describe('when called with nothing', () => {
            let err;
            beforeEach((done) => {
                new Job({ baseUrl }, 'some-job-id')
                    .changeWorkers()
                    .then(fail)
                    .catch((_err) => {
                        err = _err;
                        done();
                    });
            });

            it('should reject with an error', () => {
                expect(err.toString()).toEqual('Error: changeWorkers requires action and count');
            });
        });

        describe('when called with an invalid action', () => {
            let err;
            beforeEach((done) => {
                new Job({ baseUrl }, 'some-job-id')
                    .changeWorkers('invalid', 2)
                    .then(fail)
                    .catch((_err) => {
                        err = _err;
                        done();
                    });
            });

            it('should reject with an error', () => {
                expect(err.toString()).toEqual('Error: changeWorkers requires action to be one of add, remove, or total');
            });
        });
    });
});
