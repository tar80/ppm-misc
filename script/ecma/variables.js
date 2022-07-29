//!*script
/**
 * Get the specified variable and print the list
 *
 * @arg 0  Output style. 0:ppe | 1:echo
 * @arg 1+ PPx variable name
 * NOTE: The variable name with a prefix "$" means a script variable
 * $DirectoryType > PPx.DirectoryType
 */

'use strict';

const NL_CHAR = '\r\n';
const TITLE = 'VARIABLES';

/* Initial */
// Read module
const st = PPx.CreateObject('ADODB.stream');
let module = (filepath) => {
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

/* Get the target variables list */
const output = ((args = PPx.Arguments) => {
  const len = args.length;

  if (len < 2) {
    PPx.Execute('*script "%*getcust(S_ppm#global:lib)\\errors.js",arg,' + PPx.ScriptName);
    PPx.Quit(-1);
  }

  const result = [];

  for (let i = 1, l = args.length; i < l; i++) {
    const v = args(i);
    result.push(
      v.indexOf('$') === 0 ? `PPx.${v.slice(1)}\t${PPx[v.slice(1)]}` : `${v}\t${PPx.Extract(v)}`
    );
  }

  return {
    style: args.Item(0) | 0,
    vars: result
  };
})();

({
  0() {
    return util.printw.apply({cmd: 'ppe', title: TITLE, tab: 25}, output.vars);
  },
  1() {
    return PPx.Execute(`%"${TITLE}"%I"%(${output.vars.join(NL_CHAR)}%)"`);
  }
}[output.style]());
