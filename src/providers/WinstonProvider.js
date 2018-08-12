import {createLogger} from 'winston';
import Transport from 'winston-transport';

export default class WinstonProvider {
    constructor(config = {}) {
        this.logger = createLogger(config);
    }

    addTransport(transport, options) {
        this.logger.add(transport, options);
        return this;
    }

    addExceptionHandler(transport) {
        this.logger.exceptions.handle(transport);
        return this;
    }

    log(type, message) {
        this.logger.log(type, message);
        return this;
    }

    configure(config = {}) {
        this.logger.configure(config);
    }

    getStream() {
        return this.logger.stream;
    }
}