(function(w){
  var woo = {};
  woo.json = function(o){
    try{
      return JSON.parse(o.text);
    }
    catch(e){
      return null;
    }
  };
  woo.go = function(method, url, data){
    var me = this;
    var blob = false;
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      var ret = {status: 0, text: "", data: this.response, error: "Network-Error", headers: [], json: function(){return null;}};
      var done = function(o){
        resolve(o);
        xhr = null;
      }
      xhr.onerror = function(e){
        reject(e);
      }
      xhr.onabort = function(){
        done({status: 0, text: "", data: this.response, error: "User-Abort", headers: [], json: function(){return null;}});
      }
      xhr.ontimeout = function(){
        done({status: 0, text: "", data: this.response, error: "Time-Out", headers: [], json: function(){return null;}});
      }
      xhr.onload = function(){
        var mc = (this.getAllResponseHeaders().replace(/\r/g, "")||"").match(/^([^:]*):(.*)$/igm);
        var headers = [];
        mc.map(function(row){
          var m = row.match(/^([^:]*):(.*)$/);
          headers.push({name: m[1].trim(), value: m[2].trim() });
        });
        done({status: this.status, text: (!!blob)?"[blob]":this.responseText, data: this.response, error: null, headers: headers, json: function(){ return me.json(this); }});
      };
      //xhr.upload.onprogress = function(ev) {
      //  if(typeof(onevent)=="function"){
      //    onevent(1, ev.loaded, ev.total);
      //  }
      //};
      //xhr.onprogress =function (evt) {
      //  if(typeof(onevent)=="function"){
      //    if (evt.lengthComputable) {
      //      onevent(0, evt.loaded, evt.total);
      //    }
      //    else {
      //      onevent(0, evt.loaded, -1);
      //    }
      //  }
      //};
      xhr.open(method||"GET", url, true);
      if(!!blob){
        xhr.responseType = "blob";
      }
      else if( (method=="POST")||(method=="PUT")||(method=="DELETE") ){
        xhr.setRequestHeader("X-With","o-muen/1.0");
        xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
      }
      xhr.send(data||"");
    });
  };
  w.web = {
    get: async function(url){
      return await woo.go("GET", url, "");
    },
    post:  async function(url, data){
      return await woo.go("POST", url, data);
    },
    go:  async function(method, url, data){
      return await woo.go(method, url, data);
    }
  }
})(window);

var woo = {};

;-function(w){

  var host = "https://www.bimwook.com:11180";
  var web = window.web;
  var fn = {};
  fn.encodeurl = encodeURIComponent;
  //robot
  var cmd = {};
  cmd.heartbeat = async function(name, sid){
    var me = this;
    var data = [];
    data.push("name=" + fn.encodeurl(name))
    data.push("sid=" + fn.encodeurl(sid));
    var o = await web.post(host + "/woo/bin/center/heartbeat.do", data.join("&"));
    try{
      var ret = o.json();
      if(ret && ret.result){
        return true;
      }
      else{
        return false;
      }
    }
    catch(e) {
      return false;
    }
  };
  cmd.connect = async function(name, token){
    var me = this;
    var data = [];
    data.push("name=" + fn.encodeurl(name))
    data.push("token=" + fn.encodeurl(token));
    var o = await web.post(host + "/woo/bin/center/connect.do", data.join("&"));
    try{
      var ret = o.json();
      if(ret && ret.result){
        return (ret.sid);
      }
      else{
        return ("");
      }
    }
    catch(e){
      console.log(e);
      return ("");
    }
  };
  cmd.save = async function(name, sid, database, summary, content){
    var data = [];
    data.push("robot.name=" + fn.encodeurl(name));
    data.push("robot.sid=" + fn.encodeurl(sid));
    data.push("robot.dbase=" + fn.encodeurl(database));
    data.push("summary=" + fn.encodeurl(summary));
    data.push("content=" + fn.encodeurl(content));
    var o = await web.post(host + "/woo/bin/center/dbases/save.do", data.join("&"));
    try{
      var ret = o.json();
      if(ret && ret.result){
        return (ret.rowid);
      }
      else{
        console.log(o.text);
        return ("");
      }
    }
    catch(e){
      console.log(e);
      return ("");
    }
  };
  cmd.hash = async function(name, database, content){
    var data = [];
    data.push("robot.name=" + fn.encodeurl(name));
    data.push("robot.dbase=" + fn.encodeurl(database));
    data.push("content=" + fn.encodeurl(content));
    var o = await web.post(host + "/woo/bin/center/dbases/hash.do", data.join("&"));
    try{
      var ret = o.json();
      if(ret){
        return (ret);
      }
    }
    catch(e){
      console.log(e);
      return(0);
    }
  };
  cmd.summary = async function(name, database, summary){
    var data = [];
    data.push("robot.name=" + fn.encodeurl(name));
    data.push("robot.dbase=" + fn.encodeurl(database));
    data.push("summary=" + fn.encodeurl(summary));
    var o = await web.post(host + "/woo/bin/center/dbases/summary.do", data.join("&"));
    try{
      var ret = o.json();
      if(ret){
        return (ret);
      }
    }
    catch(e){
      console.log(e);
      return(0);
    }
  };

  var robot = {};
  robot.create = function(name, token){
      var sid = "";
      var timer = 0;
      var database = "";
      var rbt = {};
      async function heartbeat() {
        if(!sid) return;
        //console.log('robot: I am still alive.');
        try{
          var v = await cmd.heartbeat(name, sid);
          if(!v){
            console.log('robot: reconnecting...');
            rbt.connect();
          }
        }
        catch(e){
          console.log('robot: net error.');
        }
      };
      rbt.connect = async function(){
        console.log('robot: connecting...');
        var sessionid = await cmd.connect(name, token)
        var ok = (sessionid!="");
        if(ok){
          sid = sessionid;
          window.clearInterval(timer);
          timer = window.setInterval(heartbeat, 60e3);
          console.log('robot: connected. sid=%s', sid);
        }
        else {
        }
        return ok;
      };

      rbt.disconnect = function(){
        var t = timer;
        sid = "";
        timer = 0;
        window.clearInterval(t);
      };

      rbt.database = function(db){
        if(!db){
          return database;
        }
        database = db;
      };

      rbt.save = async function(summary, content){
        return await cmd.save(name, sid, database, summary, content);
      };
      rbt.hash = async function(data){
        return await cmd.hash(name, database, data);
      };
      rbt.summary = async function(summary) {
        return await cmd.summary(name, database, summary);
      }
      return rbt;
  };  

  woo.robot = robot;
}(woo);

woo.load = function(){
  let me = this;
  let web = me.web;
  let name = "weibo";
  let token = "1862838983149661966831822750340571651158";
  let dbase = "skirt";
  let encode = window.encodeURIComponent;
  let rbt = me.robot.create(name, token);
  rbt.database(dbase);
  rbt.connect();    
  chrome.runtime.onMessage.addListener(async function(data) {
    var nickname = data.nickname;
    var text = data.text;
    var o = await rbt.hash(text);
    if(o.count==0){
      var rowid = await rbt.save(nickname, text);
      if(rowid){
        chrome.tabs.create({
          url: "https://www.bimwook.com:11180/woo/bin/center/dbases/load.do?name=" + name + "&dbase=" + dbase + "&rowid=" + rowid,
          selected : false
        });
      }
      else {
        console.log("PLEASE RETRY ...");
        console.log(text);
      }
    }
    else {
      chrome.tabs.create({
        url: "https://www.bimwook.com:11180/woo/bin/center/dbases/list.do?name=" + name + "&dbase=" + dbase,
        selected : false
      });
    }
  });
};
woo.load();

