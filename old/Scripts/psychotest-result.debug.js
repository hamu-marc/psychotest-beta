/// <reference path="jquery-1.9.1.js" />
/// <reference path="jquery.handsontable.full.js" />

//add contains function to String
if (typeof String.prototype.contains === 'undefined') { String.prototype.contains = function (it) { return this.indexOf(it) != -1; }; }

function getSelectedResult(item) {
    updateResultTable(item.value,"resultTable");
}

function updateResultList() {
    $.getJSON(PsychoResultUrl, null, function (data) {
        //console.log("updateResultList()");
        //console.log(data);*/
        $('#results > option').remove();
        data.reverse(); //get the newest data as the first one
        data.forEach(function (item) {
            $('#results').append("<option value='" + item.name + "'>" + item.name + "</option>");
        });
    });
}


function updateResultTable(resultname,resultid) {
    if (!document.getElementById(resultid)) return;
    var resultnameescaped = encodeURIComponent(resultname); //fix bug #279
    $.getJSON(PsychoResultUrl+resultnameescaped, null, function (data2) {
        data = [];
        //data.push(["id", "test", "respondent", "case", "task", "odpověď"]);
        var maxrow = 0;
        data2.reverse();
        data2.forEach(function (item) {           
            item.resultItems.forEach(function (subitem) {
                //subitem.replace(/({)([a-zA-Z0-9]+)(:)([a-zA-Z0-9\.\/])/,'$1"$2"$3')
                //var tempsubitem = subitem.replace(/({)([^:]+)(:)([^,]*)(,)([^:]+)(:)([^,]*)(,)([^:]+)(:)([^,]*)(,)([^:]+)(:)([^}]*)(})/, '$1"$2"$3"$4"$5"$6"$7"$8"$9"$10"$11"$12"$13"$14"$15"$16"$17');
                //var tempsubitem = subitem.replace(/({)([^:]+)(:)([^,]*)(,)([^:]+)(:)([^,]*)(,)([^:]+)(:)([^}]*)(})/, '$1"$2"$3"$4"$5"$6"$7"$8"$9"$10"$11"$12"$13"$14');
                //corect mallformed JSON - add quotes to the key
                //fix bug -- items not in table columns
                //var tempsubitem = subitem.replace(/\"/, '\\"');

                /*subitem.replace(({|,)([^:]+)(:)([^,}]*)/g, '$1"$2"$3"$4"');
                //var objKeysRegex = /({|,)(?:\s*)(?:')?([A-Za-z0-9_ \-\.$]*)(?:')?(?:\s*):({|,)(?:\s*)(?:')?([A-Za-z0-9_ \-\.$]*)(?:')?(?:\s*)/g;// look for object names
                //var tempsubitem = subitem.replace(objKeysRegex, "$1\"$2\":$3\"$4");// all object names should be double quoted
                */
                var newitem = [];
                
                newitem.push(item.id);
                newitem.push(item.name);
                newitem.push(item.user);

                //fix bug #245
                newitem.push(subValue(subitem, "case:", "question:"));
                newitem.push(subValue(subitem, "question:", "answer:"));
                newitem.push(subValue(subitem, "answer:", "date:"));
                if (subitem.contains('note:')) {
                    newitem.push(subValue(subitem, "date:", "note:"));
                    newitem.push(subValue(subitem, "note:", "}"));
                }else
                newitem.push(subValue(subitem, "date:", "}"));
                /*
                try { //parsing JSON may throw exception if malformed JSON 
                    var resultcase = JSON.parse(tempsubitem);// ...//eval('(' + subitem + ')');
                    if ("case" in resultcase) newitem.push(resultcase.case);
                    if ("question" in resultcase) newitem.push(resultcase.question);
                    if ("answer" in resultcase) newitem.push(resultcase.answer);
                    if ("date" in resultcase) newitem.push(resultcase.date);
                } catch (exc)
                { //add the raw data into the table
                    newitem.push(subitem);
                }*/
                if (maxrow < newitem.length) maxrow = newitem.length;
                data.push(newitem);
            });
        });
        //add empty last row
        newitem = [];
        
        for (var i = 0; i < maxrow; i++) newitem.push("");
        data.push(newitem);        
        //console.log("updateResultTable()");
        //console.log(data);
        //console.log(data2);
        exportCSVData(data,resultname);
        $("#"+resultid).handsontable({
            data: data,

            colHeaders: ["id", "test","respondent","case","task","answer","date","note"],
            rowHeaders: true,
            currentRowClassName: 'currentRow',
            currentColClassName: 'currentCol',
            minSpareRows: 1,
            minSpareCols: 1,
            fillHandle: true,
            contextMenu: ['row_above', 'row_below', 'remove_row', 'col_left', 'col_right', 'remove_col']
        });
    });
}

function exportCSVData(rawdata,resultname) {
    if (!document.getElementById('resultcsv')) return;
    var csvdata = '';
    for (var i = 0; i <rawdata.length; i++) {
        var sep = '';
        for (var j = 0; j < rawdata[i].length; j++) {
            //if (rawdata[i][j].contains(','))
            //var item = ;
            if (rawdata[i][j].replace)
                csvdata += sep + '"' + rawdata[i][j].replace(/"/g,'""') + '"'; //quote and escape quotes in item
            else
                csvdata += sep + rawdata[i][j];
            //else
            //csvdata += sep + rawdata[i][j];//document.getElementById(i + '_' + j).value;
            sep = ',';
        }
        csvdata += '\r\n';
    }
    var exportLink = document.createElement('a');
    exportLink.setAttribute('href', 'data:text/csv;base64,' + window.btoa(unescape(encodeURI(csvdata))));
    exportLink.setAttribute('download', 'results-'+resultname+'.csv');
    exportLink.appendChild(document.createTextNode('results.csv'));
    $('#resultcsv > a').remove();//document.getElementById('resultcsv').removeChild();
    document.getElementById('resultcsv').appendChild(exportLink);
}

//returns subvalue in str between json starttag and endtag
function subValue(str, starttag, endtag) {
    var si = str.search(starttag);
    var fi = str.search(endtag);
    //tag not found - no value
    if (si < 0) return "";
    //tag found, next tag not found - all except last character which is usually '}' in json
    if (fi < si) return str.substring(si + starttag.length, str.length - 1);
    //tag and next tag found, return all between except last character which is usually ',' in json
    if (endtag === '}') return str.substring(si + starttag.length, fi);//fix? bug fi-1
    return str.substring(si + starttag.length, fi - 1);//fix? bug fi-1
}

function RepairJSONResultItem(subitem) {

    var jsonitem = {};
    jsonitem.case = subValue(subitem, "case:", "question:");
    jsonitem.question = subValue(subitem, "question:", "answer:");
    jsonitem.answer = subValue(subitem, "answer:", "date:");
    if (subitem.contains("note:")) {
        jsonitem.date = subValue(subitem, "date:", "note:");
        jsonitem.note = subValue(subitem, "note:", "}");
    } else {
        jsonitem.date = subValue(subitem, "date:", "}");
        jsonitem.note = "";
    }
    return jsonitem;
}