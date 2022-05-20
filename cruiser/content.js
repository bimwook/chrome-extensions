var main = {};
main = {};
main.msg = function(data, callback){
  chrome.runtime.sendMessage(data, function(ret) {
    callback(ret);
  });
}

main.build = function(){
  var items = [];
  var doc = window.document;
  for(i=0;i<doc.images.length;i++){
    var img = doc.images[i];
    var src = (img.src||"").replace(/"/g, "").replace(/'/g, '');
    if(items.indexOf(src)>-1) continue;
    items.push(src);
  }
  doc.all = doc.getElementsByTagName("*")||[];
  for(var i=0; i< doc.all.length; i++){
    var o = doc.all[i];
    var style = window.getComputedStyle(o,false);
    if(style && style.backgroundImage && style.backgroundImage!="none") {
      var mc = style.backgroundImage.replace(/'|"/g, "").match(/url\(([^\)]*)\)/g);
      if(mc){
        for(var ii=0; ii<mc.length; ii++){
          var src = mc[ii].match(/url\(([^\)]*)\)/)[1];  
          if(items.indexOf(src)>-1) continue;
          items.push(src);    
        }
      }
    }
  }
  this.msg({items: items}, function(ret){});    
}

