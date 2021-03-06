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

    lab.test('uses errorFiles-Page Does Not Exist', async () => {

        register({
            errorFiles: {
                404: '404.html'
            }
        }).then(() => {
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
        });

        const options = {
            method: 'get',
            url: '/get_bogus'
        };

        const response = await server.inject(options);

        expect(response.statusCode).to.be.equal(404);
        expect(response.result).to.equal('Sorry, that page doesn’t exist.\n');
    });
});
