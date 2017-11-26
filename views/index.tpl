<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="crocdialer@googlemail.com">

    <title>Kinski Remote</title>

    <!-- Bootstrap Core CSS -->
    <link href="/static/css/bootstrap.min.css" rel="stylesheet">
    <link href="/static/css/main.css" rel="stylesheet">

    <!-- Custom CSS -->
    <style>
    body {
        padding-top: 70px;
        /* Required padding for .navbar-fixed-top. Remove if using .navbar-static-top. Change if height of navigation changes. */
    }
    </style>

</head>

<body>

    <!-- Navigation -->
    <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
        <div class="container">
            <!-- Brand and toggle get grouped for better mobile display -->
            <div class="navbar-header">
                <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="/">Kinski Remote</a>
            </div>
            <!-- Collect the nav links, forms, and other content for toggling -->
            <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul class="nav navbar-nav">
                    <li><a id="snapshot" href="/cmd/generate_snapshot">snapshot</a></li>
                    <li><a id="save" href="#">save</a></li>
                    <li><a id="load" href="#">load</a></li>
                </ul>
                <div class="col-sm-4 col-md-4 pull-right">
                    <form class="navbar-form pull-right">
                        <div class="input-group">
                            <input id="cmd_box" type="text" class="form-control" placeholder="send command ...">
                            <div class="input-group-btn">
                                <button id="cmd_button" class="btn btn-default" type="button">
                                    <span class="glyphicon glyphicon-chevron-right"></span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <!-- /.navbar-collapse -->
        </div>
        <!-- /.container -->
    </nav>

    <!-- Page Content -->
    <div class="container">

        <div class="row">
          <!-- Snapshot image -->
          <!-- <img src="#" id="snapshot_img" width="200px" height="125px" class="img-rounded img-responsive"/> -->
          <div class="col-md-12">
              <div id="log_panel">
                  <p class="log_item">...</p>
              </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <form id="control_form" class="form-horizontal">
              <!--fieldset>
                <legend>Form Name</legend>
              </fieldset-->
            </form>
          </div>
        </div>
        <!-- /.row -->
    </div>
    <!-- /.container -->

    <!-- jQuery -->
    <script src="/static/js/jquery-2.2.4.min.js"></script>

    <!-- Bootstrap Core JavaScript -->
    <script src="/static/js/bootstrap.min.js"></script>

    <!-- our main script -->
    <script src="/static/js/main.js"></script>

</body>
