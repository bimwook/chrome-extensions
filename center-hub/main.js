void function(){
  let vx = {};
  function sleep(interval){
    return new Promise(function (resolve, reject) {
      setTimeout(function(){resolve(true);}, interval);
    });
  };
  function now(format){
    var d = new Date();
    var ret = format;
    if (!(typeof (ret) == "string"))
    {
      ret = "yyyy-mm-dd hh:nn:ss";
    }
    return ret
      .replace(/yyyy/ig, d.getFullYear())
      .replace(/mm/ig, ("00" + (d.getMonth() + 1)).slice(-2))
      .replace(/dd/ig, ("00" + d.getDate()).slice(-2))
      .replace(/hh/ig, ("00" + d.getHours()).slice(-2))
      .replace(/nn/ig, ("00" + d.getMinutes()).slice(-2))
      .replace(/ss/ig, ("00" + d.getSeconds()).slice(-2))
      .replace(/zzz/ig, ("000" + d.getMilliseconds()).slice(-3))
  }
  function domain(v){
    return ((v||"").match(/http[s]?:\/\/([^\/:]+)/) || ["",""])[1];
  }
  vx.name = "home";
  vx.token = "2280086192347912554228144859653658770150";
  vx.host = "https://www.bimwook.com:11180";
  vx.robot = window.robot.create(vx.name, vx.token);
  vx.robot.host(vx.host);
  vx.robot.connect();
  vx.clean = function(v){
    var ret = v.replace(/#/g, "＃");
    ret = ret.replace(/\*/g, "＊");
    ret = ret.replace(/\-/g, "—");
    ret = ret.replace(/\_/g, "＿");
    return ret;
  };
  vx.run = async function(dbase, title, text, echo){
    var me = this;
    this.robot.database(dbase);
    let o = await this.robot.hash(text);
    let isnew = (o.count<=0);
    let rowid = isnew ? (await this.robot.save(title, text) || "") : o.hash;
    if(echo && rowid){
      let data  = [];
      data.push("name=" + me.name);
      data.push("dbase=" + dbase);
      if(o.count<=0){
        data.push("rowid=" + rowid);
      }
      let url = me.host + "/woo/bin/center/dbases/" + ( isnew ? "load":"list" ) + ".do";
      chrome.tabs.create({ url: url + "?" + data.join("&"), selected : false });
    }
    return { isnew: isnew, rowid: rowid };
  };
  chrome.runtime.onMessage.addListener(async function(data) {
    let title = data.title;
    let text = data.text;
    let dbase = data.dbase || "local";
    let ret = { isnew: null, rowid: "" };
    while(ret.rowid==""){
      ret = await vx.run(dbase, title, text, false);
      if(ret.rowid==""){
        await sleep(3000);
      }
    }
    console.log( "[" + now() + "] " + dbase + ": " + ret.rowid + " " + ( ret.isnew ? " - NEW ":"" ) );
    return true;
  });
  chrome.runtime.onMessageExternal.addListener(async function(data) {
    let title = data.title;
    let text = data.text;
    let dbase = data.dbase || "local";
    let echo = data.echo || false;
    let ret = { isnew: null, rowid: "" };
    while(ret.rowid==""){
      ret = await vx.run(dbase, title, text, echo);
      if(ret.rowid==""){
        await sleep(3000);
      }
    }
    console.log( "[" + now() + "] " + dbase + ": " + ret.rowid + " " + ( ret.isnew ? " - NEW ":"" ) );
    return true;
  });
  chrome.browserAction.onClicked.addListener(async function(tab) {
    let data = [];
    let dbase = "saved";
    var hostname = domain(tab.url);
    console.log(tab);
    data.push("[" + vx.clean(tab.title)+ "](" + tab.url + ")");
    let rowid = "";
    while(rowid==""){
      rowid = await vx.run(dbase, hostname, data.join("\r\n"), true);
      if(rowid==""){
        await sleep(3000);
      }
    }
    console.log("[" + now() + "] " + dbase + ": " + rowid);
  });
  setTimeout(function(){ vx.run("event", "center-hub", "start-at: " + now(), false) }, 1000);
}();
