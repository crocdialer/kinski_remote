function build_ui(json_obj){
  //console.log(json_obj);
  
  items = [];
  
  list_obj = $( "<ul/>", {
      "class": "my-new-list"
  });

  $.each(json_obj.properties, function( key, val ){
    tmp = $( "<li/>", {
      html: val.name + ": " + val.value
    })
    
    list_obj.append(tmp)
    items.push(tmp); 
  });
  
  //console.log(items);

  list_obj.appendTo( "body" );
}


$(document).ready(function(){
  console.log("kinski_remote.js loaded -- location.host: " + location.host);
  
  $.getJSON( "http://" + location.host + "/state", function( data ) {
    build_ui(data[0]);
  });

});
