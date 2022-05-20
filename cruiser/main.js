var woo = {};
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
  fn.go = function(method, url, data, callback){
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
      done({status: this.status, text: (method=="POST")?this.responseText:"[blob]", data: this.response, error: null, headers: headers, json: function(){ return fn.json(this); }});
    }
    xhr.open(method||"GET", url, true);
    if(method=="GET"){
      xhr.responseType = "blob";
    }
    else if(method=="POST"){
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
    go: function(method, url, data, callback){
      fn.go(method, url, data, callback);
    }
  };

}(woo);
woo.working = false;
woo.items = [];
woo.load = function(){
  var me = this;
  var ajax = this.ajax;
  var enc = window.encodeURIComponent;

  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({
      code: 'main.build();'
    });
  });

  chrome.runtime.onMessage.addListener(function(msg, sender, callback) {
    window.localStorage.setItem("items", msg.items.join("\r\n"));
    chrome.tabs.create({url: "main.html" });
  });
  
  window.setInterval(function(){
    if(me.working) {
      return;
    }
    var url = me.items.shift();
    if(url){
      me.working = true;
      ajax.get(url, function(o){
        var reader = new FileReader();
        reader.onloadend = function (e) {
          var base64 = e.target.result;
          var p = base64.indexOf(",");
          if(p>-1){
            var data = base64.slice(p+1);
            var mime = base64.match(/data:([^;]+);/);
            if(mime){
              var bd = [];
              bd.push("url=" + enc(url));
              bd.push("mime=" + enc(mime[1]));
              bd.push("data=" + enc(data));
              var host = window.localStorage.getItem("ext.hostname") ||"https://www.bimwook.com";
              ajax.post(host + "/woo/bin/cruiser/save.do", bd.join("&"), function(oo){
                //var rowid = (oo.text.match(/([0123456789\-]+)/)||["","0"])[1];
                me.working = false;
              });
            }
          }
        };
        if(o.status==200){
          reader.readAsDataURL(o.data);        
        }
        else {
          me.working = false;
        }
      });     
    }
  },1000);  
}
woo.load();