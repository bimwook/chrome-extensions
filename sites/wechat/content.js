void function(){
  var button = [
    '<button class="o-share _9-mn" type="button">',
    '<svg style="fill:black;" viewBox="0 0 482.239 482.239" width="24" height="24" xmlns="http://www.w3.org/2000/svg">',
    '<path d="m465.016 0h-344.456c-9.52 0-17.223 7.703-17.223 17.223v86.114h-86.114c-9.52 0-17.223 7.703-17.223 17.223v344.456c0 9.52 7.703 17.223 17.223 17.223h344.456c9.52 0 17.223-7.703 17.223-17.223v-86.114h86.114c9.52 0 17.223-7.703 17.223-17.223v-344.456c0-9.52-7.703-17.223-17.223-17.223zm-120.56 447.793h-310.01v-310.01h310.011v310.01zm103.337-103.337h-68.891v-223.896c0-9.52-7.703-17.223-17.223-17.223h-223.896v-68.891h310.011v310.01z"></path>',
    '</svg>',
    '</button>'
  ].join("");
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
    var ret = (v||"").trim();
    ret = ret.replace(/#/g, "＃");
    ret = ret.replace(/\*/g, "＊");
    ret = ret.replace(/\-/g, "—");
    ret = ret.replace(/\_/g, "＿");
    return ret;
  };
  main.list = function(data, x){
    var me = this;
    for(let i=0; i<x.childNodes.length; i++){
      let node = x.childNodes[i];
      if (node.nodeType == 3) {
        var txt = me.clean(node.nodeValue);
        if(txt){
          data.push(txt);
        }
      }
      else if (node.nodeName == "IMG") {
        data.push("\r\n");
        data.push("![media](" + ($(node).attr("data-src") || $(node).attr("src")) + ")");
        data.push("\r\n");
      }
      else if ( (node.nodeName == "OL") || (node.nodeName == "UL") ) {
        for (let ii = 0; ii < node.childNodes.length; ii++) {
          let nx = node.childNodes[ii];
          if (nx.nodeName == "LI") {
            data.push("　　- " + me.clean(nx.innerText));
            data.push("\r\n");
          }
        }
      }
      else {
        me.list(data, node);
        if(node.nodeName == "P"){
          data.push("\r\n");
        }
        else if(node.nodeName == "BR"){
          data.push("\r\n");
        }
        else if(node.nodeName == "DIV"){
          data.push("\r\n");
        }
        else if(node.nodeName == "SECTION"){
          data.push("\r\n");
        }
      }
    }
  };
  main.build  = function(){
    var me = this;
    var data = [];
    var title = document.title || this.clean($("meta[property='og:title']").attr("content"));
    var author = [];
    if($("meta[name=author]").attr("content")){
      author.push($("meta[name=author]").attr("content"));
    }
    if($("#js_name").text().trim()){
      author.push($("#js_name").text().trim());
    }
    //if($("#js_account_nickname").text()){
    //  author.push($("#js_account_nickname").text().trim());    
    //}    
    if($(".account_nickname_inner").text()){
      author.push($(".account_nickname_inner").text().trim());    
    }  
    $("script").remove();
    $(".js_audio_frame").remove();
    $(".js_video_channel_container").remove();
    $(".video_source_link").remove();
    $(".wx_profile_card").remove();
    author.push($("#publish_time").text().trim());
    data.push("");
    data.push("　　# " + title);
    data.push("　　** " + author.join(" | ") + " ** ");
    data.push("");
    var text  = [];
    me.list(text, $("#js_content, #media")[0]);
    data.push(this.format(text.join("")));
    data.push('');
    data.push("　　- [查看来源](" + window.location.href + ")");
    data.push('');
    console.log(data.join("\r\n"));
    chrome.runtime.sendMessage(
      me.extensionid,
      {
        dbase: "wechat",
        title: title,
        echo: true,
        text: data.join("\r\n")
      }
    );
  };
  main.run = function () {
    var me = this;
    let button = $('<button id="o-btn-mark" class="o-woo-button">Mark</button>');
    button.on("click", function(){
      me.build();
    });
    $("body").append(button);
  };
  main.run();
}();
