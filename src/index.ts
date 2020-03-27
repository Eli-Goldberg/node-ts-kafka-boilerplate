import config from './config'
import Kafka from './lib/kafka';
import Logger from './lib/logger';

const { producer, connectToProducer } = Kafka({ brokerList: config.kafkaBrokerList });

const logger = Logger({ appName: 'mongo-to-kafka', logLevel: config.logLevel });
logger.trace(config, 'Config');

async function run() {
  try {
    logger.debug('Connecting to Kafka');
    await connectToProducer(producer);
    logger.debug('Connected to Kafka');

  } catch (error) {
    logger.error({ error }, 'General Error');
  } finally {
    producer.disconnect();
  }
}

run();