import * as bunyan from 'bunyan';
const safeCycles = bunyan.safeCycles;

class BunyanSpecificLevelStream {
  stream: any;
  levels: {};
  minLevel: number;

  constructor(levels: string[], stream: any, minLevel: string) {
    this.stream = stream;
    const _levels = {};
    levels.forEach((lvl) => {
        _levels[bunyan.resolveLevel(lvl)] = true;
    });
    this.levels = _levels;
    this.minLevel = bunyan.resolveLevel(minLevel);
  }
  write(rec) {
    if (this.levels[rec.level] !== undefined && rec.level >= this.minLevel) {
      const str = JSON.stringify(rec, safeCycles()) + '\n';
      this.stream.write(str);
    }
  }
}

export default BunyanSpecificLevelStream;