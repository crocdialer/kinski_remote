var s, ControlWidget = 
{
  settings:
  {
    update_url: "http://" + location.host + "/state",
    root_elem: $("#control_form fieldset")
  },
  
  init: function()
  {
    console.log("init ControlWidget");
    s = this.settings;
  },

  update_ui_with_component: function(the_component)
  {
    list_obj = $( "<ul/>", {
      "class": "my-new-list"
    });
    
    // change component name
    $("#control_form legend").html(the_component.name);

    $.each(the_component.properties, function(key, prop)
    {
      ControlWidget.add_control_for_property(prop);

      tmp = $( "<li/>", 
      {
        html: prop.type+": "+ prop.name + ": " + prop.value
      });
    
      list_obj.append(tmp)
    });
    list_obj.appendTo( "body" );   
  },

  get_state_and_update: function()
  {
    $.getJSON(s.update_url, function(data){
      ControlWidget.update_ui_with_component(data[0]);
    });       
  },

  add_control_for_property: function(the_property)
  {
    var input_elem = undefined;
    var stripped_name = the_property.name.trim().replace(/ /g,'_');

    var group = $( "<div/>", {
      "class": "form-group"
    });

    var label = $( "<label/>", {
      "class": "col-md-4 control-label",
      "for": stripped_name,
      "html": the_property.name 
    });

    group.append(label);

    switch(the_property.type)
    {
      case "string":
        console.log("adding: " + the_property.name);
        input_elem = $( "<input/>", {
        "name": stripped_name,
        "type": "text",
        "class": "form-control input-md"
        }); 

        break;

      default:
        break;
    }

    if(input_elem != undefined)
    {
      group.append(input_elem);
      s.root_elem.append(group); 
    }
  }
};

$(document).ready(function(){
  ControlWidget.init();
  ControlWidget.get_state_and_update();
});
