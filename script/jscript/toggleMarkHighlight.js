//!*script
// deno-lint-ignore-file no-var
/**
 * Toggle marks and highlights of entries
 * refference url: http://hoehoetukasa.blogspot.com/2015/08/blog-post.html
 *
 * @arg 0 Highlight number.If not specified.Specify 1.
 */

// If not specify argument case

var hl_num = PPx.Arguments.length ? PPx.Arguments.Item(0) | 0 : DEFAULT_NUMBER;

// Color information for the entry to be changed this time
var new_hl_info = [];

// Color information of the last entry to be changed
var last_hl_info = (function () {
  return Function(' return {' + PPx.Extract('%*extract(%%si"enHl_%n")') + '}')();
})();

var toggle = {
  1: function (num, entry) {
    entry.Mark = 0;
    var thisColor = (function () {
      if (typeof last_hl_info[num] === 'undefined') {
        // Assign argument number if highlight number is not specified
        return {
          cmd: 'Highlight',
          num: hl_num
        };
      }

      // Get color information to be changed
      var colorState = last_hl_info[num].split('');

      // Restore last highlights
      return colorState[0] === 'S'
        ? {cmd: 'State', num: colorState[1]}
        : {cmd: 'Highlight', num: colorState[0]};
    })();

    entry[thisColor.cmd] = thisColor.num;
  },

  0: function (num, entry) {
    var thisMark = (function () {
      // Retrieve if entry state has changed
      if (entry.State > 3) {
        return 'S' + entry.State;
      }

      return entry.Highlight || null;
    })();

    if (thisMark === null) {
      return;
    }

    new_hl_info += '"' + num + '":"' + thisMark + '",';
    entry.Mark = 1;
    entry.Highlight = 0;
  }
};

for (var i = 0, l = PPx.EntryDisplayCount; i < l; i++) {
  var thisEntry = PPx.Entry(i);
  toggle[thisEntry.Mark](i, thisEntry);
}

// Save the highlights state that has been changed this time
PPx.Execute('*string i,enHl_%n=' + new_hl_info.slice(0, -1));

// Discard highlights information when moving directory
PPx.Execute(
  '*linecust miscToggleMH_%n,' +
    'KC_main:LOADEVENT,*ifmatch !0,0%%si"enHl_%n"%%:*string i,enHl_%n=%%:*linecust miscToggleMH_%n,KC_main:LOADEVENT,' +
    '%:%K"@LOADCUST"'
);
