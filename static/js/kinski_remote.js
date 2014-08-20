$(document).ready(function(){
  console.log("kinski_remote.js loaded");
  
  var ws = new WebSocket("ws://localhost:33333");

  //$.getJSON( "http://localhost:33333", function( data ) {
  //  var items = [];
  //  $.each( data, function( key, val ) {
  //    items.push( "<li id='" + key + "'>" + val + "</li>" );
  //  });
 
  //  $( "<ul/>", {
  //    "class": "my-new-list",
  //    html: items.join( "" )
  //  }).appendTo( "body" );
  //});

});
