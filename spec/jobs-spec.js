'use strict';

const client = require('../');
const Job = require('../lib/job');
const nock = require('nock');

describe('Teraslice Jobs', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    describe('->submit', () => {
        let scope;
        let jobs;

        beforeEach(() => {
            ({ jobs } = client({
                baseUrl: 'http://teraslice.example.dev'
            }));
            scope = nock('http://teraslice.example.dev');
        });

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
                    .query({ start: false })
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

        describe('when submitting without operations', () => {
            let err;
            beforeEach((done) => {
                const jobSpec = {
                    some_job: true
                };
                scope.post('/jobs', jobSpec)
                    .query({ start: false })
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
});
