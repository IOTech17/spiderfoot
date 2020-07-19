            globalTypes = null;
            globalFilter = null;
            lastChecked = null;

            function switchSelectAll() {
                if (!$("#checkall")[0].checked) {
                    $("input[id*=cb_]").prop('checked', false);
                } else {
                    $("input[id*=cb_]").prop('checked', true);
                }
            }

            function filter(type) {
                if (type == "all") {
                    showlist();
                    return;
                }
                if (type == "running") {
                    showlist(["RUNNING", "STARTING", "STARTED", "INITIALIZING"], "Running");
                    return;
                }
                if (type == "finished") {
                    showlist(["FINISHED"], "Finished");
                    return;
                }
                if (type == "failed") {
                    showlist(["ABORTED", "FAILED"], "Failed/Aborted");
                    return;
                }
            }

            function getSelected() {
                ids = [];
                $("input[id*=cb_]").each(function(i, obj) {
                    if (obj.checked) {
                        ids[ids.length] = obj.id.replace("cb_", "");
                    }
                });

                if (ids.length == 0) {
                    alert("You need to select at least one scan.");
                    return false;
                }

                return ids;
            }

            function stopSelected() {
                ids = getSelected();

                if (ids != false) {
                    window.location.href = docroot + '/stopscanmulti?ids=' + ids.join(',');
                }
            }

            function deleteSelected() {
                ids = getSelected();

                if (ids != false) {
                    window.location.href = docroot + '/scandeletemulti?ids=' + ids.join(',');
                }
            }

            function rerunSelected() {
                ids = getSelected();

                if (ids != false) {
                    window.location.href = docroot + '/rerunscanmulti?ids=' + ids.join(',');
                }
            }

            function exportSelected(type) {
                ids = getSelected();

                if (!ids) {
                    return;
                }

                $("#loader").show();
                var efr = document.getElementById('exportframe');
                switch(type) {
                    case "gexf":
                        efr.src = docroot + '/scanvizmulti?ids=' + ids.join(',');
                        break;
                    case "csv":
                        efr.src = docroot + '/scaneventresultexportmulti?ids=' + ids.join(',');
                        break;
                    case "json":
                        efr.src = docroot + '/scanexportjsonmulti?ids=' + ids.join(',');
                        break;
                    default:
                        console.log("Invalid export type");
                }
                $("#loader").fadeOut(500);
            }

            function reload() {
                $("#loader").show();
                showlist(globalTypes, globalFilter);
                return;
            }

            function showlist(types, filter) {
                globalTypes = types;
                globalFilter = filter;
                sf.fetchData(docroot + '/scanlist', null, function(data) {
                    if (data.length == 0) {
                        $("#loader").fadeOut(500);
                        welcome = "<div class='alert alert-info'>";
                        welcome += "<h4>No scan history</h4><br>";
                        welcome += "There is currently no history of previously run scans. Please click 'New Scan' to initiate a new scan."
                        welcome += "</div>";
                        $("#scancontent").append(welcome);
                        return;
                    }

                    showlisttable(types, filter, data)
                });
            }

            function showlisttable(types, filter, data) {
                if (filter == null) {
                    filter = "None";
                }
                var buttons = "<div class='btn-toolbar'>";
                buttons += "<div class='btn-group'>";
                buttons += "<button id='btn-filter' class='btn'><i class='icon-filter'></i>&nbsp;Filter: " + filter + "</button>";
                buttons += "<button class='btn dropdown-toggle' data-toggle='dropdown'><span class='caret'></span></button>";
                buttons += "<ul class='dropdown-menu'>";
                buttons += "<li><a href='javascript:filter(\"all\")'>None</a></li>";
                buttons += "<li><a href='javascript:filter(\"running\")'>Running</a></li>";
                buttons += "<li><a href='javascript:filter(\"finished\")'>Finished</a></li>";
                buttons += "<li><a href='javascript:filter(\"failed\")'>Failed/Aborted</a></li></ul>";
                buttons += "</div>";

                buttons += "<div class='btn-group pull-right'>";
                buttons += "<button rel='tooltip' data-title='Delete Selected' id='btn-delete' class='btn btn-danger'><i class='icon-trash icon-white'></i></button>";
                buttons += "</div>";

                buttons += "<div class='btn-group pull-right'>";
                buttons += "<button rel='tooltip' data-title='Refresh' id='btn-refresh' class='btn btn-success'><i class='icon-refresh icon-white'></i></a>";
                buttons += "<button rel='tooltip' data-title='Export Selected' id='btn-export' class='btn btn-success'><i class='icon-download-alt icon-white'></i></button>";
                buttons += "<button class='btn dropdown-toggle btn-success' data-toggle='dropdown'><span class='caret'></span></button>";
                buttons += "<ul class='dropdown-menu'>";
                buttons += "<li><a href='javascript:exportSelected(\"csv\")'>CSV</a></li>";
                buttons += "<li><a href='javascript:exportSelected(\"gexf\")'>GEXF</a></li>";
                buttons += "<li><a href='javascript:exportSelected(\"json\")'>JSON</a></li>";
                buttons += "</ul>";
                buttons += "</div>";

                buttons += "<div class='btn-group pull-right'>";
                buttons += "<button rel='tooltip' data-title='Re-run Selected' id='btn-rerun' class='btn btn-inverse'><i class='icon-repeat icon-white'></i></button>";
                buttons += "<button rel='tooltip' data-title='Stop Selected' id='btn-stop' class='btn btn-inverse'>";
                buttons += "<i class='icon-stop icon-white'></i></button>";
                buttons += "</div>";

                buttons += "</div>";
                var table = "<table id='scanlist' class='table table-bordered table-striped tablesorter'>";
                table += "<thead><tr><th class='text-center'><input id='checkall' type='checkbox'></th> <th>Name</th> <th>Target</th> <th>Started</th> <th >Finished</th> <th class='text-center'>Status</th> <th class='text-center'>Elements</th><th class='text-center'>Action</th> </tr></thead><tbody>";
                filtered = 0;
                for (var i = 0; i < data.length; i++) {
                    if (types != null && $.inArray(data[i][6], types)) {
                        filtered++;
                        continue;
                    }
                    table += "<tr><td class='text-center'><input type='checkbox' id='cb_" + data[i][0] + "'></td>"
                    table += "<td><a href=" + docroot + "/scaninfo?id=" + data[i][0] + ">" + data[i][1] + "</a></td>";
                    table += "<td>" + data[i][2] + "</td>";
                    table += "<td>" + data[i][3] + "</td>";
                    table += "<td>" + data[i][5] + "</td>";
                    if (data[i][6] == "FINISHED") {
                        statusy = "badge-success";
                    }
                    if (data[i][6].indexOf("ABORT") >= 0) {
                        statusy = "badge-warning";
                    }
                    if (data[i][6] == "RUNNING" || data[i][6] == "STARTED" || data[i][6] == "STARTING" || data[i][6] == "INITIALIZING") {
                        statusy = "badge-info";
                    }
                    if (data[i][6].indexOf("FAILED") >= 0) {
                        statusy = "badge-important";
                    }
                    table += "<td class='text-center'><span class='badge " + statusy + "'>" + data[i][6] + "</span></td>";
                    table += "<td class='text-center'>" + data[i][7] + "</td>";
                    table += "<td class='text-center'>";
                    if (data[i][6] == "RUNNING" || data[i][6] == "STARTING" || data[i][6] == "STARTED" || data[i][6] == "INITIALIZING") {
                        table += "<a rel='tooltip' title='Stop Scan' href=" + docroot + "/stopscan?id=" + data[i][0] +"><i class='icon-stop icon-gray' /></a>";
                    } else {
                        table += "<a rel='tooltip' title='Delete Scan' href=" + docroot + "/scandelete?id=" + data[i][0] + "><i class='icon-trash icon-gray' /></a>";
                        table += "&nbsp;&nbsp;<a rel='tooltip' title='Re-run Scan' href=" + docroot + "/rerunscan?id=" + data[i][0] + "><i class='icon-repeat icon-gray' /></a>";
                    }
                    table += "&nbsp;&nbsp;<a rel='tooltip' title='Clone Scan' href=" + docroot + "/clonescan?id=" + data[i][0] + "><i class='icon-plus-sign icon-gray' /></a>";
                    table += "</td></tr>";
                }
                footer = "<div>Total Scans: <b>" + i + "</b>";
                if (filtered > 0) {
                    footer += "&nbsp;&nbsp;(" + filtered + " filtered out)";
                }
                footer += "</div>";
                table += "</tbody></table>" + footer;
                $("#loader").fadeOut(500);
                $("#scancontent-wrapper").remove();
                $("#scancontent").append("<div id='scancontent-wrapper'> " + buttons + table + "</div>");
                sf.updateTooltips();
                $("#scanlist").tablesorter( { headers: { 7: { sorter: false }, 0: { sorter: false } } } );
                $("[class^=tooltip]").remove();

                $(document).ready(function() {
                    var chkboxes = $('input[id*=cb_]');
                    chkboxes.click(function(e) {
                        if(!lastChecked) {
                            lastChecked = this;
                            return;
                        }

                        if(e.shiftKey) {
                            var start = chkboxes.index(this);
                            var end = chkboxes.index(lastChecked);
    
                            chkboxes.slice(Math.min(start,end), Math.max(start,end)+ 1).prop('checked', lastChecked.checked);

                        }

                        lastChecked = this;
                    });

                    $("#btn-delete").click(function() { deleteSelected(); });
                    $("#btn-refresh").click(function() { reload(); });
                    $("#btn-rerun").click(function() { rerunSelected(); });
                    $("#btn-stop").click(function() { stopSelected(); });
                    $("#checkall").click(function() { switchSelectAll(); });
                });
            }

            showlist();
