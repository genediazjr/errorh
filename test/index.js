'use strict';

const Inert = require('inert');
const Hapi = require('hapi');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');
const Plugin = require('../');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const beforeEach = lab.beforeEach;
const describe = lab.describe;
const it = lab.it;

describe('registration and functionality', () => {

    let server;

    beforeEach((done) => {

        server = new Hapi.Server({
            connections: {
                routes: {
                    files: {
                        relativeTo: process.cwd() + '/test'
                    }
                }
            }
        });
        server.connection();

        server.route({
            method: 'get',
            path: '/error',
            handler: (request, reply) => {

                return reply(Boom.badImplementation());
            }
        });

        server.route({
            method: 'get',
            path: '/none',
            handler: (request, reply) => {

                return reply(Boom.notImplemented());
            }
        });

        return done();
    });

    const register = (options, next) => {

        server.register([
            Inert,
            {
                register: Plugin,
                options: options
            }
        ], (err) => {

            return next(err);
        });
    };

    it('registers without option', (done) => {

        register({}, (err) => {

            expect(err).to.not.exist();

            return done();
        });
    });

    it('errors if invalid options', (done) => {

        register({
            test: 'value'
        }, (err) => {

            expect(err).to.exist();

            return done();
        });
    });

    it('uses errorFiles', (done) => {

        register({
            errorFiles: {
                404: '404.html'
            }
        }, (err) => {

            server.route({
                path: '/{path*}',
                method: '*',
                handler: {
                    directory: {
                        path: './',
                        index: true,
                        redirectToSlash: true
                    }
                }
            });

            expect(err).to.not.exist();

            server.inject({
                method: 'get',
                url: '/none'
            }, (res) => {

                expect(res.statusCode).to.be.equal(501);
                expect(res.result).to.equal({
                    statusCode: 501,
                    error: 'Not Implemented'
                });

                server.inject({
                    method: 'get',
                    url: '/test'
                }, (res) => {

                    expect(res.statusCode).to.be.equal(404);
                    expect(res.result).to.equal('Sorry, that page doesn’t exist.\n');

                    return done();
                });
            });
        });
    });

    it('uses staticRoutes', (done) => {

        register({
            errorFiles: {
                404: '404.html',
                default: '50x.html'
            },
            staticRoute: {
                path: '/{path*}',
                method: '*',
                handler: {
                    directory: {
                        path: './',
                        index: true,
                        redirectToSlash: true
                    }
                }
            }
        }, (err) => {

            expect(err).to.not.exist();

            server.inject({
                method: 'get',
                url: '/'
            }, (res) => {

                expect(res.statusCode).to.be.equal(200);
                expect(res.result).to.equal('index page\n');

                server.inject({
                    method: 'get',
                    url: '/test'
                }, (res) => {

                    expect(res.statusCode).to.be.equal(404);
                    expect(res.result).to.equal('Sorry, that page doesn’t exist.\n');

                    server.inject({
                        method: 'get',
                        url: '/error'
                    }, (res) => {

                        expect(res.statusCode).to.be.equal(500);
                        expect(res.result).to.equal('Sorry, but the server has encountered an error.\n');

                        return done();
                    });
                });
            });
        });
    });

    it('can be disabled per route', (done) => {

        register({
            errorFiles: {
                404: '404.html',
                default: '50x.html'
            },
            staticRoute: {
                path: '/{path*}',
                method: '*',
                handler: {
                    directory: {
                        path: './',
                        index: true,
                        redirectToSlash: true
                    }
                }
            }
        }, (err) => {

            expect(err).to.not.exist();

            server.route({
                method: 'get',
                path: '/disabled',
                handler: (request, reply) => {

                    return reply(Boom.notFound());
                },
                config: { plugins: { errorh: false } }
            });

            server.inject({
                method: 'get',
                url: '/none'
            }, (res) => {

                expect(res.statusCode).to.be.equal(501);
                expect(res.result).to.equal('Sorry, but the server has encountered an error.\n');

                server.inject({
                    method: 'get',
                    url: '/test'
                }, (res) => {

                    expect(res.statusCode).to.be.equal(404);
                    expect(res.result).to.equal('Sorry, that page doesn’t exist.\n');

                    server.inject({
                        method: 'get',
                        url: '/disabled'
                    }, (res) => {

                        expect(res.statusCode).to.be.equal(404);
                        expect(res.result).to.equal({ statusCode: 404, error: 'Not Found' });

                        return done();
                    });
                });
            });
        });
    });

    it('doesnt work without configured route files', (done) => {

        const someServer = new Hapi.Server({ debug: false });
        someServer.connection();

        someServer.route({
            method: 'get',
            path: '/error',
            handler: (request, reply) => {

                return reply(Boom.badImplementation());
            }
        });

        someServer.route({
            method: 'get',
            path: '/none',
            handler: (request, reply) => {

                return reply(Boom.notImplemented());
            }
        });

        someServer.register([
            Inert,
            {
                register: Plugin,
                options: {
                    errorFiles: {
                        404: '404.html',
                        default: '50x.html'
                    },
                    staticRoute: {
                        path: '/{path*}',
                        method: '*',
                        handler: {
                            directory: {
                                path: './',
                                index: true,
                                redirectToSlash: true
                            }
                        }
                    }
                }
            }
        ], (err) => {

            expect(err).to.not.exist();

            someServer.inject({
                method: 'get',
                url: '/'
            }, (res) => {

                expect(res.statusCode).to.be.equal(404);
                expect(res.result).to.equal({
                    statusCode: 404,
                    error: 'Not Found'
                });

                someServer.inject({
                    method: 'get',
                    url: '/test'
                }, (res) => {

                    expect(res.statusCode).to.be.equal(302);
                    expect(res.result).to.not.exist();

                    someServer.inject({
                        method: 'get',
                        url: '/error'
                    }, (res) => {

                        expect(res.statusCode).to.be.equal(404);
                        expect(res.result).to.equal({
                            statusCode: 404,
                            error: 'Not Found'
                        });

                        return done();
                    });
                });
            });
        });
    });
});
