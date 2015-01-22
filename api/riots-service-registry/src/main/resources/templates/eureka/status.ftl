<#import "/spring.ftl" as spring />
<!doctype html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js"> <!--<![endif]-->
<head>
  <base href="<@spring.url basePath/>">
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Eureka</title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width">

  <!-- Latest compiled and minified CSS -->
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">

  <link rel="stylesheet" href="eureka/css/wro.css">

</head>

<script src="https://code.jquery.com/jquery-2.1.3.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>
<script type="text/javascript">
  $(document).ready(function () {
    $('table.stripeable tr:odd').addClass('odd');
    $('table.stripeable tr:even').addClass('even');
  });
</script>

<style>
  .popover{
    max-width: 100%;
  }

  .popover-title {
    margin: 0;
    padding: 8px 14px;
    font-size: 14px;
    font-weight: bold;
    line-height: 18px;
    background-color: #f7f7f7;
    border-bottom: 1px solid #ebebeb;
    border-radius: -1 -1 0 0;
  }

</style>

<script type="application/javascript">
  function toggleAll(appName, toggleId) {
    $("[id^=collapse_" + appName + "]").each(function () {
      $(this).collapse('toggle');
    });

    $("#" + toggleId).toggleClass("glyphicon-resize-small");
  }

  function syntaxHighlight(json) {
    json = json.replace(/\\n/g, '').replace(/\\/g, '');


    if (typeof json != 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  function registerHealthLoadCallback(url, collapseDiv, healthDiv) {
    var healthDivId = '#' + healthDiv;
    var errorDivId = '#' + healthDiv + "_error";
    var loadingDivId = '#' + healthDiv + "_loading";

    $.ajaxSetup({timeout: 15000});
    $('#' + collapseDiv).on('shown.bs.collapse', function () {
      $.get(url, function (data) {
        console.log(data);
        $(loadingDivId).addClass('hidden'); // todo fix labels (green. red...)
        var healthDivContent = '<dl class="dl-horizontal">' +
                '<dt><strong>Overall Health</strong></dt>' +
                "<dd><span class='label label-success'>" + data.status + "</span></dd>";

        if (data.diskSpace) {
            healthDivContent += '<dt><strong>Diskspace</strong></dt>' +
            "<dd><span class='label label-success'>" + data.diskSpace.status + "</span>" +
            "<a style='margin-left: 10px' tabindex='0' data-toggle='popover' data-trigger='focus' " +
            "title='DiskSpace Details' data-content='Free space (bytes): " + data.diskSpace.free + "'>" +
            "<span  class='label label-info'>Show Details</a>" +
            "</dd>";
        }

        if (data.hystrix) {
          healthDivContent += '<dt><strong>Hystrix</strong></dt>' +
          "<dd><span class='label label-success'>" + data.hystrix.status + "</span></dd>";
        }

        if (data.discovery) {
          healthDivContent += '<dt><strong>Discovery</strong></dt>' +
          "<dd><span class='label label-success'>" + data.discovery.status + "</span></dd>";
        }

        if (data.mongo) {
          healthDivContent += '<dt><strong>Mongo</strong></dt>' +
          "<dd><span class='label label-success'>" + data.mongo.status + "</span></dd>";
        }
        if (data.elasticsearch) {
          healthDivContent += '<dt><strong>Elasticsearch</strong></dt>' +
          "<dd><span class='label label-success'>" + data.elasticsearch.status +
          "</span>" +
          "<a style='margin-left: 10px' tabindex='0' data-toggle='popover' data-trigger='focus' " +
          "title='Elasticsearch ClusterState Details' data-content='" + data.elasticsearch.clusterstatus + "'>" +
          "<span  class='label label-info'>Show Details</a>" +
          "</dd>";
        }

        healthDivContent += '</dl>';

        $(healthDivId).empty().append(healthDivContent);
        var popoverTemplate = '<div class="popover" role="tooltip"><div class="arrow"></div><h2 class="popover-title"></h2><pre><div class="popover-content"></div></pre></div>';
        $('[data-toggle="popover"]').popover({"template" : popoverTemplate})
      }).fail(function () {
        $(loadingDivId).addClass('hidden');
        $(errorDivId).removeClass('hidden');
      });
    })
  }
</script>


<body id="one">
<#include "header.ftl">
<div class="container-fluid xd-container">
<#include "navbar.ftl">
  <h1>Riots Services Currently Registered</h1>

  <div role="tabpanel" style="margin-bottom: 20px">

    <!-- Nav tabs -->
    <ul class="nav nav-tabs" role="tablist">
    <#if apps?has_content>
        <#list apps as app>

            <#if app_index == 0>
            <li role="presentation" class="active">
            <a href="#${app.name}" aria-controls="home" role="tab" data-toggle="tab">
            <#else>
            <li role="presentation">
            <a href="#${app.name}" aria-controls="home" role="tab" data-toggle="tab">
            </#if>
            <#if app.everythingAlright>
              <span class="label label-success"
                    style="padding-top: 6px;margin-bottom: 6px; font-size: xx-small">UP</span>
            <#else>
              <span class="label label-danger"
                    style="padding-top: 6px; margin-bottom: 6px; font-size: xx-small">DOWN</span>
            </#if>
          <span style="font-size: medium; padding-left:10px">${app.name}</span>

          <span id="${app.name}_toggle" class="glyphicon glyphicon-resize-full"
                style="margin-left: 10px; cursor: pointer;"
                onclick="toggleAll('${app.name}', '${app.name}_toggle')"></span>
        </a>
        </li>
        </#list>
    </#if>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
    <#if apps?has_content>
        <#list apps as app>
            <#if app_index == 0>
            <div role="tabpanel" class="tab-pane fade in active" id="${app.name}">
            <#else>
            <div role="tabpanel" class="tab-pane fade" id="${app.name}">
            </#if>
          <div class="panel-group" style="margin-top: 10px" id="accordion_${app.name}" role="tablist">
              <#list app.instances as instance>
                <div class="panel panel-default">
                  <div class="panel-heading" role="tab" id="heading_${instance_index}">
                    <h4 class="panel-title">
                      <a data-toggle="collapse" data-target="#collapse_${app.name}_${instance_index}"
                         href="#collapse_${app.name}_${instance_index}">
                        <span style="padding-right: 10px"
                              class="glyphicon glyphicon-cog"></span><strong>${instance.instanceId}</strong>
                          <#if instance.ok == "true">
                            <span class="pull-right label label-success"
                                  style="padding-top: 6px;margin-bottom: 6px; font-size: xx-small">LOOKING GOOD</span>
                          <#else>
                            <span class="pull-right label label-danger"
                                  style="padding-top: 6px; margin-bottom: 6px; font-size: xx-small">NOT OK</span>
                          </#if>
                      </a>
                    </h4>
                  </div>
                  <div id="collapse_${app.name}_${instance_index}" class="panel-collapse collapse " role="tabpanel">
                    <div class="panel-body">
                      <div class="container-fluid">
                        <div class="row">

                          <!-- Overview -->
                          <div class="col-md-6">
                            <div class="panel panel-default">
                              <div class="panel-heading">
                                <div class="panel-title">
                                  <span class="glyphicon glyphicon-info-sign" style="margin-right: 5px;"></span><strong>Overview</strong>
                                </div>
                              </div>
                              <div class="panel-body">
                                <dl class="dl-horizontal">
                                  <dt><strong>ID</strong></dt>
                                  <dd>${instance.id}</dd>
                                  <dt><strong>InstanceId</strong></dt>
                                  <dd>${instance.instanceId}</dd>
                                  <dt><strong>Hostname</strong></dt>
                                  <dd>${instance.hostname}</dd>
                                  <dt><strong>Port</strong></dt>
                                  <dd>${instance.port}</dd>
                                </dl>
                              </div>
                            </div>
                          </div>

                          <!-- Health -->
                          <div class="col-md-6">
                            <div class="panel panel-default">
                              <div class="panel-heading">
                                <div class="panel-title">
                                  <span class="glyphicon glyphicon-dashboard" style="margin-right: 5px;"></span><strong>Health</strong>
                                </div>
                              </div>
                              <div class="panel-body" id="health_${app.name}_${instance_index}">
                                <script>
                                  registerHealthLoadCallback("${instance.healthCheckUrl}", "collapse_${app.name}_${instance_index}", "health_${app.name}_${instance_index}")
                                </script>
                                <div class="alert alert-danger hidden" role="alert"
                                     id="health_${app.name}_${instance_index}_error">
                                  An error occured:
                                </div>
                                <div id="health_${app.name}_${instance_index}_loading" class="alert alert-warning">
                                  <span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Loading
                                  from URL ${instance.healthCheckUrl}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="row" style="margin-top: 10px">

                          <!-- Resources -->
                          <div class="col-md-6">
                            <div class="panel panel-default">
                              <div class="panel-heading">
                                <div class="panel-title">
                                  <span class="glyphicon glyphicon-eye-open" style="margin-right: 5px"></span><strong>Insights</strong>
                                </div>
                              </div>
                              <div class="panel-body">
                                <dl class="dl-horizontal">
                                  <dt><strong>Build Information</strong></dt>
                                  <dd><a href="${instance.homePageUrl}info">${instance.homePageUrl}info</a></dd>
                                  <dt><strong>Metrics</strong></dt>
                                  <dd><a href="${instance.homePageUrl}metrics">${instance.homePageUrl}metrics</a></dd>
                                  <dt><strong>Trace</strong></dt>
                                  <dd><a href="${instance.homePageUrl}trace">${instance.homePageUrl}trace</a></dd>
                                  <dt><strong>Environment</strong></dt>
                                  <dd><a href="${instance.homePageUrl}env">${instance.homePageUrl}env</a></dd>
                                  <dt><strong>Autoconfig</strong></dt>
                                  <dd><a href="${instance.homePageUrl}autoconfig">${instance.homePageUrl}autoconf</a>
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>

                          <!-- Other -->
                          <div class="col-md-6">
                            <div class="panel panel-default">
                              <div class="panel-heading">
                                <div class="panel-title">
                                  <span class="glyphicon glyphicon-exclamation-sign"
                                        style="margin-right: 5px"></span><strong>Actions</strong>
                                </div>
                              </div>
                              <div class="panel-body">
                                <dl class="dl-horizontal">
                                  <dt><strong>ThreadDump</strong></dt>
                                  <dd><a href="${instance.homePageUrl}dump"><span class="label label-info">Dump</a></dd>
                                  <dt><strong>Pause</strong></dt>
                                  <dd><a href="${instance.homePageUrl}pause"><span
                                          class="label label-warning">Pause</span></a></dd>
                                  <dt><strong>Resume</strong></dt>
                                  <dd><a href="${instance.homePageUrl}resume"><span
                                          class="label label-info">Resume</span></a></dd>
                                  <dt><strong>Shutdown</strong></dt>
                                  <dd><a href="${instance.homePageUrl}shutdown"><span class="label label-danger">Shutdown</span></a>
                                  </dd>
                                </dl>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </#list>
          </div>
        </div>
        </#list>
    </#if>
    </div>
    </div>
    <h1>General Info</h1>

    <table id='generalInfo' class="table table-striped table-hover">
      <thead>
      <tr>
        <th>Name</th>
        <th>Value</th>
      </tr>
      </thead>
      <tbody>
      <#list statusInfo.generalStats?keys as stat>
      <tr>
        <td>${stat}</td>
        <td>${statusInfo.generalStats[stat]!""}</td>
      </tr>
      </#list>
      <#list statusInfo.applicationStats?keys as stat>
      <tr>
        <td>${stat}</td>
        <td>${statusInfo.applicationStats[stat]!""}</td>
      </tr>
      </#list>
      </tbody>
    </table>
  </div>
</body>
</html>
