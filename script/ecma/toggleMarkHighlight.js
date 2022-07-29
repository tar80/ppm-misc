//!*script
/**
 * Toggle marks and highlights of entries
 * refference url: http://hoehoetukasa.blogspot.com/2015/08/blog-post.html
 *
 * @arg 0 Highlight number.If not specified.Specify 1.
 */

'use strict';

const hl_num = PPx.Arguments.length ? PPx.Arguments.Item(0) | 0 : 1;

// Color information for the entry to be changed this time
let new_hl_info = '';

// Color information of the last entry to be changed
const last_hl_info = JSON.parse(`{${PPx.Extract('%*extract(%%si"enHl_%n")')}}`);

const toggle = {
  1: (num, entry) => {
    entry.Mark = 0;
    const thisColor = (() => {
      if (last_hl_info[num] === undefined) {
        // Assign argument number if highlight number is not specified
        return {
          cmd: 'Highlight',
          num: hl_num
        };
      }

      // Get color information to be changed
      const colorState = [...last_hl_info[num]];

      // Restore last highlights
      return colorState[0] === 'S'
        ? {cmd: 'State', num: colorState[1]}
        : {cmd: 'Highlight', num: colorState[0]};
    })();

    entry[thisColor.cmd] = thisColor.num;
  },

  0: (num, entry) => {
    const thisMark = (() => {
      // Retrieve if entry state has changed
      if (entry.State > 3) {
        return `S${entry.State}`;
      }

      return entry.Highlight || null;
    })();

    if (thisMark === null) {
      return;
    }

    new_hl_info += `"${num}":"${thisMark}",`;
    entry.Mark = 1;
    entry.Highlight = 0;
  }
};

for (let [i, l] = [0, PPx.EntryDisplayCount]; i < l; i++) {
  const thisEntry = PPx.Entry(i);
  toggle[thisEntry.Mark](i, thisEntry);
}

// Save the highlights state that has been changed this time
PPx.Execute(`*string i,enHl_%n=${new_hl_info.slice(0, -1)}`);

// Discard highlights information when moving directory
PPx.Execute(
  '*linecust miscToggleMH_%n,' +
    'KC_main:LOADEVENT,*ifmatch !0,0%%si"enHl_%n"%%:*string i,enHl_%n=%%:*linecust miscToggleMH_%n,KC_main:LOADEVENT,' +
    '%:%K"@LOADCUST"'
);
