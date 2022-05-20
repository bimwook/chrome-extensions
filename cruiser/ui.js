var ui = {};
ui.dom = function(o){
  var ret=(typeof o=="string")?document.getElementById(o) : o;
  if(ret==null) return null;
  ret.html = function(value){
    if(value===undefined){
      return this.innerHTML;
    }
    this.innerHTML = value;
  };
  ret.append = function(o){
    this.appendChild(o);
  };
  return ret;
};
ui.element = function(tag){
  return this.dom(document.createElement(tag));
};
ui.items = [];
ui.listview = null;
ui.buildrow = function(url){
  var div = this.element("div");
  var content = this.element("div");
  var bar = this.element("div");
  var img = this.element("img");
  
  div.className = "row";
  content.className = "content";
  bar.className = "bar";

  img.src = url;
  img.alt = url;
  img.onclick = function(){
    window.open(this.src);
  }
  content.append(img);

  
  var qrcode = this.element("a");
  qrcode.html(" 二维码 ");
  qrcode.target="_blank";
  qrcode.href= 'https://www.bimwook.com:11180/woo/bin/barcode/twod.do?barcode=' + window.encodeURIComponent(url);
  bar.append(qrcode);
  
  var fav = this.element("a");
  fav.html(" 收藏 ");
  fav.target="_blank";
  fav.href= 'https://www.bimwook.com:11180/cruiser/mark.do?callback=/woo/var/cruiser.htm&url=' + encodeURIComponent(url);
  bar.append(fav);
  
  
  
  div.append(content);
  div.append(bar);
  return div;
};

ui.fixurl = function(url){
  var src = "";
  if(url.slice(-6)=='_.webp') url = url.slice(0, url.length-6);
  if(url.match(/_\d{3}\./)){
    src = url.replace(/_\d{3}\./, "_1280.");
  }

  var m1 = url.match(/\.jpg(_.*)$/);
  if(m1){
    src = url.replace(m1[1],"");
  }
  
  var mc = url.match(/(_\d{2,}x\d{2,}.*\.jpg)$/);
  if(mc){
    src = url.replace(mc[1],"");
  }
  var mc = url.match(/(\.\d{2,}x\d{2,})/);
  if(mc){
    src = url.replace(mc[1],"");
  }
  return src;
}

ui.load = function(){
  this.listview = this.dom("listview");
  this.items = window.localStorage.getItem("items").split("\r\n")||[];
  this.listview.html('');
  for(var i=0; i< this.items.length; i++){
    var url = (this.items[i]); //.replace("https://", "http://");
    this.listview.append(this.buildrow(url));
    var fixed = this.fixurl(url);
    if(fixed.length>0){
      this.listview.append(this.buildrow(fixed));
    }
  }
}
ui.load();