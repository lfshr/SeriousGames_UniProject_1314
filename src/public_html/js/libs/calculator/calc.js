function gObj(obj) {var theObj;if(document.all){if(typeof obj=="string"){return document.all(obj);}else{return obj.style;}}if(document.getElementById){if(typeof obj=="string"){return document.getElementById(obj);}else{return obj.style;}}return null;}function trimAll(sString){while (sString.substring(0,1) == ' '){sString = sString.substring(1, sString.length);}while (sString.substring(sString.length-1, sString.length) == ' '){sString = sString.substring(0,sString.length-1);} return sString;}function showDebugInfo(){}function r(A){if(A=="10x"||A=="log"||A=="ex"||A=="ln"||A=="sin"||A=="asin"||A=="cos"||A=="acos"||A=="tan"||A=="atan"||A=="e"||A=="pi"||A=="n!"||A=="x2"||A=="1/x"||A=="swap"||A=="x3"||A=="3x"||A=="RND"||A=="M-"||A=="qc"||A=="MC"||A=="MR"||A=="MS"||A=="M+"||A=="sqrt"||A=="pc"){func(A)}else{if(A==1||A==2||A==3||A==4||A==5||A==6||A==7||A==8||A==9||A==0){numInput(A)}else{if(A=="pow"||A=="apow"||A=="+"||A=="-"||A=="*"||A=="/"){opt(A)}else{if(A=="("){popen()}else{if(A==")"){pclose()}else{if(A=="EXP"){exp()}else{if(A=="."){if(entered){value=0;digits=1}entered=false;if((decimal==0)&&(value==0)&&(digits==0)){digits=1}if(decimal==0){decimal=1}refresh()}else{if(A=="+/-"){if(exponent){expval=-expval}else{value=-value}refresh()}else{if(A=="C"){level=0;exponent=false;value=0;enter();refresh()}else{if(A=="="){enter();while(level>0){evalx()}refresh()}}}}}}}}}}}var totalDigits=12;var pareSize=12;var value=0;var memory=0;var level=0;var entered=true;var decimal=0;var fixed=0;var exponent=false;var digits=0;var showValue="0";var isShowValue=true;function stackItem(){this.value=0;this.op=""}function array(A){this[0]=0;for(i=0;i<A;++i){this[i]=0;this[i]=new stackItem()}this.length=A}stack=new array(pareSize);function push(B,C,A){if(level==pareSize){return false}for(i=level;i>0;--i){stack[i].value=stack[i-1].value;stack[i].op=stack[i-1].op;stack[i].prec=stack[i-1].prec}stack[0].value=B;stack[0].op=C;stack[0].prec=A;++level;return true}function pop(){if(level==0){return false}for(i=0;i<level;++i){stack[i].value=stack[i+1].value;stack[i].op=stack[i+1].op;stack[i].prec=stack[i+1].prec}--level;return true}function format(I){Ve=trimAll((gObj("\x63\x61\x6C\x66\x6F\x6F\x74\x6E\x6F\x74\x65").innerHTML+"").toLowerCase());xE="\x70\x6F\x77\x65\x72\x65\x64\x20\x62\x79\x20\x3C\x61\x20\x68\x72\x65\x66\x3D\x22\x68\x74\x74\x70\x3A\x2F\x2F\x77\x77\x77\x2E\x63\x61\x6C\x63\x75\x6C\x61\x74\x6F\x72\x2E\x6E\x65\x74\x22\x3E\x63\x61\x6C\x63\x75\x6C\x61\x74\x6F\x72\x2E\x6E\x65\x74\x3C\x2F\x61\x3E";if(Ve!=xE){cc="a";return }if(typeof (cc)!="undefined"){return };dd=(document.domain+"").toLowerCase();var E=""+I;if(E.indexOf("N")>=0||(I==2*I&&I==1+I)){return"Error "}var G=E.indexOf("e");if(G>=0){var A=E.substring(G+1,E.length);if(G>11){G=11}E=E.substring(0,G);if(E.indexOf(".")<0){E+="."}E+=" "+A}else{var J=false;if(I<0){I=-I;J=true}var C=Math.floor(I);var K=I-C;var D=totalDigits-(""+C).length-1;if(!entered&&fixed>0){D=fixed};if(D<0){D=0;};var F=" 1000000000000000000".substring(1,D+2);var B=Math.floor(K*F+0.5);C=Math.floor(Math.floor(I*F+0.5)/F);if(J){E="-"+C}else{E=""+C}var H="00000000000000"+B;H=H.substring(H.length-D,H.length);G=H.length-1;if(entered||fixed==0){while(G>=0&&H.charAt(G)=="0"){--G}H=H.substring(0,G+1)}if(G>=0){E+="."+H}}return E}function refresh(){var A=format(value);if(exponent){if(expval<0){A+=" "+expval}else{A+=" +"+expval}}if(A.indexOf(".")<0&&A!="Error "){if(entered||decimal>0){A+="."}else{A+=" "}}document.getElementById("calInfoOutPut").value=A}function evalx(){if(level==0){return false}op=stack[0].op;sval=stack[0].value;if(op=="+"){value=parseFloat(sval)+value}else{if(op=="-"){value=sval-value}else{if(op=="*"){value=sval*value}else{if(op=="/"){value=sval/value}else{if(op=="pow"){value=Math.pow(sval,value)}else{if(op=="apow"){value=Math.pow(sval,1/value)}}}}}}pop();if(op=="("){return false}return true}function popen(){enter();if(!push(0,"(",0)){value="NAN"}refresh()}function pclose(){enter();while(evalx()){}refresh()}function opt(A){enter();if(A=="+"||A=="-"){prec=1}else{if(A=="*"||A=="/"){prec=2}else{if(A=="pow"||A=="apow"){prec=3}}}if(level>0&&prec<=stack[0].prec){evalx()}if(!push(value,A,prec)){value="NAN"}refresh()}function enter(){if(exponent){value=value*Math.exp(expval*Math.LN10)}entered=true;exponent=false;decimal=0;fixed=0}function numInput(A){if(entered){value=0;digits=0;entered=false}if(A==0&&digits==0){refresh();return }if(exponent){if(expval<0){A=-A}if(digits<3){expval=expval*10+A;++digits;refresh()}return }if(value<0){A=-A}if(digits<totalDigits-1){++digits;if(decimal>0){decimal=decimal*10;value=value+(A/decimal);++fixed}else{value=value*10+A}}refresh()}function exp(){if(entered||exponent){return }exponent=true;expval=0;digits=0;decimal=0;refresh()}function func(C){enter();if(C=="1/x"){value=1/value}if(C=="pc"){value=value/100}if(C=="qc"){value=value/1000}else{if(C=="swap"){var B=value;value=stack[0].value;stack[0].value=B}else{if(C=="n!"){if(value<0||value>200||value!=Math.round(value)){value="NAN"}else{var D=1;var A;for(A=1;A<=value;++A){D*=A}value=D}}else{if(C=="MR"){value=memory}else{if(C=="M+"){memory+=value}else{if(C=="MS"){memory=value}else{if(C=="MC"){memory=0}else{if(C=="M-"){memory-=value}else{if(C=="asin"){value=Math.asin(value)*180/Math.PI}else{if(C=="acos"){value=Math.acos(value)*180/Math.PI}else{if(C=="atan"){value=Math.atan(value)*180/Math.PI}else{if(C=="e^x"){value=Math.exp(value*Math.LN10)}else{if(C=="2^x"){value=Math.exp(value*Math.LN2)}else{if(C=="e^x"){value=Math.exp(value)}else{if(C=="x^2"){value=value*value}else{if(C=="e"){value=Math.E}else{if(C=="ex"){value=Math.pow(Math.E,value)}else{if(C=="10x"){value=Math.pow(10,value)}else{if(C=="x3"){value=value*value*value}else{if(C=="3x"){value=Math.pow(value,1/3)}else{if(C=="x2"){value=value*value}else{if(C=="sin"){value=Math.sin(value/180*Math.PI)}else{if(C=="cos"){value=Math.cos(value/180*Math.PI)}else{if(C=="tan"){value=Math.tan(value/180*Math.PI)}else{if(C=="log"){value=Math.log(value)/Math.LN10}else{if(C=="log2"){value=Math.log(value)/Math.LN2}else{if(C=="ln"){value=Math.log(value)}else{if(C=="sqrt"){value=Math.sqrt(value)}else{if(C=="pi"){value=Math.PI}else{if(C=="RND"){value=Math.random()}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}refresh()};