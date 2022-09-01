void function(){
  let main = {};
  main.extensionid = "nnbckhhgmagdjdknimnookgmajpggdgj";
  main.format = function (text) {
    let list = (text || "").replace(/\r/g, "").split("\n");
    let ret = [];
    for (let i = 0; i < list.length; i++) {
      let row = list[i].trim();
      if (row) {
        ret.push("　　" + row);
      }
    }
    return ret.join("\r\n");
  };
  main.clean = function(v){
    let ret = v.replace(/#/g, "＃");
    ret = ret.replace(/\*/g, "＊");
    ret = ret.replace(/\-/g, "—");
    ret = ret.replace(/\_/g, "＿");
    return ret;
  };
  main.findxx = function(v){
    let ret = (v||"").replace(/\?.*/,"");
    ret = ret.replace(/_.webp$/, "");
    ret = ret.replace(/_\d{3}\./, "");
    ret = ret.replace(/(_\d{2,}x\d{2,}.*)$/, "");
    ret = ret.replace(/(\.\d{2,}x\d{2,}[^.]+)/, "");
    ret = ret.replace(/(_sum\\.jpg)$/, "");
    return ret;
  };
  main.action = function () {
    let text = [];
    let list = $(".tb-recommend-content-item");
    for(let i=0; i<list.length; i++){
      let card = $(list[i]);
      var title = $(".title", card).text() || "";
      if(title.indexOf("\u88d9")>-1){
        text.push("");
        text.push("# " + title);
      }
      else {
        card.remove();
      }
    }
    var data = this.format(text.join("\n"));
    console.log(data);
  };
  main.taobao_detail = function(){
    console.log("** taobao_detail **");
    var data = [];
    var title = $("h3.tb-main-title").data("title").trim();
    data.push('');
    data.push("　　# " + this.clean(title));
    data.push('　　** ' + $('#J_StrPrice').text().trim() + ' **');
    data.push('');
    var attributes = $(".attributes-list li");
    for(var i=0; i<attributes.length; i++){
      data.push('　　- ' + this.clean($(attributes[i]).text().trim()) );
    }
    data.push('');
    var text = [];
    var ndx = $("#J_DivItemDesc p");
    for(let i=0; i<ndx.length; i++){
      var p = ndx[i];
      for (let ii = 0; ii < p.childNodes.length; ii++) {
        var node = p.childNodes[ii];
        if (node.nodeType == 3) {
          text.push(this.clean(node.nodeValue||""));
        } else if (node.nodeName == "B") {
          text.push("** " + this.clean(node.innerText||"") + " **");
        } else if (node.nodeName == "SPAN") {
          text.push(this.clean(node.innerText||""));
        } else if (node.nodeName == "H2") {
          var v = this.clean(node.innerText||"").trim();
          if(v){
            text.push("## " + v);
            text.push("\r\n");
          }
        } else if (node.nodeName == "H3") {
          var v = this.clean(node.innerText||"").trim();
          if(v){
            text.push("### " + v);
            text.push("\r\n");
          }
        } else if (node.nodeName == "BR") {
          text.push("\r\n");
        } else if (node.nodeName == "IMG") {
        } else if (node.nodeName == "FIGURE") {
        } else if (node.nodeName == "A") {
          text.push(this.clean(node.innerText));
        }
        else {
          text.push(this.clean(node.innerText));
        }
      }
      text.push("\r\n");
    }
    var txt = this.format(text.join(""));
    if(txt){
      data.push(txt);
      data.push('');
    }
    var medias = $("#J_UlThumb img");
    for(var i=0; i<medias.length; i++){
      var img = $(medias[i]);
      var src = this.findxx(img.attr("src"));
      if(src.match(/\.png$|\.gif$/)) {
        continue;
      }
      data.push('　　![media](' + src + ')');
    }
    var bks = $("#J_isku a");
    for(var i=0; i<bks.length; i++){
      var style = window.getComputedStyle(bks[i],false);
      if(style && style.backgroundImage && style.backgroundImage!="none") {
        var mc = style.backgroundImage.replace(/'|"/g, "").match(/url\(([^\)]*)\)/g);
        if(mc){
          for(var ii=0; ii<mc.length; ii++){
            var src = mc[ii].match(/url\(([^\)]*)\)/)[1];
            if(src.match(/\.png$|\.gif$/)) {
              continue;
            }
            data.push('　　![media](' + this.findxx(src) + ')');
          }
        }
      }
    }
    var details = $("#J_DivItemDesc img");
    for(var i=0; i<details.length; i++){
      var img = $(details[i]);
      var src = this.findxx(img.data("ks-lazyload") || img.attr("src"));
      if(src.match(/\.png$|\.gif$/)) {
        continue;
      }
      data.push('　　![media](' + src + ')');
    }
    var itemid = (window.location.search.match(/[\?&]id=(\d+)/)||["", window.location.href])[1];
    data.push('');
    data.push('　　- [查看详情](https://item.taobao.com/item.htm?id=' + itemid + ')');
    data.push('');
    console.log(data.join('\r\n'));
    chrome.runtime.sendMessage(
      this.extensionid,
      {
        dbase: "taobao",
        echo: true,
        title: title,
        text: data.join("\r\n")
      }
    );
  };
  main.taobao_twitter = function(){
    var data = [];
    var title = $("h3.tb-main-title").data("title").trim();
    data.push('');
    data.push("　　# " + this.clean(title));
    data.push('　　** ' + $('#J_StrPrice').text().trim() + ' **');
    var rows = $(".tb-revbd .kg-rate-ct-review-item");
    for(var i=0; i<rows.length; i++){
      var row = rows[i];
      var author = this.clean($(".from-whom", row).text().trim());
      data.push('');
      data.push('　　- ' + author);
      var texts = $(".tb-tbcr-content ", row);
      for(var ii=0; ii<texts.length; ii++){
        data.push('　　' + this.clean($(texts[ii]).text().replace(/\s/g, "")) );
      }
      var medias = $(".tb-rev-item-media img", row);
      for(var ii=0; ii<medias.length; ii++){
        var src = this.findxx($(medias[ii]).attr("src"));
        if(src){
          data.push('　　![media](' + src + ')');
        }
      }
    }
    var itemid = (window.location.search.match(/[\?&]id=(\d+)/)||["", window.location.href])[1];
    data.push('');
    data.push('　　- [查看详情](https://detail.tmall.com/item.htm?id=' + itemid + ')');
    data.push('');
    console.log(data.join('\r\n'));
    chrome.runtime.sendMessage(
      this.extensionid,
      {
        dbase: "taobaox",
        echo: true,
        title: title,
        text: data.join("\r\n")
      }
    );
  };
  main.tmall_detail = function(){
    console.log("** tmall_detail **");
    var data = [];
    var title = $('[class*="ItemHeader--root--"] h1').text().trim();
    data.push('');
    data.push("　　# " + this.clean(title));
    data.push('　　** ¥' + $('span[class*="Price--priceText--"]').last().text().trim() + ' **');
    data.push('');
    var attributes = $('[class*="Attrs--attr--"]');
    for(var i=0; i<attributes.length; i++){
      data.push('　　- ' + this.clean($(attributes[i]).text().trim()) );
    }
    data.push('');
    var text = [];
    var ndx = $(".descV8-container p");
    for(let i=0; i<ndx.length; i++){
      var p = ndx[i];
      for (let ii = 0; ii < p.childNodes.length; ii++) {
        var node = p.childNodes[ii];
        if (node.nodeType == 3) {
          text.push(this.clean(node.nodeValue||""));
        } else if (node.nodeName == "B") {
          text.push("** " + this.clean(node.innerText||"") + " **");
        } else if (node.nodeName == "SPAN") {
          text.push(this.clean(node.innerText||""));
        } else if (node.nodeName == "H2") {
          var v = this.clean(node.innerText||"").trim();
          if(v){
            text.push("## " + v);
            text.push("\r\n");
          }
        } else if (node.nodeName == "H3") {
          var v = this.clean(node.innerText||"").trim();
          if(v){
            text.push("### " + v);
            text.push("\r\n");
          }
        } else if (node.nodeName == "BR") {
          text.push("\r\n");
        } else if (node.nodeName == "IMG") {
        } else if (node.nodeName == "FIGURE") {
        } else if (node.nodeName == "A") {
          text.push(this.clean(node.innerText));
        }
        else {
          text.push(this.clean(node.innerText));
        }
      }
      text.push("\r\n");
    }
    var txt = this.format(text.join(""));
    if(txt){
      data.push(txt);
      data.push('');
    }
    var medias = $('[class*="PicGallery--thumbnail--"] img');
    for(var i=0; i<medias.length; i++){
      var src = this.findxx(medias[i].src);
      if(src.match(/\.png$|\.gif$/)) {
        continue;
      }
      data.push('　　![media](' + src + ')');
    }
    var bks = $(".skuIcon");
    for(var i=0; i<bks.length; i++){
      var src = this.findxx(bks[i].src);
      if(src.match(/\.png$|\.gif$/)) {
        continue;
      }
      data.push('　　![media](' + src + ')');
    }
    var details = $(".descV8-container img");
    for(var i=0; i<details.length; i++){
      var img = $(details[i]);
      var src = this.findxx(img.data("src") || img.attr("src"));
      if(src.match(/\.png$|\.gif$/)) {
        continue;
      }
      data.push('　　![media](' + src + ')');
    }
    var itemid = (window.location.search.match(/[\?&]id=(\d+)/)||["", window.location.href])[1];
    data.push('');
    data.push('　　- [查看详情](https://detail.tmall.com/item.htm?id=' + itemid + ')');
    data.push('');
    console.log(data.join('\r\n'));
    chrome.runtime.sendMessage(
      this.extensionid,
      {
        dbase: "taobao",
        echo: true,
        title: title,
        text: data.join("\r\n")
      }
    );
  };
  main.tmall_twitter = function(){
    var data = [];
    var title = $('[class*="ItemHeader--root--"] h1').text().trim();
    data.push('');
    data.push("　　# " + this.clean(title));
    data.push('　　** ¥' + $('span[class*="Price--priceText--"]').last().text().trim() + ' **');
    data.push('');
    var rows = $('[class*="Comment--root--"]');
    for(var i=0; i<rows.length; i++){
      var row = rows[i];
      var author = $('[class*="Comment--userName--"]', row).text();
      var meta = $('[class*="Comment--meta--"]', row).text();
      data.push('');
      data.push('　　- ' + author + " | " + meta);
      var text = $('[class*="Comment--content--"]', row).text().trim();
      data.push('　　' + this.clean(text) );
      var medias = $('[class*="Comment--photo--"] img', row);
      for(var ii=0; ii<medias.length; ii++){
        var src = this.findxx($(medias[ii]).attr("src"));
        if(src){
          data.push('　　![media](' + src + ')');
        }
      }
    }
    var itemid = (window.location.search.match(/[\?&]id=(\d+)/)||["", window.location.href])[1];
    data.push('');
    data.push('　　- [查看详情](https://detail.tmall.com/item.htm?id=' + itemid + ')');
    data.push('');
    console.log(data.join('\r\n'));
    chrome.runtime.sendMessage(
      this.extensionid,
      {
        dbase: "taobaox",
        echo: true,
        title: title,
        text: data.join("\r\n")
      }
    );
  };
  main.run = function () {
    let me = this;
    console.log("** taobao **");
    if(window.location.href.indexOf("https://www.taobao.com/")==0){
      let tools = $("div.fixedtool");
      let a = $('<a href="javascript:;" target="_self" class="a-all fixedtool-8">看看</a>');
      $(".fixedtool-9", tools).remove();
      a.on("click", function(){
        me.action();
      });
      tools.append(a);
      console.log("** www.taobao.com **");
    }
    else if(window.location.href.indexOf("https://item.taobao.com/item.htm")==0){
      let button = $('<button id="o-btn-look" class="o-woo-button">Mark</button>');
      button.on("click", function(){
        me.taobao_detail();
      });
      $("body").append(button);
      let twitter = $('<button id="o-btn-twitter" class="o-woo-button">Twitter</button>');
      twitter.on("click", function(){
        me.taobao_twitter();
      });
      $("body").append(twitter);
    }
    else if(window.location.href.indexOf("https://detail.tmall.com/item.htm")==0){
      let button = $('<button id="o-btn-look" class="o-woo-button">Mark</button>');
      button.on("click", function(){
        me.tmall_detail();
      });
      $("body").append(button);
      let twitter = $('<button id="o-btn-twitter" class="o-woo-button">Twitter</button>');
      twitter.on("click", function(){
        me.tmall_twitter();
      });
      $("body").append(twitter);
    }
  };
  setTimeout(function(){ main.run() }, 1200);
}();
