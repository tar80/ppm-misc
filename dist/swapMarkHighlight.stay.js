﻿function _extends(){return _extends=Object.assign?Object.assign.bind():function(n){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var a in t)({}).hasOwnProperty.call(t,a)&&(n[a]=t[a])}return n},_extends.apply(null,arguments)}var n={ppmName:"ppx-plugin-manager",ppmVersion:.95,language:"ja",encode:"utf16le",nlcode:"\r\n",nltype:"crlf",ppmID:"P",ppmSubID:"Q"},validArgs=function(){for(var n=[],e=PPx.Arguments;!e.atEnd();e.moveNext())n.push(e.value);return n},safeArgs=function(){for(var n=[],e=validArgs(),t=0,a=arguments.length;t<a;t++)n.push(_valueConverter(t<0||arguments.length<=t?undefined:arguments[t],e[t]));return n},_valueConverter=function(n,e){if(null==e||""===e)return null!=n?n:undefined;switch(typeof n){case"number":var t=Number(e);return isNaN(t)?n:t;case"boolean":return"false"!==e&&"0"!==e&&null!=e;default:return e}},ppx_Discard=function(n,e){var t;PPx.StayMode=0,e=null!=(t=e)?t:"","DEBUG"===n&&PPx.linemessage("[DEBUG] discard "+e)},e={hold:function(n,e){void 0===e&&(e="0");var t=PPx.Extract("%n"),a='KC_main:LOADEVENT,*if ("'+t+'"=="%n")%:*script ":'+PPx.StayMode+',ppx_Discard",'+e+","+n+"%:*linecust "+n+"_"+t+",KC_main:LOADEVENT,";PPx.Execute("*linecust "+n+"_"+t+",%("+a+"%)"),PPx.Execute('%K"@LOADCUST"')}},t={},main=function(){var n=safeArgs("1",""),t=n[0],a=n[1];PPx.StayMode=2,ppx_resume(t,a),e.hold("misc_swap",a)},ppx_finally=function(){return PPx.Echo("[WARN] instance remain swapMarkHighlight.stay.js")},ppx_resume=function(e,a){for(var r={},i="DEBUG"===a,u=["[DEBUG]"],l=PPx.Entry.AllEntry;!l.atEnd();l.moveNext())if(!(l.State<2)){var s=l.Highlight;if(1===l.Mark){var o;l.Mark=0;var c=null!=(o=t[l.Name])?o:Number(e);l.Highlight=c,r[l.Name]=c}else s>0&&(l.Mark=1,l.Highlight=0,r[l.Name]=s,i&&u.push(l.Name+": "+s))}t=_extends({},r),i&&u.length>1&&PPx.linemessage(u.join(n.nlcode))};main();
