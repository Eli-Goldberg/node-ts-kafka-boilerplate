import config from './config'
import Kafka from './lib/kafka';
import Logger from './lib/logger';
import { KafkaConsumer } from 'node-rdkafka';
import { SomeType } from './types';

const a: SomeType = { a: '', b: 0 };

const REPLAY_FROM_START = true;

const { producer, consumer, connectToClient, getNMessages } =
  Kafka({ brokerList: config.kafkaBrokerList, earliest: REPLAY_FROM_START });

const BULK_COUNT = 100;

const logger = Logger({ appName: config.consumerName, logLevel: config.logLevel });
logger.trace(config, 'Config');


async function* consumerSequence(clientConsumer: KafkaConsumer, topicName: string, msgCount: number = 10) {
  clientConsumer.subscribe([topicName]);
  while (true) {
    const msgs = await getNMessages(clientConsumer, msgCount)
    yield {
      msgs,
      commit: () => {
        clientConsumer.commitMessage(msgs[msgs.length - 1]);
      }
    }
  }
}

async function run() {
  try {
    logger.debug('Connecting to Kafka');
    await connectToClient(producer);
    await connectToClient(consumer);
    logger.debug('Connected to Kafka');

    const sequence = consumerSequence(consumer, config.kafkaFactSourceTopic, BULK_COUNT);

    let msgCounter = 0;
    for await (const { msgs, commit } of sequence) {
      if (!msgs.length) continue;

      msgCounter += msgs.length;
      const timeMsg = `Finished: ${msgCounter}`;
      try {

        await commit();

        console.timeEnd(timeMsg);
      } catch (error) {
        logger.fatal(error);
      }
    }

  } catch (error) {
    logger.error({ error }, 'General Error');
  } finally {
    if (producer.isConnected()) {
      producer.disconnect();
    }
  }
}

run();