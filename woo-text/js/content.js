var wootext={};
wootext.save = function(){
  if(window.getSelection){
    var text = window.getSelection().toString();
    chrome.runtime.sendMessage({ action: 100, data: text });    
  }
}