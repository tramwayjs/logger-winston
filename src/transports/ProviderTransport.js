import Transport from 'winston-transport';

export default class ProviderTransport extends Transport {
    /**
     * 
     * @param {object} options 
     * @param {Provider} provider 
     */
    constructor(options, provider) {
        super(options);
        this.provider = provider;
    }

    log(info, callback) {
        setImmediate(() => this.emit('logged', info));

        return Promise.resolve(this.provider.create(info)).then(callback);
    }
}