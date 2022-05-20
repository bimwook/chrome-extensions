void function(){
  var vx = {};
  vx.format = function (text) {
    var list = (text || "").replace(/\r/g, "").split("\n");
    var ret = [];
    for (var i = 0; i < list.length; i++) {
      var row = list[i].trim();
      if (row) {
        ret.push("　　" + row);
      }
    }
    return ret.join("\r\n");
  };
  vx.clean = function(v){
    var ret = v.replace(/#/g, "＃");
    ret = ret.replace(/\*/g, "＊");
    ret = ret.replace(/\-/g, "—");
    ret = ret.replace(/\_/g, "＿");
    return ret;
  };
  //chrome.runtime.sendMessage({ title: "center-hub", dbase: "event", text: "start-at: " + (new Date()) });  
}();
