//!*script
// deno-lint-ignore-file no-var
/**
 * Customize entrytip
 *
 * @arg 0 the *entrytip command-option
 */

var NL_CHAR = '\r\n';

/* Constants */
var NAME_LENGTH = 12;
var LINE_SEPARETOR = '-';
var EX_COMMENT = true;
var EX_COMMENT_COL = 2;

/* Initial */
if (!String.prototype.repeat) {
  String.prototype.repeat = function (num) {
    return num > 1 ? Array(num + 1).join(this) : '';
  };
}

var g_option = (function (arg) {
  var len = arg.length;

  return len === 0 ? '' : arg.Item(0);
})(PPx.Arguments);
var sep_line = LINE_SEPARETOR.repeat(43);
var data = PPx.Entry.Information.split(NL_CHAR);
var prop = function (fix, name, key, reg, rep) {
  var name_ = name === null ? '' : name + ' '.repeat(Math.max(0, NAME_LENGTH - name.length)) + ':';
  var line = (function () {
    for (var i = 0, l = data.length; i < l; i++) {
      var thisLine = data[i];

      if (~thisLine.indexOf(key)) {
        return thisLine;
      }
    }
  })();

  if (typeof line === 'undefined') {
    if (fix) {
      info_tip.push(name_);
    }

    return;
  }

  var value = line.slice(line.indexOf(':') + 1);

  if (typeof reg !== 'undefined') {
    value = value.replace(reg, rep);
  }

  info_tip.push(name_ + value);
  return;
};

/* Create a headline */
var info_tip = ['' + PPx.Extract('%C')];

/* Create items */
prop(false, null, 'Comment');
info_tip.push(sep_line);
prop(true, 'Extension', 'Internal Type', /.*\(:(.*)\)/, '$1');
prop(true, 'Type', '種類');
prop(true, 'Link path', 'リンク先');
prop(true, 'Description', 'Description');
prop(true, 'Version', 'Version');
prop(true, 'Image size', '大きさ');
prop(true, 'Create time', 'Create time');
prop(true, 'Last write', 'Last Write');
prop(true, 'Last access', 'Last Access');

if (EX_COMMENT) {
  var startIdx = (function () {
    for (var i = 1, l = info_tip.length; i < l; i++) {
      var thisLine = info_tip[i];

      if (~thisLine.indexOf(sep_line)) {
        return i;
      }
    }

    return EX_COMMENT_COL || 0;
  })();

  for (var i = 1, l = 10, c = 1; i <= l; i++) {
    var thisComment = PPx.Entry.GetComment(i);

    if (thisComment !== '') {
      var name = 'Comment' + c;
      info_tip.splice(startIdx + c, 0, name + ' '.repeat(Math.max(0, NAME_LENGTH - name.length)) + ':' + thisComment);
      c++;
    }
  }
}

PPx.Execute('*entrytip ' + g_option + ' "' + info_tip.join('%bn') + '"');
