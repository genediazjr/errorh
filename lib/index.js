'use strict';

const Joi = require('joi');
const internals = {};

internals.schema = Joi.object().keys({
    errorFiles: Joi.object().optional(),
    staticRoute: Joi.object().optional()
});


exports.register = (server, options, next) => {

    server.dependency('inert');

    const validateOptions = internals.schema.validate(options);
    if (validateOptions.error) {
        return next(validateOptions.error);
    }

    if (options.staticRoute) {
        server.route(options.staticRoute);
    }

    if (options.errorFiles) {
        server.ext('onPostHandler', (request, reply) => {

            if (request.route.settings.plugins.errorh === false) {
                return reply.continue();
            }

            const response = request.response;

            if (response.isBoom) {

                if (options.errorFiles[response.output.statusCode]) {

                    return reply.file(options.errorFiles[response.output.statusCode]).code(response.output.statusCode);
                }

                if (options.errorFiles.default) {

                    return reply.file(options.errorFiles.default).code(response.output.statusCode);
                }
            }

            return reply.continue();
        });
    }

    return next();
};


exports.register.attributes = {
    pkg: require('../package.json')
};
