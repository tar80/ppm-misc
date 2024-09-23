/* @file Search in help
 * @arg 0 {string} - Specify directory path containing help files
 * @arg 1 {string} - Specify search word
 * @arg 2 {string} - If "DEBUG" is specified, debug messages are displayed
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {info, tmp, useLanguage} from '@ppmdev/modules/data.ts';
import debug from '@ppmdev/modules/debug.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {readLines, writeLines} from '@ppmdev/modules/io.ts';
import type {Error_String} from '@ppmdev/modules/types.ts';
import {langSearchHelp} from './mod/language.ts';

const MENU_NAME = 'M_ppmHelp';
const ADDRESS_PPX_HOME = 'http://toro.d.dooo.jp';
// const ADDRESS_PPX_HOME = 'https://raw.githubusercontent.com/toroidj/toroidj.github.io/master';
const HTML_ENCODE = 'utf8';
const HTML_LINEFEED = '\n';
const PAGE = {
  words: 'ppxwords.html',
  index: 'ppxindex.html',
  help: 'ppxhelp.html',
  frame: 'ppxframe.html'
} as const;
const URLPPX_HOME = PPx.Extract('%*getcust(S_ppm#user:misc_ppxhp)') || ADDRESS_PPX_HOME;
const BROWSER_PATH = '%*extract("%*getcust(S_ppm#user:misc_browser)") %*getcust(S_ppm#user:misc_helpopt)';
const lang = langSearchHelp[useLanguage()];

type Cache = {words: string[]; isDebug: boolean};
const cache = {words: [], isDebug: false} as Cache;

const main = (): void => {
  const [parent, searchWord, debugMode] = safeArgs('', '', '0');
  cache.isDebug = debugMode === 'DEBUG';

  if (isEmptyStr(parent) || !fso.FolderExists(parent)) {
    PPx.Echo(lang.failedGetPath);
    PPx.Quit(-1);
  }

  {
    const [error, errorMsg] = prepareHelpFiles(parent, PAGE);

    if (error) {
      PPx.Echo(errorMsg);
      PPx.Quit(-1);
    }
  }

  if (isEmptyStr(searchWord)) {
    PPx.Execute('%K"@ESC"');
    PPx.Execute(`*launch ${BROWSER_PATH} ${parent}\\${PAGE.frame}`);

    return;
  }

  const path = `${parent}\\${PAGE.words}`;
  const [error, data] = readLines({path, enc: HTML_ENCODE});

  if (error) {
    PPx.Execute('%K"@ESC"');
    PPx.Echo(data);
    PPx.Quit(-1);
  }

  PPx.StayMode = 2;
  cache.words = data.lines;
  ppx_resume(parent, searchWord);
};

const rgx1 = /^<a href="ppxhelp\.html#(.*)"\starget="main">(.+)<\/a><br>$/;
const rgx2 = /%|<\/?i>|&(quot|amp|lt|gt);/g;
const convChars = {'%': '%%', '<i>': '', '</i>': '', '&quot;': '', '&amp;': '', '&lt;': '<', '&gt;': '>'} as const;

const ppx_finally = (isDebug: boolean): void => {
  isDebug && PPx.Echo('[INFO] ppx_finally searchHelp.stay.js');
};

const ppx_resume = (parent: string, searchWord: string): void => {
  if (isEmptyStr(searchWord)) {
    return;
  }

  const menuTable = [`${MENU_NAME}	={`];
  const uri = `file:///${parent.replace(/\\/g, '/')}/${PAGE.help}`;
  let [row, n] = [9, 0];

  do {
    let line = cache.words[row];

    if (line.toLowerCase().lastIndexOf(searchWord) > 40) {
      line.replace(rgx1, (_m, page, sentence) => {
        sentence = sentence.replace(rgx2, (m: keyof typeof convChars) => convChars[m]);
        const chr = String.fromCharCode(n + 65);
        menuTable.push(`&${chr}: ${sentence}	= *launch ${BROWSER_PATH} ${uri}#${page}`);

        return '';
      });

      n++;

      if (n > 25) {
        PPx.linemessage(lang.upperLimit);
        break;
      }
    }

    row++;
  } while (cache.words[row]);

  if (n === 0) {
    PPx.Execute(`*linemessage ${lang.noMatche}%:%K"@^A"`);

    return;
  }

  menuTable.push('}');

  const cfgPath = tmp().file;
  const [error, errorMsg] = writeLines({path: cfgPath, data: menuTable, enc: info.encode, linefeed: info.nlcode, overwrite: true});

  if (error) {
    PPx.Echo(errorMsg);
    PPx.Quit(-1);
  }

  PPx.Execute(`*setcust @${cfgPath}`);
  PPx.Execute(`%${MENU_NAME},A`);
  PPx.Execute('*deletecust "M_ppmHelp"');
  PPx.Execute('*cursor -5');
};

const _getHtml = (parent: string, name: string): void => {
  const path = `${parent}\\${name}`;

  if (!fso.FileExists(path)) {
    PPx.Execute(`*linemessage *${lang.getHtml}* ${name}`);
    PPx.Execute(`*httpget "${URLPPX_HOME}/${name}","${path}"`);
    PPx.Execute('*linemessage');
  }
};

const prepareHelpFiles = (parent: string, page: typeof PAGE): Error_String => {
  const path = `${parent}\\${page.frame}`;

  if (!fso.FileExists(path)) {
    const data = [
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd"><html lang="ja"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>PPx help</title></head>',
      '<frameset cols="20%,*"><frame src="ppxwords.html" name="index"><frame src="ppxhelp.html" name="main"><noframes><body><a href="ppxhelp.html"></a></body></noframes></frameset></html>'
    ];
    const [error, errorMsg] = writeLines({path, data, enc: HTML_ENCODE, linefeed: HTML_LINEFEED, overwrite: true});

    if (error) {
      return [true, errorMsg];
    }
  }

  _getHtml(parent, page.words);
  _getHtml(parent, page.index);
  _getHtml(parent, page.help);

  return [false, ''];
};

main();
