(function(w){
  let cmd = {};
  let web = w.web;
  let host = "https://local.bimwook.com";
  let encodeurl = encodeURIComponent;
  function now(){
    var d = new Date();
    var ret = "yyyy-mm-dd hh:nn:ss";
    return ret
      .replace(/yyyy/ig, d.getFullYear())
      .replace(/mm/ig, ("00" + (d.getMonth() + 1)).slice(-2))
      .replace(/dd/ig, ("00" + d.getDate()).slice(-2))
      .replace(/hh/ig, ("00" + d.getHours()).slice(-2))
      .replace(/nn/ig, ("00" + d.getMinutes()).slice(-2))
      .replace(/ss/ig, ("00" + d.getSeconds()).slice(-2))
      .replace(/zzz/ig, ("000" + d.getMilliseconds()).slice(-3))
  };
  cmd.heartbeat = async function(name, sid){
    let me = this;
    let data = [];
    data.push("name=" + encodeurl(name))
    data.push("sid=" + encodeurl(sid));
    let o = await web.post(host + "/woo/bin/center/heartbeat.do", data.join("&"));
    try{
      let ret = o.json();
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
    let me = this;
    let data = [];
    data.push("name=" + encodeurl(name))
    data.push("token=" + encodeurl(token));
    let o = await web.post(host + "/woo/bin/center/connect.do", data.join("&"));
    try{
      let ret = o.json();
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
    let data = [];
    data.push("robot.name=" + encodeurl(name));
    data.push("robot.sid=" + encodeurl(sid));
    data.push("robot.dbase=" + encodeurl(database));
    data.push("summary=" + encodeurl(summary));
    data.push("content=" + encodeurl(content));
    let o = await web.post(host + "/woo/bin/center/dbases/save.do", data.join("&"));
    try{
      let ret = o.json();
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
    let data = [];
    data.push("robot.name=" + encodeurl(name));
    data.push("robot.dbase=" + encodeurl(database));
    data.push("content=" + encodeurl(content));
    let o = await web.post(host + "/woo/bin/center/dbases/hash.do", data.join("&"));
    try{
      let ret = o.json();
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
    let data = [];
    data.push("robot.name=" + encodeurl(name));
    data.push("robot.dbase=" + encodeurl(database));
    data.push("summary=" + encodeurl(summary));
    let o = await web.post(host + "/woo/bin/center/dbases/summary.do", data.join("&"));
    try{
      let ret = o.json();
      if(ret){
        return (ret);
      }
    }
    catch(e){
      console.log(e);
      return(0);
    }
  };
  let robot = {};
  robot.create = function(name, token){
    let sid = "";
    let timer = 0;
    let database = "";
    let rbt = {};
    async function heartbeat() {
      if(!sid) return;
      //console.log('robot: I am still alive.');
        try{
          let v = await cmd.heartbeat(name, sid);
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
      console.log('[' + now() + '] robot: connecting...');
      let sessionid = await cmd.connect(name, token)
      let ok = (sessionid!="");
      if(ok){
        sid = sessionid;
        window.clearInterval(timer);
        timer = window.setInterval(heartbeat, 60e3);
        console.log('[%s] robot: connected. sid=%s', now(), sid);
      }
      else {
      }
      return ok;
    };

    rbt.disconnect = function(){
      let t = timer;
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
    rbt.host = function(v){
      host = v || "https://local.bimwook.com";
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
  w.robot = robot;
})(window);