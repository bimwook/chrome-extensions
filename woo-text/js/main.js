-function(o){
  let cache = [];
  chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({url: "main.html" });
  });
  chrome.contextMenus.create({
    title: "分享选中内容",
    contexts: ["selection"],
    onclick: function(e){
      chrome.tabs.executeScript({
        code: 'wootext.save();'
      });
    }
  });
  chrome.runtime.onMessage.addListener(function(m) {
    switch(m.action){
      case 100: {
        var item = {sn: Math.floor(Math.random()*10000000000), text: m.data};
        cache.push(item);
        chrome.tabs.create({url: "main.html?sn=" + item.sn});
        break;
      }
      case 110: {
        var item = cache.find(function(x){
          return (x.sn=m.data);
        });
        if(item){
          var i = cache.indexOf(item);
          console.log(i);
          cache.splice(i,1);
          chrome.runtime.sendMessage({action: 200, data: item });      
          console.log(cache);    
        }
        break;
      }
    }
  });
}({});

