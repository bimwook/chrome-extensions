"use strict";

var config = {};
config.controls = {};
config.controls.hostname = document.getElementById("hostname");
config.controls.save = document.getElementById("save");
config.local= localStorage || {data:{},setItem:function(key,value){this.data[key]=value;},getItem:function(key){return this.data[key]}};   
config.save = function(){
  this.local.setItem("ext.hostname", this.controls.hostname.value);
};

config.load = function(){
  var me = this;
  this.controls.hostname.value = this.local.getItem("ext.hostname")||"https://www.bimwook.com:11180";
  this.controls.save.onclick = function(){
    me.save();
    alert("保存成功");
  }
};
config.load();
