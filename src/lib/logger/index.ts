import * as bunyan from 'bunyan';
import BunyanSpecificLevelStream from './BunyanSpecificLevelStream';

const createLogger = ({appName, logLevel}) => bunyan.createLogger({
  name: appName,
  logLevel,
  streams: [
    {
      level: 'trace',
      type: 'raw',
      // log only non-error levels to stdout
      stream: new BunyanSpecificLevelStream(['warn', 'info', 'debug', 'trace'], process.stdout, logLevel)
    },
    {
      level: 'error',
      stream: new BunyanSpecificLevelStream(['fatal', 'error'], process.stdout, 'error')
    }
  ]
});


export default createLogger;
