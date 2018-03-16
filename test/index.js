'use strict';

const Inert = require('inert');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');
const Hapi = require('hapi');
const Plugin = require('../');
const Path = require('path');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const beforeEach = lab.beforeEach;
const describe = lab.describe;
const it = lab.it;

describe('registration and functionality', () => {

    let server;

    beforeEach(() => {

        server = new Hapi.Server({
            routes: {
                files: {
                    relativeTo: `${Path.join(__dirname)}`
                }
            }
        });

        server.route({
            method: 'get',
            path: '/error',
            options: {
                handler: () => {

                    return Boom.badImplementation();
                }
            }
        });

        server.route({
            method: 'get',
            path: '/none',
            options: {
                handler: () => {

                    return Boom.notImplemented();
                }
            }
        });
    });

    const register = async (options) => {
        // Load Plugins
        return await server.register([
            Inert,
            {
                plugin: Plugin,
                options: options
            }
        ]);
    };

    it('registers without option', () => {

        register({}).catch((err) => {
            expect(err).to.not.exist();
        });
    });

    it('error if invalid options', () => {

        register({ test: 'value' })
            .catch((err) => {
                expect(err).to.exist();

            });
    });

    lab.test('Uses Static Routes -(200)- SUCCESS', async () => {

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
        }).then(() => {
        });

        const options = {
            method: 'get',
            url: '/'
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.be.equal(200);
        expect(response.result).to.equal('index page\n');
    });

    lab.test('Uses Error Files -(501) NOT IMPLEMENTED', async () => {

        register({
            errorFiles: {
                404: '404.html'
            }
        }).then(() => {
        });

        const options = {
            method: 'get',
            url: '/none'
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.be.equal(501);
        expect(response.result).to.equal({
            statusCode: 501,
            error: 'Not Implemented',
            message: 'Not Implemented'
        });
    });

    lab.test('Uses Error Files -(404)-Page Does Not Exist', async () => {

        register({
            errorFiles: {
                404: '404.html'
            }
        }).then(() => {
        });

        const options = {
            method: 'get',
            url: '/get'
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.be.equal(404);
        expect(response.result).to.equal('Sorry, that page doesn’t exist.\n');
    });

    lab.test('Uses Error Files -(500)- ERROR 500', async () => {

        register({
            errorFiles: {
                404: '404.html',
                default: '50x.html'
            }
        }).then(() => {
        });

        const options = {
            method: 'get',
            url: '/error'
        };

        const response = await server.inject(options);
        expect(response.statusCode).to.be.equal(500);
        expect(response.result).to.equal('Sorry, but the server has encountered an error.\n');
    });

    lab.test('Can be Disabled per Route -(404) pAGE Does Not Exist', async () => {

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
        }).then(() => {
        });

        server.route({
            method: 'get',
            path: '/disabled',
            options: {
                handler: () => {
                    return Boom.notFound();
                },
                plugins: {
                    errorh: false
                }
            }
        });

        const options = {
            method: 'get',
            url: '/disabled'
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.be.equal(404);
        expect(response.result).to.equal({
            statusCode: 404,
            error: 'Not Found',
            message: 'Not Found'
        });
    });
});
