//returns test name or project name just after "test" "project" keyword
function getTestName(testdef) {
    var rows = testdef.split('\n');
    var rowitems = rows[0].split(" ");
    var name = rowitems[1];
    console.log("jmeno testu:" + name);
    return name;
}

function postEditedTest(editor) {
    console.log('posteditedtest');
    //console.log(document.getElementById('saveAsField'));
    var definition = editor.getValue();
    var testName = getTestName(definition);
    var newTest; //= { name: testName, definition: definition };
    //fix bug - on save new test instead of update
    var loggeduser = document.getElementById('loginname');
    if ((testName === selectedTestName) && (selectedTestId)) newTest = { id: selectedTestId, name: testName, definition: definition, owner: loggeduser }//update
    else newTest = { name: testName, definition: definition,owner: loggeduser};
    //console.log(newTest);
    $.ajax({
        type: "POST",
        url: PsychoTestUrl,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(newTest),
        processData: false,
        success: function (data) {

            console.log("saved. Response:");
            console.log(data);
            selectedTestId = data.hasOwnProperty('Id') ? data.id : "0"; //declared in psychotest-select.js
            showPermanentLink();
            updateTestList();
            updateProjectList();
        },
        error: function (data) {
            console.log("error:" + data.toSource());
        }
    });
}

var globaleduid = {id:0,name:"",user:""};
function editEduMode(editor) {
    var definition = editor.getValue();
    if (definition.contains("type educational(")) {
        //get table of edu results
        var eduid = definition.match(/type educational\(([\d]+)\)/)[1];
        updateEduMode(eduid);
        globaleduid.id = eduid;
    } else {
        //create new table
        if (confirm("New educational table will be created")) {
            createnewedu(definition);
        }
    }
    //globaleduid.id = 0;
}

function createnewedu(definition) {
    //go rhtough test definition, fake going will generate empty answers
    traversetest(definition,edudataCallbackAddRow,postAnswerErrorCallback);
    //save empty answers -- will generate eduid which will be returned.
}

function saveEduMode() {
    if (globaleduid.id > 0) {
        //preparedata
        var eduResults = {};
        var testUser = document.getElementById('loginname') ? document.getElementById('loginname').value : "administrator";
        globaleduid.resultItems = [];
        var edudataraw = $("#eduTable").handsontable('getData');
        var edurow = {};
        edudataraw.forEach(function(item) {
            if (item[0]) {
                edurow = { case: item[0], question: item[1], answer: item[2], date:new Date(),note: item[3] }
                if (item[0].length > 0) globaleduid.resultItems.push(edurow);
            }
        });
        console.log(globaleduid);
        //postdata
        $.ajax({
            type: "PUT",
            url: PsychoResultUrl+"/"+globaleduid.id,
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(globaleduid),
            processData: false,
            success: function (data) {
                //console.log("saved. Response:");
                //console.log(data);
                //updateResultList();
                //initializeAll();
            },
            error: function (data) {
                console.log("error:");
                console.log(data);
                alert("Při ukládání výsledků doslo k chybe.");
            }
        });

    }
}

function edudataCallbackAddRow(data2){
    edudataCallback(data2);
    addTypeEduRow();
}

function edudataCallback(data2) {
    var data = [];
    var maxrow = 0;

    function parsedataitem(item) {

        if (item.hasOwnProperty('resultItems'))
        item.resultItems.forEach(function (subitem) {
            var newitem = [];
            globaleduid.id = item.id;
            globaleduid.name = item.name;
            globaleduid.user = item.user;

            newitem.push(subValue(subitem, "case:", "question:"));
            newitem.push(subValue(subitem, "question:", "answer:"));
            newitem.push(subValue(subitem, "answer:", "date:"));
            if (subitem.contains('note:')) {
                newitem.push(subValue(subitem, "note:", "}"));
            } else
                newitem.push("");//subValue(subitem, "date:", "}"));
            if (maxrow < newitem.length) maxrow = newitem.length;
            if (newitem[0].length>0 || newitem[3].length>0) data.push(newitem); //at least case or answer is defined - put in data table
        });
    }

    if (data2.length) //if it is array, parse data for each item
    {
        data2.forEach(parsedataitem);

    } else parsedataitem(data2); //otherwise only parse the one item
    //add empty last row
    newitem = [];

    for (var i = 0; i < maxrow; i++) newitem.push("");
    data.push(newitem);
    //console.log("updateResultTable()");
    //console.log(data);
    //console.log(data2);
    //exportCSVData(data);

    $("#eduTable").handsontable({
        data: data,

        colHeaders: ["case", "task", "answer", "note"],
        rowHeaders: true,
        currentRowClassName: 'currentRow',
        currentColClassName: 'currentCol',
        minSpareRows: 1,
        minSpareCols: 1,
        fillHandle: true,
        contextMenu: ['row_above', 'row_below', 'remove_row', 'col_left', 'col_right', 'remove_col']
    });
}

function addTypeEduRow(){
    var replacement = "  type educational("+globaleduid.id+")\n";
    var from = editor.doc.getCursor();
    editor.doc.replaceRange(replacement, from);
    //updateEduMode(eduid);
}

//var edutable;
function updateEduMode(eduid) {
    //read data from eduid
    //var resultid = "eduTable";
    if (!document.getElementById("eduTable")) return;
    $.getJSON(PsychoResultIdUrl + eduid, null, edudataCallback);
}
    //fill table with eduid data
    //updateResultTable(eduid, "eduTable");



function deleteEditedTest(editor) {
    console.log('posteditedtest');
    var definition = editor.getValue();

    var testName = getTestName(definition);
    //var newTest = { name: testName };
    //console.log(newTest);
    $.ajax({
        type: "DELETE",
        url: PsychoTestUrl + selectedTestId,
        contentType: 'application/json',
        dataType: 'json',
        //data: JSON.stringify(newTest),
        processData: false,
        success: function (data) {
            console.log("deleted. Response:");
            console.log(data);
            updateTestList();
        },
        error: function (data) {
            console.log("error:"); // + data.toSource());
            console.log(data);
        }
    });
}
