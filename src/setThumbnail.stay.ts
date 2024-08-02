/* @file Create thumbnails and set it in the entries
 */

import '@ppmdev/polyfills/arrayIndexOf.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {useLanguage} from '@ppmdev/modules/data.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {langCreateTumbnail} from './mod/language.ts';
import debug from '@ppmdev/modules/debug.ts';

const FOLDER_THUMB = 'folder.jpg';
const LIST_NAME = 'thumbcmd.txt';
const PLUGIN_NAME = 'ppm-misc';

const lang = langCreateTumbnail[useLanguage()];
const ppcid = PPx.Extract('%n');
const pwd = PPx.Extract('%FD');
const thumbDir = PPx.Extract('%*temp(misc_thumb,d)');
const hasMark = PPx.EntryMarkCount > 0;
const entry = PPx.Entry.AllEntry;
let fallback: Function;
let [allCount, count] = [0, 0];

const main = (): void => {
  const inputOpts =
    `'title':'${lang.title}',` +
    "'mode':'e'," +
    "'leavecancel':true," +
    "'list':'on'," +
    "'module':'off'," +
    "'detail':'user1'," +
    `'file':'%sgu"ppmcache"\\list\\${LIST_NAME}'`;
  const data = PPx.Extract(`%*script("%sgu'ppmlib'\\input.js","{${inputOpts}}")`);

  if (data === '[error]' || /^\s*;/.test(data)) {
    PPx.Execute(`*delete ${thumbDir}`);
    PPx.Quit(-1);
  }

  fallback = !isEmptyStr(data) ? createThumbnail(data) : setThumbnail;
  fallback();
};

const ppx_Progress = () => fallback();
const ppx_resume = (): void => {
  if (!isOkey(lang.halfway)) {
    return;
  }

  PPx.StayMode = 0;
  setThumbnail(true);
};

const extract = (cmd: string): string => PPx.Extract(`%*extract(${ppcid},"%(${cmd}%)")`);
const linemessage = (msg: string): number => PPx.Execute(`*execute ${ppcid},*linemessage !"${msg}`);
const isOkey = (msg: string): boolean => PPx.Execute(`%"${PLUGIN_NAME}"%Q"${msg}"`) === 0;

const createThumbnail = (data: string): Function => {
  PPx.StayMode = 2;
  const instance = PPx.StayMode;
  const [exts, cmdSpec] = extractInputData(data);
  const cmdlines: string[] = [];

  for (; !entry.atEnd(); entry.moveNext()) {
    const entryName = entry.Name;

    if (hasMark && entry.Mark === 0) {
      continue;
    }

    if (entry.Attributes & 16 || !~exts.indexOf(PPx.Extract(`%*name(T,"${entryName}")`))) {
      continue;
    }

    cmdlines.push(createCmdline(cmdSpec, `${pwd}\\${entryName}`, `${thumbDir}\\${entry.Index}.bmp`));
  }

  allCount = cmdlines.length;
  entry.Reset();

  return (): void => {
    linemessage(`${lang.progress} ${count}/${allCount}`);
    count++;

    if (cmdlines.length > 0) {
      PPx.Execute(`*run -min -nostartmsg -noppb %0ppbw.exe -c ${cmdlines.shift()}%%&*execute ${ppcid},*script ":${instance},ppx_Progress"`);

      return;
    }

    PPx.StayMode = 0;
    setThumbnail(allCount > 0);
  };
};

const setThumbnail = (hasData = false): void => {
  if (!hasData && PPx.EntryDisplayDirectories === 0) {
    linemessage(lang.noEntries);

    return;
  }

  if (PPx.Extract('%n') !== ppcid) {
    PPx.Execute(`*focus ${ppcid}%:*wait 0,1`);
  }

  if (!isOkey(lang.start)) {
    return;
  }

  if (pwd !== extract('%FD')) {
    PPx.Execute(`%j"${pwd}"`);
  }

  while (!hasImageView()) {
    if (!isOkey(lang.viewstyle)) {
      PPx.Execute(`*delete ${thumbDir}`);

      return;
    }

    PPx.Execute('*viewstyle -temp');
  }

  const cursorIdx = PPx.EntryIndex;
  const names = getFolderThumbNames();

  for (; !entry.atEnd(); entry.moveNext()) {
    if (hasMark && entry.Mark === 0) {
      continue;
    }

    if (entry.Attributes & 16) {
      for (const name of names) {
        const filename = `${entry.Name}\\${name}`;

        if (fso.FileExists(filename)) {
          PPx.EntryIndex = entry.Index;
          PPx.Execute(`*setentryimage ${filename} -save`);
          break;
        }
      }
    } else if (hasData) {
      const idx = entry.Index;
      const path = `${thumbDir}\\${idx}.bmp`;

      if (fso.FileExists(path)) {
        PPx.EntryIndex = idx;
        PPx.Execute(`*setentryimage ${path} -save`);
      }
    }
  }

  PPx.EntryIndex = cursorIdx;
  PPx.Execute('*zoom +0');
  PPx.Execute(`*delete ${thumbDir}`);
  linemessage(lang.completed);
};

const hasImageView = (): boolean => {
  const rgx = /(\s|,|)n[\d,]+/;
  const viewstyle = PPx.Extract('%*viewstyle');

  return rgx.test(viewstyle);
};

const getFolderThumbNames = (): string[] => {
  const userSpec = PPx.Extract('%*getcust(S_ppm#user:misc_thumbnames)');

  return `${FOLDER_THUMB},${userSpec}`.replace(/;/g, ',').split(',');
};

type CaptureGroup = '%src%' | '%dst%';

const _rgxGroup = /(%src%|%dst%)/g;
const createCmdline = (data: string, src: string, dst: string): string => {
  const group = {'%src%': src, '%dst%': dst} as const;

  return data.replace(_rgxGroup, (m) => group[m as CaptureGroup]);
};

const extractInputData = (data: string): [string[], string] => {
  let exts: string[] = [];
  const rgx = /^[^<]*<([^>]+)>\s*(.+)$/;
  const cmdSpec = data.replace(rgx, (_m, ext, cmd) => {
    exts = ext.replace(/;/g, ',').split(',');
    return cmd;
  });

  return [exts, cmdSpec];
};

main();
