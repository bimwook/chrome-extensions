void function(){
  var icon = [
    '<svg width="16px" height="16px" viewBox="0 0 24 24" style="display: inline-block; vertical-align: sub; margin: 0 4px;" fill="#8590A6">',
    '<path d="M 10 4 H4 c -1.1 0 -1.99 .9 -1.99 2 L 2 18 c 0 1.1 .9 2 2 2 h 16 c 1.1 0 2 -.9 2 -2 V 8 c 0 -1.1 -.9 -2 -2 -2 h-8 l -2 -2 z"/>',
    '<path d="M 0 0 h24 v24 H0 z" fill="none"/>',
    '</svg>'
  ].join('');
  var main = {};
  main.extensionid = "nnbckhhgmagdjdknimnookgmajpggdgj";
  main.format = function (text) {
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
  main.clean = function(v){
    var ret = v.replace(/#/g, "＃");
    ret = ret.replace(/\*/g, "＊");
    ret = ret.replace(/\-/g, "—");
    ret = ret.replace(/\_/g, "＿");
    return ret;
  };
  
  main.build = function(o){
    let me = this;
    let text = [];
    
    for (let i = 0; i < o.childNodes.length; i++) {
      let node = o.childNodes[i];
      if (node.nodeType == 3) {
        text.push(me.clean(node.nodeValue||""));
      } else if (node.nodeName == "B") {
        text.push("** " + me.clean(node.innerText||"") + " **");
      } else if (node.nodeName == "P") {
        text.push(me.clean(node.innerText||""));
        text.push("\r\n");
      } else if (node.nodeName == "SPAN") {
        text.push(me.clean(node.innerText||""));
      } else if (node.nodeName == "H2") {
        let v = me.clean(node.innerText||"").trim();
        if(v){
          text.push("## " + v);
          text.push("\r\n");
        }
      } else if (node.nodeName == "H3") {
        let v = me.clean(node.innerText||"").trim();
        if(v){
          text.push("### " + v);
          text.push("\r\n");
        }
      } else if (node.nodeName == "BR") {
        text.push("\r\n");
      } else if (node.nodeName == "IMG") {
        text.push("![media](" + node.src + ")");
        text.push("\r\n");
      } else if (node.nodeName == "FIGURE") {
        let img = $("img", node);
        let src = img.attr("data-original") || img.attr("data-actualsrc") || img.attr("src");
        text.push("![media](" + src + ")");
        text.push("\r\n");
      } else if ( (node.nodeName == "BLOCKQUOTE") || (node.nodeName == "PRE") ) {
        let isnewline = true;
        for (let ii = 0; ii < node.childNodes.length; ii++) {
          let nx = node.childNodes[ii];
          if (nx.nodeType == 3) {
            text.push((isnewline?"> ":"") + me.clean(nx.nodeValue||""));
            isnewline = false;
          } else if (nx.nodeName == "BR") {
            text.push("\r\n");
            isnewline = true;
          } else if (nx.nodeName == "B") {
            text.push((isnewline?"> ":"") + "** " + me.clean(nx.innerText||"") + " **");
            isnewline = false;
          } else if (nx.nodeName == "SPAN") {
            text.push((isnewline?"> ":"") + me.clean(nx.innerText||""));
            isnewline = false;
          }
        }
        text.push("\r\n");
      } else if ( (node.nodeName == "OL") || (node.nodeName == "UL") ) {
        for (let ii = 0; ii < node.childNodes.length; ii++) {
          let nx = node.childNodes[ii];
          if (nx.nodeName == "LI") {
            text.push("- " + me.clean(nx.innerText||""));
            text.push("\r\n");
          } 
        }
      } else if (node.nodeName == "DIV") {
        let a = $("a", node);
        if(a.length>0){
          text.push("- [" + me.clean(a.attr("data-text")||"点击查看详情") + "](" + a.attr("href") + ")");
          text.push("\r\n");
        }
        else {
          text.push(me.clean(node.innerText||""));
          text.push("\r\n");
        }
      } else if (node.nodeName == "A") {
        text.push(me.clean(node.innerText));
      }
    }  
    return me.format(text.join(""));
  };
  main.action = function () {
    let x = this;
    let cards = $(".ContentItem");
    cards.off();
    cards.on("mouseenter", function () {
      let me = this;
      let card = $(this);
      let share = $("div.ShareMenu", this);
      share.html(icon + '<button class="Button Button--plain">分享</button>');
      share.off();
      share.on("click", function () {
        let h2 = $("h2.ContentItem-title", card).first();
        let title = h2.text();
        if(!title){
          title = $("h1.QuestionHeader-title").first().text();
        }
        let author = $(".AuthorInfo-content a.UserLink-link", card).first();
        let cnt = $("span.RichText", card)[0];
        let data = [];
        data.push("");
        data.push("　　# " + title);
        if(author.attr("href")){
          data.push("　　- [" + author.text() + "](" + author.attr("href") + ") ");
        }
        else {
          data.push("　　- 匿名用户 ");
        }
        data.push("");
        data.push(x.build(cnt));
        data.push("");
        let source = $("h2.ContentItem-title a", card).first();
        if(source && source.attr("href")){
          data.push("　　- [查看来源](" + source.attr("href") + ")");
        }
        data.push("　　- " + $(".ContentItem-time", card).text().trim());
        data.push("");
        console.log(data.join("\r\n"));
        chrome.runtime.sendMessage(
          x.extensionid,
          {
            dbase: "zhihu",
            title: title,
            echo: true,
            text: data.join("\r\n")
          }
        );
      });
    });
  };
  main.twitter = function(){
    let me = this;
    let data = [];
    let title = me.clean( $("h1").text().trim() );
    data.push('');
    data.push('　　# ' + title );
    data.push('');
    data.push(me.build(document.querySelector("#manuscript")));
    data.push('');
    data.push("　　- [查看来源](" + window.location.href + ")");
    data.push('');
    console.log(data.join("\r\n"));
    chrome.runtime.sendMessage(
      me.extensionid,
      {
        dbase: "zhihu",
        title: title,
        echo: true,
        text: data.join("\r\n")
      }
    );
  };
  
  main.market = function(){
    let me = this;
    let twitter = $('<button id="o-btn-twitter" class="o-woo-button">Twitter</button>');
    twitter.on("click", function(){
      me.twitter();
    });
    $("body").append(twitter); 
  };
  main.run = function () {
    var me = this;
    var t = 0;
    window.onscroll = function () {
      window.clearTimeout(t);
      t = window.setTimeout(function () {
        me.action();
      }, 1000);
    };
    me.action();
  };
  if(window.location.href.indexOf("https://www.zhihu.com/market/")==0){
    main.market();
  }
  else {
    main.run();
  }
}();
