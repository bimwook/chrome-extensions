/*!
 * https://www.bimwook.com/
 *
 * Copyright (c) 2016-2018 Yangbo
 *
 * Date: 2018-01-03 16:00:00 +0800
 * Revision: 2.0
 */
 
var marked = {};
marked.encode = function(s){
  return s.replace(/&/g, '&amp;').replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
};
marked.items = [
  {
    name: "blockquote",
    regex: /^> ([^\n]+)/,
    execute: function(data){
      while(true){
        var mcs = (data||"").match(this.regex);
        if(!mcs) break;
        var s = '<blockquote>' + mcs[1] + '</blockquote>';        
        data = data.replace(this.regex, s);
      }
      return data;  
    }
  },
  {
    name: "heading",
    regex: /^(#{1,6}) {0,}([^\n]+?) *#* *(?:\n+|$)/,
    execute: function(data){
      while(true){
        var mcs = (data||"").match(this.regex);
        if(!mcs) break;
        var l = mcs[1].length;
        var s = '<h' + l +">"  + mcs[2] + '</h' + l + '>';        
        data = data.replace(this.regex, s);
      }
      return data;
    }
  },
  {
    name: "img",
    regex: /!\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/,
    execute: function(data){
      while(true){
        var mcs = (data||"").match(this.regex);
        if(!mcs) break;
        var s = '<img src="' + marked.encode(mcs[2]) + '" alt="' + marked.encode(mcs[1]||"") + '">';        
        data = data.replace(this.regex, s);
      }
      return data;
    }
  },
  {
    name: "hr",
    regex: /^( *[-*_]){3,} *(\n+|$)/,
    execute: function(data){
      while(true){
        var mcs = (data||"").match(this.regex);
        if(!mcs) break;
        var s = '<hr />';        
        data = data.replace(this.regex, s);
      }
      return data;  
    }
  },
  //code: /^( {4}[^\n]+\n*)+/,
  {
    name: "strong",
    regex: /\*\*([\s\S]+?)\*\*(?!\*)|__([\s\S]+?)__(?!_)/,
    execute: function(data){
      while(true){
        var mcs = (data||"").match(this.regex);
        if(!mcs) break;
        
        var s = '<strong>' + marked.encode(mcs[1]||mcs[2]) + '</strong>';        
        data = data.replace(this.regex, s);
      }
      return data;        
    }
  },
  {
    name: "italic",
    regex: /_([\s\S]+?)_(?!_)/,
    execute: function(data){
      while(true){
        var mcs = (data||"").match(this.regex);
        if(!mcs) break;
        var s = '<i>' + marked.encode(mcs[1]) + '</i>';        
        data = data.replace(this.regex, s);
      }
      return data;        
    }
  },  
  {
    name: "tag",
    regex: /`([\s\S]+?)`(?!`)/,
    execute: function(data){
      while(true){
        var mcs = (data||"").match(this.regex);
        if(!mcs) break;
        var s = '<span class="tag">' + marked.encode(mcs[1]) + '</span>';        
        data = data.replace(this.regex, s);
      }
      return data;        
    }
  },  
  {
    name: "link",
    regex: /!?\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\]\(\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*\)/,
    execute: function(data){
      while(true){
        var mcs = (data||"").match(this.regex);
        if(!mcs) break;
        var s = '<a target="_blank" href="' + marked.encode(mcs[2]) + '" title="' + marked.encode(mcs[3]||"") + '">' + marked.encode(mcs[1]) + '</a>';        
        data = data.replace(this.regex, s);
      }
      return data;      
    }
  },
  {
    name: "p",
    regex: / {0,}([\w\W]+?)\n/g,
    execute: function(data){
      var mcs = (data||"").match(this.regex);
      if(!mcs) return data;
      var lines = [];
      for(var i=0; i<mcs.length; i++){
        var mc = mcs[i];
        var text = (mc + "").replace(/(^\s*)|(\s*$)/g, "");
        if(text.indexOf("<h")>-1 || text.indexOf("<img ")>-1 || text.indexOf("<blockquote")>-1){
          lines.push(text);
        }
        else{
          lines.push("<p>" + text + "</p>");
        }
      }
      //data = '<p>' + data.replace(this.regex, s) + '</p>';
      return lines.join('\r\n');  
    }
  },
];
marked.parse = function(data, indent){
  var lines = data.replace(/\r/g, "").split('\n');
  var ret = [];
  if(!lines) return "";
  for(var i=0; i<lines.length; i++){
    var line = (lines[i]).replace(/(^\s*)|(\s*$)/g, "") + "\n";
    for(var rr=0; rr<this.items.length; rr++){
      var reg = this.items[rr];
      if(!reg) continue;
      line = reg.execute(line);
    }
    ret.push((indent||"") + line);
  }
  //console.log(ret.join(''));
  return ret.join("\r\n");
};