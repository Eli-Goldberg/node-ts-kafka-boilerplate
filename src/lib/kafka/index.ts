import * as Kafka from 'node-rdkafka';

interface CreateClientInput {
  clientId?: string,
  brokerList: string,
  logger?: any
}

function connectToProducer(producer) {
  return new Promise((resolve, reject) => {
    producer.once('ready', (clientInfo, brokerInfo) => {
      resolve();
    });
    producer.once('connection.failure', (err) => {
      reject(err);
    });
    producer.connect();

    // Can always pass a callback instead of using 'connection.failure' event
    // producer.connect(null, (err, data) => {
    //  if (err) reject(err);
    //  console.log(data);
    // });
  });
}

function createClient({ clientId = 'kafka', brokerList, logger }: CreateClientInput) {
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

  if (logger) {
    producer.on('event.error', (error) => {
      logger.error(error, 'Error from Kafka producer');
    });
  }

  producer.setPollInterval(100);

  return { producer, connectToProducer };
}


export default createClient;