  void function(){
  let main = {};
  main.extensionid = "nnbckhhgmagdjdknimnookgmajpggdgj";
  main.format = function(text){
    let list = (text||"").replace(/\r/g, "").split("\n");
    let ret = [];
    for(let  i=0; i<list.length; i++){
      let row = list[i].trim();
      if(row){
        ret.push("　　" + row);
      }
    }
    return ret.join("\r\n");
  }
  main.clean = function(){
    $("body").css("background", "white");
    $(".WB_miniblog").css("background", "rgba(0,0,0,0.65)");
    $(".S_wrap").css("background", "rgba(0,0,0,0.65)");
    $(".WB_frame").css("background", "rgba(73,72,72,0.25)");
  };
  main.markdown = function(){
    let me = this;
    let url = window.location.href;
    if(url.indexOf("https://s.weibo.com/")==0){
      $(".card-act ul").append("<li><a class='o-markdown' href='javascript:;'>文字</a></li>");
      $(".card-act li").addClass("o-button");
      $(".o-markdown").on("click", function(e){
        let p = $(this).parent().parent().parent().parent();
        var full = $('p[node-type="feed_list_content_full"]', p);
        if(full.length>0){
          $('p[node-type="feed_list_content"]', p).hide();
          full.show();
        }
        let cnt = $(".content>.txt", p);
        if(cnt.length>1){
          cnt = cnt[1];
        }
        else {
          cnt = cnt[0];
        }
        let data = [];
        let nickname = $(cnt).attr("nick-name");
        let uid = $(".avator a", p).attr("href").replace(/\?.*/, "").replace("https:","").replace("//weibo.com/","");
        if(uid.match(/^\d+$/)){
          uid = "/u/" + uid;
        }
        else if(!uid.startsWith("/")) {
          uid = "/" + uid;
        }
        data.push("");
        data.push("　　- [" + nickname + "](//weibo.com" + uid + ") ");
        data.push("");
        let text = [];
        for(let i=0; i<cnt.childNodes.length; i++){
          let node = cnt.childNodes[i];
          if(node.nodeType==3){
            text.push(node.nodeValue.replace(/#/g, "＃"));
          }
          else if(node.nodeName=="BR"){
            text.push("\r\n");
          }
          else if(node.nodeName=="IMG"){
            text.push(node.alt)
          }
          else if(node.nodeName=="A"){
            text.push(node.innerText.replace(/#/g, "＃").replace("收起全文d","").replace("O网页链接",""));
          }
        }
        data.push( me.format(text.join("")) );
        let expand = $(".card-comment", p);
        if(expand.length>0){
          data.push("");
          let text = [];
          let newline = true;
          let nickname = $('a.name', expand).first().text().trim();
          let uid = ($("a.name", expand).attr("href")||"").replace(/\?.*/, "").replace("https:","").replace("//weibo.com/","");
          if(uid){
            if(uid.match(/^\d+$/)){
              uid = "/u/" + uid;
            }
            else if(!uid.startsWith("/")) {
              uid = "/" + uid;
            }
            text.push("\r\n> @[" + nickname.slice(1) + "](//weibo.com" + uid + ") \r\n");
          }
          let wb_texts = $('p[node-type="feed_list_content_full"]', expand);
          if(wb_texts.length==0){
            wb_texts = $('p[node-type="feed_list_content"]', expand);
          }
          else {
            $('p[node-type="feed_list_content"]', expand).hide();
            wb_texts.show();
          }
          let cnt = wb_texts[0];
          for(let ii=0; ii<cnt.childNodes.length; ii++){
            let node = cnt.childNodes[ii];
            if(node.nodeType==3){
              var txt =  node.nodeValue.replace(/#/g, "＃").trim();
              if(txt){
                text.push( (newline ? "> ":"") + txt);
                newline = false;
              }
            }
            else if(node.nodeName=="BR"){
              text.push("\r\n");
              newline=true;
            }
            else if(node.nodeName=="IMG"){
              text.push((newline ? "> ":"") + node.alt);
              newline = false;
            }
            else if(node.nodeName=="A"){
              text.push((newline ? "> ":"") + node.innerText.replace(/#/g, "＃").replace("收起全文d","").replace("O网页链接",""));
              newline = false;
            }
          }
          data.push( me.format(text.join("")) );
        }
        let list = $(".media-piclist img", p);
        if(list.length>0){
          data.push("");
          for(let i=0; i<list.length; i++){
            let img = list[i];
            let src = img.src.replace(/thumb150|orj360/,"large");
            data.push("　　![media](" + src + ")");
          }
        }
        let aa = $(".from a", p);
        data.push("");
        data.push("　　" + $(aa[0]).text().trim() + " | " + $(aa[1]).text().trim());
        data.push("");
        console.log(data.join("\r\n"));
        chrome.runtime.sendMessage(
          me.extensionid,
          {
            dbase: "weibo",
            title: nickname,
            echo: true,
            text: data.join("\r\n")
          }
        );
      })
    }
    else if(url.indexOf("https://weibo.com/tv/show/")==0){
      setTimeout(function(){
        let v = $("video");
        if(v.length>0){
          console.log(v.attr("src"));
        }
      },1500);
    }
    else if( (url.indexOf("https://d.weibo.com/")==0) || (url.indexOf("https://weibo.com/")==0) ) {
      console.log("woo, let us do it.");
      function run() {
        let lines = $('.WB_cardwrap');
        for(let i=0; i<lines.length; i++){
          let card = $(lines[i]);
          let buttons = $(".WB_row_line li", card);
          if(buttons.length>0){
            var button = buttons[buttons.length-1];
            let li = $(button);
            button.card = card;
            li.html('<a href="javascript:;"><span class="pos"><span class="line S_line1"><em>文本</em></span></span></span></a>');
            li.off();
            li.on("click", function(){
              let card = this.card;
              let data = [];
              let nickname = $(".WB_info a", card).first().text().trim();
              let uid = $(".WB_info a", card).attr("href").replace(/\?.*/, "").replace("https:","").replace("//weibo.com/","");
              if(uid.match(/^\d+$/)){
                uid = "/u/" + uid;
              }
              else if(!uid.startsWith("/")) {
                uid = "/" + uid;
              }
              let text = [];
              let wb_texts = $('div[node-type="feed_list_content_full"]', card);
              if(wb_texts.length==0){
                wb_texts = $('div[node-type="feed_list_content"]', card);
              }
              //let wb_texts = $(".WB_text", card);
              for(let ix=0; ix< wb_texts.length; ix ++){
                let cnt = wb_texts[ix];
                for(let ii=0; ii<cnt.childNodes.length; ii++){
                  let node = cnt.childNodes[ii];
                  if(node.nodeType==3){
                    text.push(node.nodeValue.replace(/#/g, "＃"));
                  }
                  else if(node.nodeName=="BR"){
                    text.push("\r\n");
                  }
                  else if(node.nodeName=="IMG"){
                    text.push(node.alt)
                  }
                  else if(node.nodeName=="A"){
                    text.push(node.innerText.replace(/#/g, "＃").replace("收起全文d","").replace("O网页链接",""));
                  }
                }
              }
              let expand = $(".WB_feed_expand", card);
              if(expand.length>0){
                let newline = true;
                let nickname = $(".WB_info a", expand).first().text().trim();
                let uid = ($(".WB_info a", expand).attr("href")||"").replace(/\?.*/, "").replace("https:","").replace("//weibo.com/","");
                if(uid){
                  if(uid.match(/^\d+$/)){
                    uid = "/u/" + uid;
                  }
                  else if(!uid.startsWith("/")) {
                    uid = "/" + uid;
                  }
                  text.push("\r\n> @[" + nickname.slice(1) + "](//weibo.com" + uid + ") \r\n");
                }
                let wb_texts = $('div[node-type="feed_list_reason_full"]', card);
                if(wb_texts.length==0){
                  wb_texts = $('div[node-type="feed_list_reason"]', card);
                }
                let cnt = wb_texts[0];
                for(let ii=0; ii<cnt.childNodes.length; ii++){
                  let node = cnt.childNodes[ii];
                  if(node.nodeType==3){
                    var txt =  node.nodeValue.replace(/#/g, "＃").trim();
                    if(txt){
                      text.push( (newline ? "> ":"") + txt);
                      newline = false;
                    }
                  }
                  else if(node.nodeName=="BR"){
                    text.push("\r\n");
                    newline=true;
                  }
                  else if(node.nodeName=="IMG"){
                    text.push((newline ? "> ":"") + node.alt);
                    newline = false;
                  }
                  else if(node.nodeName=="A"){
                    text.push((newline ? "> ":"") + node.innerText.replace(/#/g, "＃").replace("收起全文d","").replace("O网页链接",""));
                    newline = false;
                  }
                }
              }
              let aa = $(".WB_from a", card);
              data.push("");
              data.push("　　- [" + nickname + "](//weibo.com" + uid + ") ");
              data.push("");
              data.push( me.format(text.join("")) );
              let list = $(".WB_media_a img", card);
              if(list.length>0){
                data.push("");
                for(let i=0; i<list.length; i++){
                  let img = list[i];
                  let src = img.src.replace(/thumb150|orj360/,"large");
                  data.push("　　![media](" + src + ")");
                }
              }
              data.push("");
              data.push("　　" + $(aa[0]).attr("title").trim() + " | " + ($(aa[1]).text().trim() || "微博") );
              data.push("");
              console.log(data.join("\r\n"));
              chrome.runtime.sendMessage(
                me.extensionid,
                {
                  dbase: "weibo",
                  title: nickname,
                  echo: true,
                  text: data.join("\r\n")
                }
              );
              //chrome.runtime.sendMessage({nickname: nickname, text: data.join("\r\n")});
            });
          }
        }
      }
      let t = 0;
      window.onscroll = function(){
        window.clearTimeout(t);
        t = setTimeout(run, 500);
      }
      setTimeout(run, 1500);
    }
    else {
    }
  };
  main.clean();
  main.markdown();
}();
