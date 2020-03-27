import * as Kafka from 'node-rdkafka';

interface KafkaMessageInput {
  topic: string,
  partition?: string,
  key: string,
  msg: object,
  timestamp?: number,
  opaqueToken?: any,
  headers?: {
    version: string
  }
}

class Producer {
  logger: any;
  producer: any;
  constructor({ logger, producer }) {
    this.logger = logger;
    this.producer = producer;
  }
  async sendMessageToKafka({
    topic,
    partition = null,
    key,
    msg,
    timestamp = Date.now(),
    opaqueToken,
    headers
  }: KafkaMessageInput) {
    try {
      let stringifiedMsg: string;
      stringifiedMsg = JSON.stringify(msg);
      const res = this.producer.produce(
        // Topic to send the message to
        topic,
        // optionally we can manually specify a partition for the message
        // this defaults to -1 - which will use librdkafka's default partitioner (consistent random for keyed messages, random for unkeyed messages)
        partition,
        // Message to send. Must be a buffer
        Buffer.from(stringifiedMsg),
        // for keyed messages, we also specify the key - note that this field is optional
        key,
        // you can send a timestamp here. If your broker version supports it,
        // it will get added. Otherwise, we default to 0
        timestamp,
        // you can send an opaque token here, which gets passed along
        // to your delivery reports,
        opaqueToken,
        headers
      );
      if (!res) {
        this.logger.warn({ msgId: key }, 'Kafka producer: received bad result');
      }
      return res;
    } catch (error) {
      this.logger.error({ msg, error }, 'Error sending message to kafka');
      throw error;
    }
  }
}

export function logProducerErrors(clientProducer: Kafka.Producer, logger: any) {
  clientProducer.on('event.error', (error) => {
    logger.error(error, 'Error from Kafka producer');
  });
}

export default Producer;