'use strict';
const Boom = require('boom');
const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request) => {
        return 'Hello, ' + encodeURIComponent(request.params.name) + '!';
    }
});
server.route({
    method: 'GET',
    path: '/BOOM',
    handler: () => {
        throw Boom.notImplemented();
    }
});

const onPostHandlerRouteHandler = (request, h) => {
    if (request.route.settings.plugins.errorh === false) {
        return h.continue;
    }
    const response = request.response;
    if (response.isBoom) {
        console.log('response is boom!!!');
        console.log(response.output.statusCode);
        if (options.errorFiles[response.output.statusCode]) {
            console.log(`log for response error${options.errorFiles[response.output.statusCode]}`);
            console.log(`log for response errorcode ${response.output.statusCode}`);
            return h.file(options.errorFiles[response.output.statusCode]).code(response.output.statusCode);
        }
        if (options.errorFiles.default) {
            console.log(`log for response error default${options.errorFiles.default}`);
            console.log(`log for response errorcode default ${response.output.statusCode}`);
            return h.file(options.errorFiles.default).code(response.output.statusCode);
        }
    }
    return h.continue;

};
server.ext('onPreResponse', onPostHandlerRouteHandler);


const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});
init();
