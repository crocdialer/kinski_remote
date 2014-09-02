ControlWidget = 
{
  update_url: "http://" + location.host + "/state",
  root_elem: $("#control_form fieldset"),
  components: [],
 
  init: function()
  {
    console.log("init ControlWidget");
  },

  update_ui_with_component: function(the_component)
  {
    var field_set = $("<fieldset></fieldset>").hide();
    var legend = $("<legend/>").html(the_component.name);
    $("#control_form").append($("<a>", {
                                click: function(){ field_set.slideToggle();} 
                              }).append(legend));
    $("#control_form").append(field_set);

    var self = this;
    $.each(the_component.properties, function(key, prop)
    {
      self.add_control_for_property(the_component.name, prop, field_set);
    });
  },

  get_state_and_update: function()
  {
    this.set_loading(true);
    var self = this;

    $.getJSON(this.update_url, function(data)
    {
      self.components = data;
      for(var i = 0; i < data.length; i++)
      {
        self.update_ui_with_component(data[i]);
        self.set_loading(false);
      }
    });       
  },

  set_loading: function(the_bool)
  {
    //TODO: implement
  },

  add_control_for_property: function(the_component_name, the_property, root_elem)
  {
    var self = this;
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
    
    input_elem = $( "<input/>", {
        "id": stripped_name,
        "name": stripped_name,
        "type": "text",
        "class": "form-control input-md",
        "value": the_property.value 
    });
    input_col = $("<div class='col-md-4'>").append(input_elem);

    switch(the_property.type)
    {
      case "string":
        input_elem.attr("type", "text");
        break;

      case "int":
      case "uint":
      case "float":
      case "double":
        input_elem.attr("type", "number");
        input_elem.val(Number(input_elem.val()));
        break;

      case "bool":
        input_elem.attr("type", "checkbox");
        input_elem.removeAttr('value');
        input_elem.prop('checked', the_property.value);
        break;

      case "vec4":
        input_elem.attr("type", "color");
        break;

      default:
        break;
    }

    if(input_elem != undefined)
    {
      // add change event
      input_elem.on("change", function()
      {
        var changed_prop = the_property;
        changed_prop.value = input_elem.val();

        switch(the_property.type)
        {
          case "bool":
          changed_prop.value = input_elem.prop('checked');
          break;
          
          case "int":
          case "uint":
          case "float":
          case "double":
            changed_prop.value = Number(changed_prop.value);
        break;

          default:
            break;
        }
        //input_elem.attr("name");

        self.on_change(the_component_name, changed_prop);
      });

      group.append(input_col);

      var root = root_elem == undefined ? this.root_elem : root_elem; 
      root.append(group); 
    }
  },

  on_change: function(the_component_name, the_json_obj)
  {
    console.log(the_json_obj);
    var component_obj = [{"name" : the_component_name, "properties": [the_json_obj]}]
    //$.post(this.update_url, JSON.stringify(component_obj), null, "json");

    $.ajax({
    type: "POST",
    url: this.update_url,
    data: JSON.stringify(component_obj),
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    success: null,
    failure: null}); 
  }
};

$(document).ready(function(){
  ControlWidget.init();
  ControlWidget.get_state_and_update();
});
