# errorh
Custom static error pages for Hapi. 
**This plugin depends on [inert](https://github.com/hapijs/inert) to [function](https://github.com/hapijs/inert#customized-file-response).**

Similarly, please ensure that the [route files](https://github.com/hapijs/hapi/blob/master/API.md#route.config.files) are configured.
A [static file route](https://github.com/hapijs/inert#static-file-server) must already be in place.

If not, you may use the `staticRoute` option to [specify one](https://github.com/hapijs/inert#the-directory-handler).

[![npm version](https://badge.fury.io/js/errorh.svg)](https://badge.fury.io/js/errorh)
[![Dependency Status](https://david-dm.org/genediazjr/errorh.svg)](https://david-dm.org/genediazjr/errorh)
[![Build Status](https://travis-ci.org/genediazjr/errorh.svg?branch=master)](https://travis-ci.org/genediazjr/errorh)
[![Coverage Status](https://coveralls.io/repos/github/genediazjr/errorh/badge.svg)](https://coveralls.io/github/genediazjr/errorh)
[![Code Climate](https://codeclimate.com/github/genediazjr/errorh/badges/gpa.svg)](https://codeclimate.com/github/genediazjr/errorh)

## Usage

```js
// configuring route files
const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: '/path/to/files'
            }
        }
    }
});

// registering the plugin
server.register({
    register: require('errorh'),
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
}, (err) => {
    ...
});
```
[Glue](https://github.com/hapijs/glue) manifest
```js
registrations: [
    {
        plugin: {
            register: 'errorh',
            options: [
                ... 
            ]
        }
    }
]
```

## Options
* **errorFiles** - `object` containing the status code to file config.
* **staticRoute** - `route object` for setting up the inert static [directory handler](https://github.com/hapijs/inert#the-directory-handler).

You can disable the plugin on a specific routes through `config: { plugins: { errorh: false } }`.

## Contributing
* Include 100% test coverage.
* Follow the [Hapi coding conventions](http://hapijs.com/styleguide)
* Submit an issue first for significant changes.
