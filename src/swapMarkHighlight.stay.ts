/* @file Swap marks and highlights with each other
 * @arg 0 {number} - Highlight number. default is "1"
 * @arg 1 {string} - If "DEBUG" is specified, debug messages are displayed
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {info} from '@ppmdev/modules/data.ts';
import debug from '@ppmdev/modules/debug.ts';
import {atLoadEvent} from '@ppmdev/modules/staymode.ts';
import type {HighlightNumber} from '@ppmdev/modules/types.ts';

type Cache = {[K in string]: HighlightNumber};
let cache: Cache = {};

const main = () => {
  const [hlNumber, debugMode] = safeArgs('1', '0');

  PPx.StayMode = 2;
  ppx_resume(hlNumber, debugMode);
  atLoadEvent.discard({table: 'KC_main', label: 'misc_swap', cond: 'once', debug: debugMode});
};

// const ppx_finally = (): void => {
//   debug && PPx.Echo('[WARN] instance remain swapMarkHighlight.stay.js');
// };
const ppx_resume = (hlNumber: string, debugMode: string): void => {
  const newCache: Cache = {};
  const isDebug = debugMode === 'DEBUG';
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
