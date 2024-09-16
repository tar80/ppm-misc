//!*script
if (!String.prototype.repeat) {
  String.prototype.repeat = function (n) {
    return n > 1 ? Array(n + 1).join(this) : '';
  };
}
var nlcode = '\r\n';
var infoTip = [];

/** ユーザー指定 **/
var USER = {
  name_length: 12, //項目欄の桁揃え文字数
  line_separetor: '-', //区切り文字
  line_repeat_count: 42, //区切りの文字数
  ex_comment: true, //拡張コメントを表示するかどうか
  ex_comment_row: 2 //拡張コメントを何行目から表示するか
};
var sepalateLine = USER.line_separetor.repeat(USER.line_repeat_count);
var getTipItems = function getTipItems() {
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
/** ユーザー指定 ここまで **/

var main = function main() {
  var _safeArgs = safeArgs('', false),
    options = _safeArgs[0],
    showExComment = _safeArgs[1];
  getTipItems();
  if (showExComment) {
    var idx = getCommentIdx();
    for (var i = 1, k = 10, next = 1; i <= k; i++) {
      var comment = PPx.Entry.GetComment(i);
      if (!isEmptyStr(comment)) {
        var name = 'Comment' + next;
        infoTip.splice(idx + next, 0, '' + name + align(name) + ':' + comment);
        next++;
      }
    }
  }
  PPx.Execute('*entrytip ' + options + ' "' + infoTip.join('%bn') + '"%&*string i,TipText=%:*string i,TipWnd=');
};
var safeArgs = function safeArgs() {
  var typedArgs = [];
  var args = [];
  for (var obj = PPx.Arguments; !obj.atEnd(); obj.moveNext()) {
    args.push(obj.value);
  }
  for (var i = 0, k = arguments.length; i < k; i++) {
    typedArgs.push(_valueConverter(i < 0 || arguments.length <= i ? undefined : arguments[i], args[i]));
  }
  return typedArgs;
};
var _valueConverter = function _valueConverter(defaultValue, argValue) {
  if (argValue == null || argValue === '') {
    return defaultValue != null ? defaultValue : undefined;
  }
  switch (typeof defaultValue) {
    case 'number':
      var n = Number(argValue);
      return isNaN(n) ? defaultValue : n;
    case 'boolean':
      return argValue === 'false' || argValue === '0' || argValue == null ? false : true;
    default:
      return argValue;
  }
};
var isEmptyStr = function isEmptyStr(value) {
  return value === '';
};
var isBottom = function isBottom(value) {
  return value == null;
};
var align = function align(name) {
  return ' '.repeat(Math.max(0, USER.name_length - name.length));
};
var getCommentIdx = function getCommentIdx() {
  for (var i = 1, k = infoTip.length; i < k; i++) {
    var line_ = infoTip[i];
    if (~line_.indexOf(sepalateLine)) {
      return i;
    }
  }
  return USER.ex_comment_row;
};
var data = PPx.Entry.Information.split(nlcode);
var dataLength = data.length;
var _searchProp = function _searchProp(key) {
  for (var i = 0; i < dataLength; i++) {
    var line_ = data[i];
    if (~line_.indexOf(key)) {
      return line_;
    }
  }
};
var prop = function prop(choice, name, key, reg, rep) {
  var line = _searchProp(key);
  var emptyName = isEmptyStr(name);
  if (!emptyName) {
    var alignment = ' '.repeat(Math.max(0, USER.name_length - name.length));
    name = '' + name + alignment + ':';
  }
  if (isBottom(line)) {
    if (choice && !emptyName) {
      infoTip.push(name);
    }
    return;
  }
  var value = line.slice(line.indexOf(':') + 1);
  if (!isBottom(reg) && !isBottom(rep)) {
    value = value.replace(reg, rep);
  }
  infoTip.push('' + name + value);
};
main();
