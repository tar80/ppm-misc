﻿var validArgs=function(){for(var e=[],n=PPx.Arguments;!n.atEnd();n.moveNext())e.push(n.value);return e},safeArgs=function(){for(var e=[],n=validArgs(),t=0,r=arguments.length;t<r;t++)e.push(_valueConverter(t<0||arguments.length<=t?undefined:arguments[t],n[t]));return e},_valueConverter=function(e,n){if(null==n||""===n)return null!=e?e:undefined;switch(typeof e){case"number":var t=Number(n);return isNaN(t)?e:t;case"boolean":return null!=n&&"false"!==n&&"0"!==n;default:return n}},e={ppmName:"ppx-plugin-manager",ppmVersion:.95,language:"ja",encode:"utf16le",nlcode:"\r\n",nltype:"crlf",ppmID:"P",ppmSubID:"Q"},isEmptyStr=function(e){return""===e},isBottom=function(e){return null==e};String.prototype.repeat||(String.prototype.repeat=function(e){return e>1?Array(e+1).join(this):""});var n={name_length:12,line_separetor:"-",line_repeat_count:42,ex_comment_row:2},t=[],r=n.line_separetor.repeat(n.line_repeat_count),getTipItems=function(){t.push(""+PPx.Extract("%C")),prop(!1,"","Comment"),t.push(r),prop(!1,"Contents","内容の種類"),prop(!0,"Extension","Internal Type",/.*\(:(.*)\)/,"$1"),prop(!0,"Type","種類"),prop(!0,"Link path","リンク先"),prop(!0,"Description","Description"),prop(!0,"Version","Version"),prop(!0,"Image size","大きさ"),prop(!0,"Create time","Create time"),prop(!0,"Last write","Last Write"),prop(!0,"Last access","Last Access")},main=function(){var e=safeArgs("",!1),n=e[0],r=e[1];if(getTipItems(),r)for(var i=getCommentIdx(),a=1,o=10,u=1;a<=o;a++){var p=PPx.Entry.GetComment(a);if(!isEmptyStr(p)){var l="Comment"+u;t.splice(i+u,0,""+l+align(l)+":"+p),u++}}PPx.Execute("*entrytip "+n+' "'+t.join("%bn")+'"%&*string i,TipText=%:*string i,TipWnd=')},align=function(e){return" ".repeat(Math.max(0,n.name_length-e.length))},getCommentIdx=function(){for(var e=1,i=t.length;e<i;e++){if(~t[e].indexOf(r))return e}return n.ex_comment_row},i=PPx.Entry.Information().split(e.nlcode),a=i.length,_searchProp=function(e){for(var n=0;n<a;n++){var t=i[n];if(~t.indexOf(e))return t}},prop=function(e,r,i,a,o){var u=_searchProp(i),p=isEmptyStr(r);p||(r=""+r+" ".repeat(Math.max(0,n.name_length-r.length))+":");if(isBottom(u))e&&!p&&t.push(r);else{var l=u.slice(u.indexOf(":")+1);isBottom(a)||isBottom(o)||(l=l.replace(a,o)),t.push(""+r+l)}};main();
