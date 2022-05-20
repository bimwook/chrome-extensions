var woo = {};
woo.sites = {
  "twimg.com": {
    "name": "twimg.com",
    "items":[
      {"reg": "&name=.+$", "value": "&name=orig"}
    ]
  }
};

-function(w){
  var fn = {};
  fn.json = function(o){
    try{
      return JSON.parse(o.text);
    }
    catch(e){
      return null;
    }
  };
  fn.go = function(method, url, data, callback, onevent, blob){
    var xhr = new XMLHttpRequest();
    var f = typeof(callback)=="function"? callback : function(o){};
    var done = function(o){
      f(o);
      xhr = null;
    }
    xhr.onerror = function(e){
      done({status: 0, text: "", data: this.response, error: "Network-Error", headers: [], json: function(){return null;}});
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
      done({status: this.status, text: (!!blob)?"[blob]":this.responseText, data: this.response, error: null, headers: headers, json: function(){ return fn.json(this); }});
    };
    xhr.upload.onprogress = function(ev) {
      if(typeof(onevent)=="function"){
        onevent(1, ev.loaded, ev.total);
      }
    };
    xhr.onprogress =function (evt) {
      if(typeof(onevent)=="function"){
        if (evt.lengthComputable) {
          onevent(0, evt.loaded, evt.total);
        }
        else {
          onevent(0, evt.loaded, -1);
        }
      }
    };
    xhr.open(method||"GET", url, true);
    if(!!blob){
      xhr.responseType = "blob";
    }
    else if( (method=="POST")||(method=="PUT")||(method=="DELETE") ){
      xhr.setRequestHeader("X-With","o-muen/1.0");
      xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    }
    xhr.send(data||"");
  };
  w.ajax = {
    get: function(url, callback){
      fn.go("GET", url, "", callback);
    },
    post: function(url, data, callback){
      fn.go("POST", url, data, callback);
    },
    blob: function(url, callback, event){
      fn.go("GET", url, "", callback, event, true);
    },
    go: function(method, url, data, callback, event){
      fn.go(method, url, data, callback, event);
    }
  };

}(woo);
woo.timeout = 60;
woo.working = false;
woo.items = [];
woo.restore = function(host){
  var me = this;
  this.check(function(){
    let ajax = me.ajax;
    var rules = window.localStorage.getItem("ext.rules") || "[]";
    me.sites = JSON.parse(rules);
    var url = host + "/woo/bin/cache/load.do?name=imasaver-rules";
    console.log("UPDATE FROM: " + url);
    ajax.get(url, function(o){
      try {
        me.sites = JSON.parse(o.text);
        console.log("SAVE TO LOCAL ...");
        window.localStorage.setItem("ext.rules", o.text);
      }
      catch(e){
        console.log(e);
      }
    });  
  });
};
woo.put = function(host, data){
  let me = this;
  let ajax = me.ajax;
  let encode = window.encodeURIComponent;
  if(data.rowid){
    var bd = [];
    bd.push("rowid=" + data.rowid);
    bd.push("name=" + encode(data.url));
    window.setTimeout(function(){
      ajax.go(
        "PUT",
        host + "/cloud/timeline.do", 
        bd.join("&"),
        function(oo){
          chrome.runtime.sendMessage(data);
        },
        function(status, loaded, total){
          //console.log(status);
          if(status==1){
            chrome.runtime.sendMessage({id: data.id, rowid: 0, status: status, loaded: loaded, total: total});
          }
        }
      );    
    },10);
  }
};
woo.check = function(callback){
  let me = this;
  let ajax = me.ajax;
  let hosts = [window.localStorage.getItem("ext.hostname")];
  for(var i=0; i<hosts.length; i++){
    let host = hosts[i];
    ajax.get(host + "/about.io", function(o){
      if((o.text||"").indexOf("1106998678468001895030322068211092689070")>-1) {
        callback(host);
      }
    });
  }

};
woo.load = function(host){
  let me = this;
  let ajax = me.ajax;
  let encode = window.encodeURIComponent;
  this.restore(host);
  chrome.contextMenus.create({
    title: "添加到我的收藏",
    contexts: ["image"],
    onclick: function(e){
      var url = e.srcUrl;
      //console.log(e);
      var referrer = e.pageUrl;
      var mc = url.match(/http[s]?:\/\/([^\/]*).*/);
      var hostname = mc? mc[1]:"";
      var domain = "";
      mc = hostname.toLowerCase().match(/([a-z0-9-]*)[.]{1}([a-z]{3})[.]{1}([a-z]{2})$/);
      if(!mc){
        mc = hostname.toLowerCase().match(/([a-z0-9-]*)[.]{1}([a-z]{2,3})$/);
      }
      if(!mc){
        mc = hostname.toLowerCase().match(/([a-z0-9-]*)[.]{1}([a-z0-9-]*)[.]{1}([a-z]{2})$/);
      }
      if(mc){
        domain = mc[0];
      }
      var site = me.sites.find(site=> site.name == domain);
      //console.log(site);
      if(site){
        for(var i=0; i<site.items.length; i++){
          var r = site.items[i];
          var reg = new RegExp(r.reg);
          url = url.replace(reg, r.value);
        }
      }

      var item = {id: Math.floor(Math.random()*10000000000), url: url};
      me.items.push(item);
      chrome.tabs.create({
        url: "view.html?id=" + item.id + "&host=" + encode(host) + "&url=" + encode(item.url),
        selected : false
      });
    }
  });

  chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("UPDATE RULES...");
    me.restore(host);
  });
  chrome.runtime.onMessage.addListener(function(data) {
    //console.log(data);
  });
  window.setInterval(function(){

  },20e3);
  window.setInterval(function(){
    me.timeout--;
    if(me.timeout<0) {
      me.working = false;
    }
    if(me.working) {
      return;
    }
    var item = me.items.shift();
    if(item){
      me.working = true;
      me.timeout = 60;
      chrome.runtime.sendMessage({id: item.id, rowid: 0, status: 100, loaded: 0, total: 0});
      ajax.blob(
        item.url,
        function(o){
          var reader = new FileReader();
          reader.onloadend = function (e) {
            var base64 = e.target.result;
            var p = base64.indexOf(",");
            if(p>-1){
              var data = base64.slice(p+1);
              var mime = base64.match(/data:([^;]+);/);
              if(mime){
                var bd = [];
                bd.push("name=" + encode(item.url));
                bd.push("mime=" + encode(mime[1]));
                bd.push("data=" + encode(data));
                chrome.runtime.sendMessage({id: item.id, rowid: 0, status: 200, loaded: 0, total: 0});
                ajax.post(host + "/cloud/save.do", bd.join("&"), function(oo){
                  var rowid = (oo.text.match(/(\d{50})/)||["","0"])[1];
                  var data = {id: item.id, rowid: rowid, url: item.url, status: 200, loaded:100, total:100, mime: mime[1]};
                  me.put(host, data);
                  me.working = false;
                });
              }
            }
          };
          if(o.error==null){
            reader.readAsDataURL(o.data);
          }
          else {
            console.log("下载失败：" + item.url);
            chrome.runtime.sendMessage({id: item.id, rowid: 0, status: -1, loaded:0, total:-1} );
            me.working = false;
          }
        },
        function(status, loaded, total){
          me.timeout = 60;
          chrome.runtime.sendMessage({id: item.id, rowid: 0, status: status, loaded: loaded, total: total});
        }
      );
    }
  },1000);
};
woo.check(function(host){
  woo.load(host);
});

