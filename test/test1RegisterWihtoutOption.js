'use strict';

const Inert = require('inert');
const Boom = require('boom');
const Code = require('code');
const Lab = require('lab');
const Hapi = require('hapi');
const Plugin = require('../');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const beforeEach = lab.beforeEach;
const describe = lab.describe;
const it = lab.it;
describe('registration and functionality', () => {
    let server;
    beforeEach(() => {
        server = new Hapi.Server();
        server.path(process.cwd() + '/test')

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
});
