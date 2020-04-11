import * as Kafka from 'node-rdkafka';

interface CreateClientInput {
  clientId?: string,
  brokerList: string,
  logger?: any,
  earliest?: boolean
}

function connectToClient(producer: Kafka.Producer | Kafka.KafkaConsumer) {
  return new Promise((resolve, reject) => {
    producer
      .once('ready', (clientInfo, brokerInfo) => resolve())
      .once('connection.failure', (err) => reject(err));

    producer.connect();

    // Can always pass a callback instead of using 'connection.failure' event
    // producer.connect(null, (err, data) => {
    //  if (err) reject(err);
    //  console.log(data);
    // });
  });
}

async function getNMessages(consumer: Kafka.KafkaConsumer, n: number): Promise<any[]> {
  return new Promise((resolve, reject) => {
    consumer.consume(n, (err, msg) => {
      // if (err) return reject(err);
      return resolve(msg);
    });
  });
}

function createClient({ clientId = 'kafka', brokerList, logger, earliest = false }: CreateClientInput) {
  const producer = new Kafka.Producer({
    'client.id': clientId,
    'metadata.broker.list': brokerList,
    'compression.codec': 'gzip',
    'retry.backoff.ms': 200,
    'message.send.max.retries': 10,
    'socket.keepalive.enable': true,
    'queue.buffering.max.messages': 100000,
    'queue.buffering.max.ms': 1000,
    'batch.num.messages': 1000000,
    'dr_cb': true
  });

  const clientExtraConfig = earliest ? {
    'auto.offset.reset': 'earliest' // consume from the start
  } : {};

  const consumer = new Kafka.KafkaConsumer({
    'group.id': clientId,
    'metadata.broker.list': brokerList,
    'enable.auto.commit': false,
    'socket.keepalive.enable': true,
  }, clientExtraConfig);

  if (logger) {
    producer.on('event.error', (error) => {
      logger.error(error, 'Error from Kafka producer');
    });
  }

  producer.setPollInterval(100);

  return { producer, consumer, connectToClient, getNMessages };
}


export default createClient;