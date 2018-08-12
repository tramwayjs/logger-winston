import ProviderTransport from './ProviderTransport';
import {transports} from 'winston';

const {Console, File, Http, Stream} = transports;

export {
    ProviderTransport,
    Console, 
    File, 
    Http, 
    Stream,
}