Tramway Winston Logger is a simple adapter to integrate winston logging with the Tramway Logger. It includes:

1. The Winston Provider
2. A Custom Transport to use existing Tramway providers for logging as well

# Installation:
1. `npm install --save tramway-core-logger tramway-logger-winston`

# Getting Started

With dependency injection you can add the following entries to your services config files. Be sure to do the same with your plugin.

In this example, we set up everything that's needed for logging with winston in the `src/config/services/logging.js` file.

You can add any necessary parameters in the `src/config/parameters/global` directory.

```javascript
import Logger, {middleware} from 'tramway-core-logger';

import {
    providers,
    transports,
} from 'tramway-logger-winston';

const {
    LoggerMiddlewareBuilder, 
    ErrorResponseMiddlewareBuilder,
    ErrorLoggerMiddlewareBuilder,
    NotFoundMiddlewareBuilder,
} = middleware;

const {WinstonProvider} = providers;
const {File, Console} = transports;

export default {
    "logger": {
        "class": Logger,
        "constructor": [
            {"type": "service", "key": "logger.provider.winston"},
        ],
    },
    "logger.provider.winston": {
        "class": WinstonProvider,
        "constructor": [
            {"type": "parameter", "key": "winston"},
        ], 
        "functions": [
            {
                "function": "addTransport", 
                "args": [
                    {"type": "service", "key": "transport.file:error"}
                ]
            },
            {
                "function": "addTransport", 
                "args": [
                    {"type": "service", "key": "transport.file:all"}
                ]
            },
            {
                "function": "addTransport", 
                "args": [
                    {"type": "service", "key": "transport.console"}
                ]
            },
        ]
    },
    "logger.middleware": {
        "class": LoggerMiddlewareBuilder,
        "constructor": [
            {"type": "service", "key": "logger.middleware.not.found"},
            {"type": "service", "key": "logger.middleware.error.logger"},
            {"type": "service", "key": "logger.middleware.error.response"},
        ],
    },
    "logger.middleware.error.response": {
        "class": ErrorResponseMiddlewareBuilder,
        "constructor": [
            {"type": "service", "key": "logger"}
        ],
    },
    "logger.middleware.error.logger": {
        "class": ErrorLoggerMiddlewareBuilder,
        "constructor": [
            {"type": "service", "key": "logger"}
        ],
    },
    "logger.middleware.not.found": {
        "class": NotFoundMiddlewareBuilder,
        "constructor": [
            {"type": "service", "key": "logger"}
        ],
    },
    "transport.file:error": {
        "class": File,
        "constructor": [
            {"type": "parameter", "key": "file_error"}
        ],
    },
    "transport.file:all": {
        "class": File,
        "constructor": [
            {"type": "parameter", "key": "file_all"}
        ],
    },
    "transport.console": {
        "class": Console,
        "constructor": [
            {"type": "parameter", "key": "console_all"}
        ]
    },
};
```

Update your core services to add the logger builder to your `App` configuration. Notice we use the middleware since the application example uses Express.js.

```javascript
import {
    App,
} from 'tramway-core';

export default {
    "app": {
        "class": App,
        "constructor": [
            {"type": "service", "key": "router"},
            {"type": "parameter", "key": "app"},
            {"type": "parameter", "key": "port"}
        ],
        "functions": [
            {
                "function": "use",
                "args": [
                    {"type": "parameter", "key": "cors"}
                ]
            },
            {
                "function": "addLogger",
                "args": [
                    {"type": "service", "key": "logger.middleware"}
                ]
            },
            
        ]
    },
};
```

## Configuration
For various middleware, you can configure certain functionalities in the parameters and pass them as objects to the config argument in the respective constructors.

### ErrorLoggerMiddlewareBuilder and NotFoundMiddlewareBuilder
`transformIp` is a function taking an ip and returning a modified version of it. Essential for GDPR compliance.

Example:

In your parameters:

`error_logger.js`:

```javascript
export default {
    transformIp: ip => null //don't save ips at all
}
```

Make sure this file is part of the `index.js` file in the same directory

```javascript
import error_logger from './error_logger';
export {
    error_logger,
}
```

In the logging service configuration that contains your middleware:

```javascript
"logger.middleware.error.logger": {
    "class": ErrorLoggerMiddlewareBuilder,
    "constructor": [
        {"type": "service", "key": "logger"},
        {"type": "parameter", "key": "error_logger"},
    ],
},
```

### ErrorResponseMiddlewareBuilder
`displayedEnvironments` is an array of environments that will be checked against the one of the machine. The middleware will automatically remove error messages from display in environments that aren't specified.

Example:

In your parameters:

`error_response.js`:

```javascript
export default {
    displayEnvironments: ['development']
}
```

Make sure this file is part of the `index.js` file in the same directory

```javascript
import error_response from './error_response';
export {
    error_response,
}
```

In the logging service configuration that contains your middleware:

```javascript
"logger.middleware.error.response": {
    "class": ErrorResponseMiddlewareBuilder,
    "constructor": [
        {"type": "service", "key": "logger"},
        {"type": "parameter", "key": "error_response"},
    ],
},
```

## Transports

### Built-in Transports

If you want to use the `Console` and `File` transports and customize the configuration, you can make a `winston.js` file in your `parameters/global` folder and add keys like the following as long as the `winston.js` file has properly imported with the `index.js` file. Be sure to consult the Winston docs to ensure the correct configration.

```javascript
export const file_error = {
   filename: './logs/error.log', 
   level: 'error',
   json: true,
   colorize: false,
}

export const file_all = {
   filename: './logs/all.log', 
   json: true,
   handleExceptions: true, //Handle exceptions will handle any uncaught exceptions in the application's lifecycle.
   colorize: false,
}

export const console_all = {
    handleExceptions: true,
    json: false,
    colorize: true,
}
```

In order to use directories, they must be made before the application runs, the transport will not make the folder structure for you.

### Custom Transports

You can use any of winston's built-in or featured plugins, see the docs here: https://github.com/winstonjs/winston/blob/master/docs/transports.md#winston-core

To integrate instructions in the official documents, any creation of an instance will be handled in the dependency injection configuration and the options object will be a reference to a file in your parameters.

Example: You want to email logs to your dev team with `winston-mail`:

In your logger services config:

```javascript
import {Mail} from 'winston-mail';
```

Add the following entry,

```javascript
"logger.winston.transport.mail": {
    "class": Mail,
    "constructor": [
        {"type": "parameter", "key": "winston_mail_options"},
    ],
},
```

Create the `winston_mail_options` export in your parameters/global:

`index.js`
```javascript
import winston_mail_options from './winston_mail_options';
export {
    winston_mail_options,
}

Where the `winston_mail_options.js` file has the config object that corresponds with their example:

```javascript
export default {
    to: 'dev@server.com',
    from: 'dev@server.com',
    port: 2500,
    subject: 'subject',
    formatter: 'formatter',
}
```