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
    it('error if invalid options', () => {
        register({test: 'value'})
            .catch((err) => {
                expect(err).to.exist();

            });
    });
    lab.test('uses errorFiles- NOT IMPLEMENTED', async () => {
        register({
            errorFiles: {
                404: '404.html'
            }
        }).then((success) => {
            console.log(success);
        });
        const options = {
            method: 'get',
            url: '/none'
        }
        const response = await server.inject(options);
        expect(response.statusCode).to.be.equal(501);
        expect(response.result).to.equal({
            statusCode: 501,
            error: 'Not Implemented',
            message: 'Not Implemented'
        });
    });
    lab.test('uses errorFiles-Page Does Not Exist', async () => {

        register({
            errorFiles: {
                404: '404.html'
            }
        }).then(() => {});
        const options = {
            method: 'get',
            url: '/get'
        }
        const response = await server.inject(options);
        const payloads = response.payload;
        expect(response.statusCode).to.be.equal(404);
        expect(response.result).to.equal('Sorry, that page doesn’t exist.\n');
    });
});
