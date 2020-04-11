// config.js
import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import convict from 'convict';

const config = convict({
  env: {
    format: ['local', 'dev', 'prod'],
    default: 'dev',
    arg: 'nodeEnv',
    env: 'NODE_ENV'
  },
  logLevel: {
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
    default: 'debug',
    arg: 'log-level',
    env: 'LOG_LEVEL'
  },
  kafkaBrokerList: {
    format: String,
    default: '',
    arg: 'kafka-broker-list',
    env: 'KAFKA_BROKER_LIST'
  },
  consumerName: {
    format: String,
    default: 'kafka',
    arg: 'consumer-name',
    env: 'CONSUMER_NAME'
  }
});

const env = config.get('env');
config.loadFile(`src/config/${env}.json`);
config.validate({ allowed: 'strict' }); // throws error if config does not conform to schema

export default config.getProperties(); // so we can operate with a plain old JavaScript object and abstract away convict (optional)
