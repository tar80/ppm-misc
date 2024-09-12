/* @file EntryTip customizer
 * @arg 0 {string} - *entrytip options
 * @arg 1 {number} - If non-zero, display ex-comments
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {info} from '@ppmdev/modules/data.ts';
import {isBottom, isEmptyStr} from '@ppmdev/modules/guard.ts';

if (!String.prototype.repeat) {
  String.prototype.repeat = function (n: number): string {
    return n > 1 ? Array(n + 1).join(this as string) : '';
  };
}

/* User defined */
const USER = {
  name_length: 12,        //項目欄の幅揃え桁数
  line_separetor: '-',    //区切り文字
  line_repeat_count: 42,  //区切りの文字数
  ex_comment_row: 2       //拡張コメントを何行目から表示するか
};

const infoTip: string[] = [];
const sepalateLine = USER.line_separetor.repeat(USER.line_repeat_count);
const getTipItems = (): void => {
  /**
   * @desc 表示項目の登録
   * @desc 最初の行の''には装飾文字などの前置詞を指定できる
   *
   * prop(0,1,2,3?,4?)
   * @param 0 {boolean} choice - 値がない(空)の場合に項目名を表示するかどうか
   * @param 1 {string} name    - 任意の項目名
   * @param 2 {string} key     - プロパティ名
   * @param 3 {RegExp} reg?    - 正規表現(プロパティの値から切り出す範囲)
   * @param 4 {string} rep?    - 置換文字列
   */
  infoTip.push('' + PPx.Extract('%C'));
  prop(false, '', 'Comment');
  infoTip.push(sepalateLine); // 区切り行
  prop(false, 'Contents', '内容の種類');
  prop(true, 'Extension', 'Internal Type', /.*\(:(.*)\)/, '$1');
  prop(true, 'Type', '種類');
  prop(true, 'Link path', 'リンク先');
  prop(true, 'Description', 'Description');
  prop(true, 'Version', 'Version');
  prop(true, 'Image size', '大きさ');
  prop(true, 'Create time', 'Create time');
  prop(true, 'Last write', 'Last Write');
  prop(true, 'Last access', 'Last Access');
};

const main = (): void => {
  const [options, showExComment] = safeArgs('', false);
  getTipItems();

  if (showExComment) {
    const idx = getCommentIdx();
    for (let i = 1, k = 10, next = 1; i <= k; i++) {
      const comment = PPx.Entry.GetComment(i);

      if (!isEmptyStr(comment)) {
        const name = `Comment${next}`;
        infoTip.splice(idx + next, 0, `${name}${align(name)}:${comment}`);
        next++;
      }
    }
  }

  PPx.Execute(`*entrytip ${options} "${infoTip.join('%bn')}"%&*string i,TipText=%:*string i,TipWnd=`);
};

const align = (name: string): string => ' '.repeat(Math.max(0, USER.name_length - name.length));

const getCommentIdx = (): number => {
  for (var i = 1, k = infoTip.length; i < k; i++) {
    const line_ = infoTip[i];

    if (~line_.indexOf(sepalateLine)) {
      return i;
    }
  }

  return USER.ex_comment_row ?? 0;
};

const data = PPx.Entry.Information().split(info.nlcode);
const dataLength = data.length;
const _searchProp = (key: string): string | void => {
  for (let i = 0; i < dataLength; i++) {
    const line_ = data[i];

    if (~line_.indexOf(key)) {
      return line_;
    }
  }
};
const prop = (choice: boolean, name: string, key: string, reg?: RegExp, rep?: string): void => {
  const line = _searchProp(key);
  const emptyName = isEmptyStr(name);

  if (!emptyName) {
    const alignment = ' '.repeat(Math.max(0, USER.name_length - name.length));
    name = `${name}${alignment}:`;
  }

  if (isBottom(line)) {
    if (choice && !emptyName) {
      infoTip.push(name);
    }

    return;
  }

  let value = line.slice(line.indexOf(':') + 1);

  if (!isBottom(reg) && !isBottom(rep)) {
    value = value.replace(reg, rep);
  }

  infoTip.push(`${name}${value}`);
};

main();
