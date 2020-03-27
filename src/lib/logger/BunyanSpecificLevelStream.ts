import * as bunyan from 'bunyan';
const safeCycles = bunyan.safeCycles;

class BunyanSpecificLevelStream {
  stream: any;
  levels: {};

  constructor(levels, stream) {
    this.stream = stream;
    const _levels = {};
    levels.forEach((lvl) => {
        _levels[bunyan.resolveLevel(lvl)] = true;
    });
    this.levels = _levels;
  }
  write(rec) {
    if (this.levels[rec.level] !== undefined) {
      const str = JSON.stringify(rec, safeCycles()) + '\n';
      this.stream.write(str);
    }
  }
}

export default BunyanSpecificLevelStream;