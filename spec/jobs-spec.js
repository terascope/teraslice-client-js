'use strict';

const { Jobs, Job } = require('../');
const nock = require('nock');

describe('Teraslice Jobs', () => {
    let jobs;
    let scope;

    beforeEach(() => {
        jobs = new Jobs({
            baseUrl: 'http://teraslice.example.dev'
        });
        scope = nock('http://teraslice.example.dev');
    });

    afterEach(() => {
        nock.cleanAll();
    });

    describe('->submit', () => {
        describe('when submitting without a jobSpec', () => {
            it('should fail', (done) => {
                jobs.submit().then(fail).catch((err) => {
                    expect(err.toString()).toEqual('Error: submit requires a jobSpec');
                    done();
                });
            });
        });

        describe('when submitting with a valid jobSpec', () => {
            let result;
            beforeEach((done) => {
                const jobSpec = {
                    some_job: true,
                    operations: [{ some: 'operation' }]
                };
                scope.post('/jobs', jobSpec)
                    .query({ start: true })
                    .reply(202, {
                        job_id: 'some-job-id'
                    });

                jobs.submit(jobSpec)
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve an instanceof a Job', () => {
                expect(result instanceof Job).toBeTrue();
            });
        });


        describe('when submitting with a valid and start is set false', () => {
            let result;
            beforeEach((done) => {
                const jobSpec = {
                    some_job: true,
                    operations: [{ some: 'operation' }]
                };
                scope.post('/jobs', jobSpec)
                    .query({ start: false })
                    .reply(202, {
                        job_id: 'some-job-id'
                    });

                jobs.submit(jobSpec, true)
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve an instanceof a Job', () => {
                expect(result instanceof Job).toBeTrue();
            });
        });

        describe('when submitting without operations', () => {
            let err;
            beforeEach((done) => {
                const jobSpec = {
                    some_job: true
                };
                scope.post('/jobs', jobSpec)
                    .query({ start: true })
                    .reply(400, 'No job was posted');

                jobs.submit(jobSpec)
                    .then(fail).catch((_err) => {
                        err = _err;
                        done();
                    });
            });

            it('should reject an instanceof a Error', () => {
                expect(err instanceof Error).toBeTrue();
            });

            it('should have a message of No job was posted', () => {
                expect(err.message).toEqual('No job was posted');
            });
        });
    });

    describe('->list', () => {
        describe('when called with nothing', () => {
            let result;
            beforeEach((done) => {
                scope.get('/ex')
                    .query({ status: '*' })
                    .reply(200, [
                        {
                            id: 'example'
                        },
                        {
                            id: 'example-other'
                        }
                    ]);

                jobs.list()
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve the response of of the /ex request', () => {
                expect(result).toEqual([
                    {
                        id: 'example'
                    },
                    {
                        id: 'example-other'
                    }
                ]);
            });
        });

        describe('when called with a string', () => {
            let result;
            beforeEach((done) => {
                scope.get('/ex')
                    .query({ status: 'hello' })
                    .reply(200, [
                        {
                            id: 'hello-example'
                        },
                        {
                            id: 'hello-example-2'
                        }
                    ]);

                jobs.list('hello')
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve the response of of the /ex request', () => {
                expect(result).toEqual([
                    {
                        id: 'hello-example'
                    },
                    {
                        id: 'hello-example-2'
                    }
                ]);
            });
        });

        describe('when called with an object', () => {
            let result;
            beforeEach((done) => {
                scope.get('/ex')
                    .query({ anything: true })
                    .reply(200, [
                        {
                            id: 'object-example'
                        },
                        {
                            id: 'object-example-2'
                        }
                    ]);

                jobs.list({ anything: true })
                    .then((_result) => {
                        result = _result;
                        done();
                    }).catch(fail);
            });

            it('should resolve the response of of the /ex request', () => {
                expect(result).toEqual([
                    {
                        id: 'object-example'
                    },
                    {
                        id: 'object-example-2'
                    }
                ]);
            });
        });
    });

    describe('->wrap', () => {
        describe('when given a jobId', () => {
            it('should return a instance of a Job', () => {
                const result = jobs.wrap('some-job-id');
                expect(result instanceof Job).toBeTrue();
            });
        });

        describe('when given a nothing', () => {
            it('should throw an error', () => {
                expect(() => jobs.wrap()).toThrowError('Job requires jobId');
            });
        });
    });
});
