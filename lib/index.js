'use strict';

const Joi = require('joi');
const internals = {};

internals.schema = Joi.object().keys({
    errorFiles: Joi.object().optional(),
    staticRoute: Joi.object().optional()
});

exports.plugin = {
    pkg: require('../package.json'),
    register: (server, options) => {
        const validateOptions = internals.schema.validate(options);

        if (validateOptions.error) {

            return Promise.reject(new Error(validateOptions.error.message));
        }

        if (options.errorFiles) {
            // use  onPreResponse or onPostHandler
            server.ext('onPreResponse', (request, h) => {

                if (request.route.settings.plugins.errorh === false) {

                    return h.continue;
                }

                const response = request.response;

                if (response.isBoom) {
                    if (options.errorFiles[response.output.statusCode]) {

                        return h.file(options.errorFiles[response.output.statusCode])
                            .code(response.output.statusCode)
                            .type('text/html');
                    }
                    else if (options.errorFiles.default) {

                        return h.file(options.errorFiles.default)
                            .code(response.output.statusCode)
                            .type('text/html');
                    }
                }

                return h.continue;
            });
        }

        if (options.staticRoute) {
            server.route(options.staticRoute);
        }
    }
};

