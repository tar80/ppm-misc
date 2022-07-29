﻿//!*script
/**
 * Help Reference
 *
 * arg 0 Path to offline-help-files parent directory
 * arg 1 Help search-bar title
 * arg 2 Search word
 */

'use strict';

/* Initial */
// Read module
const st = PPx.CreateObject('ADODB.stream');
let module = function (filepath) {
  st.Open;
  st.Type = 2;
  st.Charset = 'UTF-8';
  st.LoadFromFile(filepath);
  const data = st.ReadText(-1);
  st.Close;

  return Function(' return ' + data)();
};

// Load module
const util = module(PPx.Extract('%*getcust(S_ppm#global:module)\\util.js'));
module = null;

const g_help = ((args = PPx.Arguments()) => {
  const len = args.length;

  if (len < 2) {
    util.error('arg');
  }

  const wd = args.Item(0);

  return {
    words: `${wd}\\ppxwords.html`,
    index: `${wd}\\ppxindex.html`,
    page: `${wd}\\ppxhelp.html`,
    frame: `${wd}\\ppxframe.html`,
    title: args.Item(1),
    term: len > 2 ? args.item(2).toLowerCase() : '',
    browser: '%*getcust(S_ppm#user:browser) %*getcust(S_ppm#user:helpopt)'
  };
})();

const fso = PPx.CreateObject('Scripting.FileSystemObject');

if (!fso.FileExists(g_help.frame)) {
  const frame_html = fso.CreateTextFile(g_help.frame, true, false);
  frame_html.WriteLine(
    ' <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Frameset//EN" "http://www.w3.org/TR/html4/frameset.dtd"><html lang="ja"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>PPx help</title></head>'
  );
  frame_html.WriteLine(
    '<frameset cols="20%,*"><frame src="ppxwords.html" name="index"><frame src="ppxhelp.html" name="main"><noframes><body><a href="ppxhelp.html"></a></body></noframes></frameset></html>'
  );
  frame_html.Close();
}

if (!fso.FileExists(g_help.words)) {
  PPx.Execute(`*setcaption ${g_help.title} *Getting ppxwords.html now.*`);
  PPx.Execute(`*httpget "http://toro.d.dooo.jp/ppxwords.html","${g_help.words}"`);
}

if (!fso.FileExists(g_help.index)) {
  PPx.Execute(`*setcaption ${g_help.title} *Getting ppxindex.html now.*`);
  PPx.Execute(`*httpget "http://toro.d.dooo.jp/ppxindex.html","${g_help.index}"`);
}

if (!fso.FileExists(g_help.page)) {
  PPx.Execute(`*setcaption ${g_help.title} *Getting ppxhelp.html now.*`);
  PPx.Execute(`*httpget "http://toro.d.dooo.jp/ppxhelp.html","${g_help.page}"`);
}

if (g_help.term === '') {
  PPx.Execute('%K"@ESC"');
  PPx.Execute(`*execute ,${g_help.browser} ${g_help.frame}`);
  PPx.Quit(1);
}

const result = [];
const url = g_help.page.replace(/\\/g, '/');
const reg = /^<a href="ppxhelp\.html#(.*)"\starget="main">(.+)<\/a><br>$/;
const words_html = fso.OpenTextFile(g_help.words);
const lines = words_html.ReadAll().split('\n');
words_html.Close();

PPx.Execute(`*setcaption ${g_help.title}`);

for (let i = 0, l = lines.length, m = 0; i < l; i++) {
  const thisLine = lines[i];

  if (thisLine.toLowerCase().lastIndexOf(g_help.term) > 40) {
    thisLine.replace(reg, (_p0, p1, p2) => {
      const p2_ = p2.replace(
        /%|<i>|<\/i>|&quot;|&amp;/g,
        (m) => ({'%': '%%%%', '<i>': '', '</i>': '', '&quot;': '', '&amp;': ''}[m])
      );
      const m_ = String.fromCharCode(m + 65);

      result.push(`*setcust M_ppmHelp:&${m_}: ${p2_}=${g_help.browser} file:///${url}#${p1}`);
    });

    m++;

    if (m > 25) {
      PPx.SetPopLineMessage('!"Too many matchs. stop search.');
      break;
    }
  }
}

if (result.length > 0) {
  PPx.Execute(result.join('%:'));
  PPx.Execute('%M_ppmHelp,0');
  PPx.Execute('*deletecust "M_ppmHelp"');
  PPx.Execute('*cursor -5');
  PPx.Quit(1);
}

PPx.Execute(`*setcaption ${g_help.title}   *Not hits* %: %K"@^A`);