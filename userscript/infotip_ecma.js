//!*script
/**
 * Customize entrytip
 *
 * @arg 0 the *entrytip command-option
 */

'use strict';

/* Constants */
const NAME_LENGTH = 12;
const LINE_SEPARETOR = '-';
const LINE_REPEAT_COUNT = 42;

/* Initial */
const g_option = ((arg = PPx.Arguments()) => {
  const len = arg.length;

  return len === 0 ? '' : arg.Item(0);
})();
const sep_line = LINE_SEPARETOR.repeat(LINE_REPEAT_COUNT);
const data = PPx.Entry.Information().split('\r\n');
const prop = (name, key, reg, rep) => {
  const line = data.find((v) => v.includes(key));
  const name_ = name === null ? '' : name.padEnd(NAME_LENGTH, ' ') + ':';

  if (line === undefined) {
    return name_;
  }

  let value = line.slice(line.indexOf(':') + 1);

  if (reg !== undefined) {
    value = value.replace(reg, rep);
  }

  return `${name_}${value}`;
};
const choiceProp = (pos, name, key, reg, rep) => {
  const line = data.find((v) => v.includes(key));

  if (line === undefined) {
    return;
  }

  let value = line.slice(line.indexOf(':') + 1);

  if (reg !== undefined) {
    value = value.replace(reg, rep);
  }

  const name_ = name === null ? '' : name.padEnd(NAME_LENGTH, ' ') + ':';

  infoTip.splice(pos, 0, `${name_}${value}`);
};

/* Create an InfoTip */
/**
 * 値がない場合でも項目名が表示される項目
 *
 * @param {string} name  - 任意の項目名
 * @param {string} key   - プロパティ名
 * @param {string} [reg] - 正規表現(プロパティの値から切り出す範囲)
 * @param {string} [rep] - 置換文字列
 */
const infoTip = [
  `${PPx.Extract('%C')}`,
  sep_line,
  prop('Extension', 'Internal Type', /.*\(:(.*)\)/, '$1'),
  prop('Type', '種類'),
  prop('Link path', 'リンク先'),
  prop('Description', 'Description'),
  prop('Version', 'Version'),
  prop('Image size', '大きさ'),
  prop('Create time', 'Create time'),
  prop('Last write', 'Last Write'),
  prop('Last access', 'Last Access')
];

/**
 * 値がない場合は項目名が表示されない項目
 *
 * @param {number} pos   - 項目を挿入する(上からの)位置
 * @param {string} name  - 任意の項目名
 * @param {string} key   - プロパティ名
 * @param {string} [reg] - 正規表現(プロパティの値から切り出す範囲)
 * @param {string} [rep] - 置換文字列
 */
choiceProp(1, null, 'Comment');
choiceProp(3, 'Contents', '内容の種類');

{
  const startIdx = infoTip.findIndex((v) => v.includes(sep_line));

  for (let i = 1, l = 10, c = 1; i <= l; i++) {
    const thisComment = PPx.Entry.GetComment(i);

    if (thisComment !== '') {
      choiceProp(startIdx + c, `Comment${i}`, thisComment);
      c++;
    }
  }
}

PPx.Execute(`*entrytip ${g_option} "${infoTip.join('%bn')}"`);
