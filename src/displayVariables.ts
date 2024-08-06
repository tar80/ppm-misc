/* @file Displays the values of multiple specified variables
 * @arg 0 {number} - Specify the output. 0=PPe | 1=echo | 2=report
 * @arg 1+ {string} - A variable name
 * NOTE: The variable name with a prefix "$" means a script variable
 * $DirectoryType = PPx.DirectoryType
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import {info, tmp} from '@ppmdev/modules/data.ts';
import {writeLines} from '@ppmdev/modules/io.ts';
import {pathSelf} from '@ppmdev/modules/path.ts';
import {runPPe} from '@ppmdev/modules/run.ts';
import debug from '@ppmdev/modules/debug.ts';

type Output = '0' | '1' | '2';
const TITLE = 'ppm-misc variables';
const LIST_NAME = '%sgu"ppmcache"\\complist\\dispvar.txt';

const main = () => {
  const args: string[] = validArgs();
  const len = args.length;

  if (len === 0 || Number(args[0]) > 2) {
    const {scriptName, parentDir} = pathSelf();
    PPx.Execute(`*script "%sgu'ppmlib'\\errors.js",arg,"${parentDir}\\${scriptName}"`);
    PPx.Quit(-1);
  }

  if (len === 1) {
    const inputOpts =
      `'title': '${TITLE}',` +
      "'mode':'e'," +
      "'list':'on'," +
      "'module':'off'," +
      "'detail':'user1'," +
      "'leavecancel':false," +
      `'file':'${LIST_NAME}'`;
    const data = PPx.Extract(`%*script("%sgu'ppmlib'\\input.js","{${inputOpts}}")`);

    if (data === '[error]' || /^\s*;/.test(data)) {
      PPx.Quit(-1);
    }

    args.push(...data.split(','));
  }

  const output = args.shift() as Output;
  const values: string[] = [];

  while (args.length > 0) {
    let variable = args.shift();

    if (variable?.indexOf('$') === 0) {
      const method = variable.slice(1);
      variable = `PPx.${method}:\t${PPx[method as keyof typeof PPx]}`;
    } else {
      variable = `${variable}:\t${PPx.Extract(variable)}`;
    }

    values.push(variable);
  }

  display[output](values);
};

const display = {
  0(data: string[]) {
    const path = tmp().file;
    writeLines({path, data, overwrite: true});

    return runPPe({title: TITLE, tab: 25, path, modify: 'silent'});
  },
  1(data: string[]) {
    return PPx.Execute(`%"${TITLE}"%I"%(${data.join(info.nlcode)}%)"`);
  },
  2(data: string[]) {
    return PPx.report(data.join(info.nlcode));
  }
};

main();
