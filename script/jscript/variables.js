//!*script
// deno-lint-ignore-file no-var
/**
 * Get the specified variable and print the list
 *
 * @arg 0  Output style. 0:ppe | 1:echo
 * @arg 1+ PPx variable name
 * NOTE: The variable name with a prefix "$" means a script variable
 * $DirectoryType > PPx.DirectoryType
 */

var NL_CHAR = '\r\n';
var TITLE = 'VARIABLES';

/* Initial */
// Read module
var st = PPx.CreateObject('ADODB.stream');
var module = function (filepath) {
  st.Open;
  st.Type = 2;
  st.Charset = 'UTF-8';
  st.LoadFromFile(filepath);
  var data = st.ReadText(-1);
  st.Close;

  return Function(' return ' + data)();
};

// Load module
var util = module(PPx.Extract('%*getcust(S_ppm#global:module)\\util.js'));
module = null;

/* Get the target variables list */
var output = (function (args) {
  var len = args.length;

  if (len < 2) {
    PPx.Execute('*script "%*getcust(S_ppm#global:lib)\\errors.js",arg,' + PPx.ScriptName);
    PPx.Quit(-1);
  }

  var result = [];

  for (var i = 1, l = args.length; i < l; i++) {
    var v = args(i);
    result.push(
      v.indexOf('$') === 0
        ? 'PPx.' + v.slice(1) + ':\t' + PPx[v.slice(1)]
        : v + '\t' + PPx.Extract(v)
    );
  }

  return {
    style: args.Item(0) | 0,
    vars: result
  };
})(PPx.Arguments);

({
  0: function () {
    return util.printw.apply({cmd: 'ppe', title: TITLE, tab: 25}, output.vars);
  },
  1: function () {
    return PPx.Execute('%"' + TITLE + '"%I"%(' + output.vars.join(NL_CHAR) + '%)"')
  }
}[output.style]());
