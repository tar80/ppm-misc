/* @file Swap marks and highlights with each other
 * @arg 0 {number} - Highlight number. default is "1"
 * @arg 1 {string} - If "DEBUG" is specified, debug messages are displayed
 */

import type {HighlightNumber} from '@ppmdev/modules/types.ts';
import {info} from '@ppmdev/modules/data.ts';
import {safeArgs} from '@ppmdev/modules/argument.ts';
import {atLoadEvent} from '@ppmdev/modules/staymode.ts';
// import debug from '@ppmdev/modules/debug.ts';

type Cache = {[K in string]: HighlightNumber};
let cache: Cache = {};

const main = () => {
  const [hlNumber, debug] = safeArgs('1', '');

  PPx.StayMode = 2;
  ppx_resume(hlNumber, debug);
  atLoadEvent.hold('misc_swap', debug);
};

const ppx_resume = (hlNumber: string, debug: string): void => {
  const newCache: Cache = {};
  const isDebug = debug === 'DEBUG';
  const log: string[] = ['[DEBUG]'];

  for (const entry = PPx.Entry.AllEntry; !entry.atEnd(); entry.moveNext()) {
    if (entry.State < 2) {
      continue;
    }

    const hlNum = entry.Highlight;

    if (entry.Mark === 1) {
      entry.Mark = 0;
      const newHlNum = cache[entry.Name] ?? Number(hlNumber);
      entry.Highlight = newHlNum;
      newCache[entry.Name] = newHlNum;
    } else if (hlNum > 0) {
      entry.Mark = 1;
      entry.Highlight = 0;
      newCache[entry.Name] = hlNum;
      isDebug && log.push(`${entry.Name}: ${hlNum}`);
    }
  }

  cache = {...newCache};
  isDebug && log.length > 1 && PPx.linemessage(log.join(info.nlcode));
};

main();
