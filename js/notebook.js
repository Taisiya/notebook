$(function(){

var Note=Backbone.Model.extend({
EMPTY:
{
  text:'none',
  last_modified:'none',
}
initialize: function(){
if(!this.get("content")){this.set({"content": this.EMPTY});}
},//init

});//model

});//$(function()