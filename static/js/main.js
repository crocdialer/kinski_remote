function componentToHex(c)
{
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b)
{
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

ControlWidget =
{
  update_url: "http://" + location.host + "/state",
  log_stream_url: "http://" + location.host + "/log_stream",
  log_stream: undefined,
  root_elem: $("#control_form fieldset"),
  components: [],

  init: function()
  {
    console.log("init ControlWidget");

    var self = this;

    $( "#load" ).click(function()
    {
      console.log("/cmd/load_settings");
      $.get("/cmd/load_settings");
      self.get_state_and_update();
    });
    $( "#save" ).click(function()
    {
      console.log("/cmd/save_settings");
      $.get("/cmd/save_settings");
    });
    $( "#snapshot" ).click(function()
    {
      console.log("generate snapshot");
      $("#snapshot_img").attr("src","/snapshot");
      $("#snapshot_img").show();
    });
    $("#snapshot_img").hide();

    $("#cmd_box").keypress(function(event)
    {
        if(event.keyCode == 13)
        {
            event.preventDefault();
            event.stopPropagation();
            $("#cmd_button").click();
            return false;
        }
    });

    $("#cmd_button").click(function()
    {
        var cmd = $("#cmd_box").val();
        if(cmd){ $.get("/cmd/" + cmd); }
        console.log(cmd);
    });

    this.log_stream = new EventSource(this.log_stream_url)

    var log_func = function(e)
    {
        $('#log_line').html(e.data);
        console.log(e.data);
    };

    this.log_stream.addEventListener('init', log_func, false);
    this.log_stream.addEventListener('new_log_line', log_func, false);

    this.log_stream.addEventListener('error', function(e)
    {
        if (e.readyState == EventSource.CLOSED)
        {
            console.log("log_stream: network error");
        }
        else if( e.readyState == EventSource.OPEN)
        {
            console.log("log_stream: connected");
        }
    }, false);
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
    $("#control_form").empty();
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
        "class": "form-control input-md"
        // "value": the_property.value
    });
    input_col = $("<div class='col-md-4'>").append(input_elem);

    switch(the_property.type)
    {
      case "string":
        input_elem.attr("type", "text");
        input_elem.val(the_property.value);
        break;

      case "int":
      case "uint":
      case "float":
      case "double":
        input_elem.attr("type", "number");
        input_elem.val(Number(the_property.value));
        break;

      case "bool":
        input_elem.attr("type", "checkbox");
        input_elem.removeAttr('value');
        input_elem.prop('checked', the_property.value);
        break;

      case "vec4":
        input_elem.attr("type", "color");

        // convert to color-string
        var hex_str = rgbToHex(parseInt(255 * the_property.value[0]),
                               parseInt(255 * the_property.value[1]),
                               parseInt(255 * the_property.value[2]));
        input_elem.val(hex_str);
        input_elem.attr("defaultValue", hex_str);
        break;

      default:
        input_elem.val(the_property.value);
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

          case "vec2":
          case "vec3":
          case "mat3":
          case "mat4":
          case "float_array":

            // split comma separated values, form array
            var ret_array = [];
            var tmp = changed_prop.value.split(",");
            $.each(tmp, function(index, elem){ ret_array.push(Number(elem)); });
            changed_prop.value = ret_array;
            break;

          case "vec4":
            if(typeof changed_prop.value == 'string' ||
               changed_prop.value instanceof String)
            {
              // transform color-string (e.g. #FF23AB) to vec4 with values in range [0, 1]
              var ret_array = [];
              var tmp = [];
              for(var i = 1; i < 6; i += 2){ tmp.push(changed_prop.value.substring(i, i + 2)); }
              $.each(tmp, function(index, elem){ ret_array.push(parseInt(elem, 16) / 255.0); });
              ret_array.push(1.0);
              changed_prop.value = ret_array;
            }
            break;

          case "string_array":
            // split comma separated values, form array
            var ret_array = [];
            var tmp = changed_prop.value.split(",");
            $.each(tmp, function(index, elem){ ret_array.push(elem); });
            changed_prop.value = ret_array;
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
    // console.log(the_json_obj);
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
