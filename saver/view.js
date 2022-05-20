var vx = {};
vx.host = "";
vx.encode = window.encodeURIComponent;
vx.decode = window.decodeURIComponent;
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
  fn.go = function(method, url, data, callback, blob){
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
    }
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
    get: function(url, callback, blob){
      fn.go("GET", url, "", callback, blob);
    },
    post: function(url, data, callback){
      fn.go("POST", url, data, callback);
    },
    go: function(method, url, data, callback){
      fn.go(method, url, data, callback);
    }
  };

}(vx);
vx.meta = function(data, name){
  var reg = new RegExp((name||"") + ": (.+)", "m");
  return ((data||"").match(reg)||["",""])[1];
};
vx.load = function(){
  var me = this;
  var ajax = this.ajax;
  var $ = function(selector){
    return document.querySelector(selector);
  };
  var id = (window.location.search.match(/\?id=(\d+)/)||["",0])[1];
  var url = (window.location.search.match(/&url=([^&]+)/)||["",""])[1];
  var host = me.decode((window.location.search.match(/&host=([^&]+)/)||["",""])[1]);
  var rowid = (window.location.search.match(/\?rowid=(\d+)/)||["",""])[1];
  var mime =(window.location.search.match(/&mime=([^&]+)/)||["",""])[1]; 
  var meta = $("#meta");
  $('#a-source').href = me.decode(url);
  $("#img").style.display="none";
  if(rowid) {
    var cache = $('#a-cache');
    var cloudfn = "/cloud/item.do?rowid=" + rowid;
    if(mime.indexOf("jpeg")>-1){
      cloudfn = "/cloud/view/" + rowid + ".jpg";
    }
    cache.href = host + "/var/dwsave.html?url=" + me.encode(cloudfn),
    cache.innerText = "CACHE";
    document.title = "Show - " + rowid;
    $("#loading").style.display="none";
    $("#img").style.display="block";
    $("#img").onclick = function(){
      window.open(this.src);
    };
    $("#img").onload = function(){
      document.title = "OK - " + rowid;      
    };
    $("#img").src = host + cloudfn;
    ajax.get(host + "/cloud/about.do?rowid=" + rowid, function(o){
      meta.innerText = me.meta(o.text,"Created") + '　|　' + (parseInt( me.meta(o.text,"Size") || 0) / 1024 ).toFixed(2) + 'KB ';     
    });
  }
  chrome.runtime.onMessage.addListener(function(data) {
    //console.log(data);
    if(data.id==id){
      if(data.rowid){
        window.location.href="?rowid=" + data.rowid + "&mime=" + data.mime + "&host=" +me.encode(host) + "&url=" + url;
      }
      else {
        if(data.status==0){
          document.title = "* " + (data.loaded/ 1024 ).toFixed(2) + 'KB';
          meta.innerText = "已加载：" + (data.loaded/ 1024 ).toFixed(2) + 'KB' + (data.total>0?' / ' + (data.total/ 1024 ).toFixed(2) + 'KB ':"");        
        }
        else if(data.status==1) {
          document.title = "Saving...";
          meta.innerText = "正在保存：" + (data.loaded/ 1024 ).toFixed(2) + 'KB / ' + (data.total/ 1024 ).toFixed(2) + 'KB ';                
        }
        else if(data.status==-1) {
          document.title = "Failed!";
          meta.innerText = '加载失败';                
        }
        else if(data.status==100) {
          document.title = "Connecting...";
          meta.innerText = "正在建立连接";                        
        }
        else if(data.status==200) {
          document.title = "Saving...";
          meta.innerText = "正在保存";
        }
        else {
          console.log(data);
        }
      }
    }
  });
};
vx.load();
