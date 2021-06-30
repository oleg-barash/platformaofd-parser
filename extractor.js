// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://lk.platformaofd.ru/web/auth/dashboard?start=13.09.2020+14%3A00&end=13.09.2020+14%3A59
// @grant        none
// ==/UserScript==
console.log("Инициализация скрипта");
function loadScript(url, callback){

   var script = document.createElement("script")
   script.type = "text/javascript";

   if (script.readyState){  //IE
      script.onreadystatechange = function(){
         if (script.readyState == "loaded" ||
            script.readyState == "complete"){
            script.onreadystatechange = null;
            callback();
         }
      };
   } else {  //Others
      script.onload = function(){
         callback();
      };
   }

   script.src = url;
   document.getElementsByTagName("head")[0].appendChild(script);
}
(function() {
   'use strict';
   window.parseMoney = (val) => {
      return parseFloat(val.replace(/[ ₽]/gm, '').replace(',', '.'));
   }

   window.push = (newItem) => {
      let stringdata = localStorage.getItem("data");
      if (!stringdata) {
         localStorage.setItem("data", JSON.stringify([newItem]));
      } else {
         loadScript('https://cdn.jsdelivr.net/npm/lodash@4.17.20/lodash.min.js', () => {
         let data = JSON.parse(stringdata);
         if (_.some(data, (item) => item.Date === newItem.Date)){
            data = _.map(data, (item) => {
               if (item.Date === newItem.Date) {
                  item.Cache = newItem.Cache;
                  item.Card = newItem.Card;
                  item.Total = newItem.Total;
               }
               return item;
            });
         } else {
            data.push(newItem);
         }
         localStorage.setItem("data", JSON.stringify(data));
         });
      }
   }

   window.extract = () => {
      if ($("#cheques-content .table").length > 0) {
         let cache = window.parseMoney($("#cheques-content .table")[0].rows[3].cells[1].innerText);
         let card = window.parseMoney($("#cheques-content .table")[0].rows[3].cells[2].innerText);
         push({
            Date: $("#cheques_filter_form_id")[0].start.value.replace(" 00:00", ''),
            Cache: cache,
            Card: card,
            Total: +cache + card
         })
      } else {
         push({
            Date: $("#cheques_filter_form_id")[0].start.value.replace(" 00:00", ''),
         })
      }
   }

   window.moveNext = () => {
      let form = $("#cheques_filter_form_id")[0];
      loadScript('https://momentjs.com/downloads/moment.js', () => {
         form.end.value = form.start.value = moment(form.start.value, "DD.MM.YYYY hh:mm").add(1, 'day').format("DD.MM.YYYY 00:00");
         form.submit();
      });
   }

   let status = localStorage.getItem("status");
   if (!!status) {
      if (JSON.parse(status) === true) {
         window.extract();
         window.moveNext();
      }
   }

   window.start = () => {
      localStorage.setItem("status", JSON.stringify(true));
      window.extract();
      window.moveNext();
   }

   window.printData = () => {
      let stringdata = localStorage.getItem("data");
      let data = JSON.parse(stringdata);
      loadScript('https://cdn.jsdelivr.net/npm/lodash@4.17.20/lodash.min.js', () => {
         _.each(data, item => {
           console.log(item.Date + ', , , ' + item.Total + ', , ' + item.Card);
         })
      });
   }

})();
