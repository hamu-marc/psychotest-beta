var selectedTestDefinition;
var selectedTestName;
var selectedTestId;
var selectedTestAnswers;
var selectedTestScreennumber;

function getSelectedTest(item) {
    var selectedTest = item.value;
    getSelectedTestById(selectedTest);
    showPermanentLink();
}

function getSelectedProject(item) {
    var selectedTest = item.options[item.selectedIndex].value;
    getSelectedProjectById(selectedTest);
    showPermanentLink();
}

function getSelectedTestById(selectedTest) {
    $.getJSON(PsychoTestUrl + selectedTest, null, function (testdto) {
        //console.log('getselectedtest');
        //console.log(testdto);
        selectedTestDefinition = testdto[0].definition;
        selectedTestName = testdto[0].name;
        selectedTestId = testdto[0].id;
        showPermanentLink();
        //console.log(selectedTestDefinition);
        if (typeof editor !== "undefined") {
            editor.setValue(selectedTestDefinition);
            //editor.refresh();
        }
        // document.getElementById("saveAsField").value = testdto[0].name;
    });
}

function getSelectedProjectById(selectedTest) {
    $.getJSON(PsychoTestUrl + selectedTest, null, function (testdto) {
        //console.log('getselectedtest');
        //console.log(testdto);
        selectedTestDefinition = testdto[0].definition;
        selectedTestName = testdto[0].name;
        selectedTestId = testdto[0].id;
        showPermanentLink();
        //console.log(selectedTestDefinition);
        if (typeof projekteditor !== "undefined") {
            projekteditor.setValue(selectedTestDefinition);
            //editor.refresh();
        }
        // document.getElementById("saveAsField").value = testdto[0].name;
    });
}


function getSelectedPausedTest(item) {
    var selectedTest = item.value;
    getSelectedPausedTestById(selectedTest);
    showPermanentLink();
}

function getSelectedPausedTestById(selectedTest) {
    $.getJSON(PsychoTestPauseUrl + selectedTest, null, function (testdto) {
        //console.log('getselectedtest');
        //console.log(testdto);
        selectedTestDefinition = testdto.rawtestdefinition;
        selectedTestName = testdto.testname;
        selectedTestId = testdto.id;
        selectedTestAnswers = JSON.parse(testdto.temporalresults);
        selectedTestScreennumber = testdto.screennumber;
        showPermanentLink();
        //console.log(selectedTestDefinition);
        if (typeof editor !== "undefined") {
            editor.setValue(selectedTestDefinition);
            //editor.refresh();
        }
        // document.getElementById("saveAsField").value = testdto[0].name;
    });
}

function showPermanentLink() {
    if (document.getElementById("permanentlink"))
        document.getElementById("permanentlink").innerHTML = getTestPermanentHref();
}

function getTestPermanentHref() {
    //var items = row.trim().split(/[ ]+/);
    var editsuffix = document.location.pathname.length - "Editor_pages/Editor.aspx".length;
    var testpathname = document.location.pathname.slice(0, editsuffix).concat("psychotest.htm");

    var thisurl = document.location.origin + testpathname + "#" + encodeid(selectedTestId); //fix bug #294
    return '<i>Permanent link to this test: <a href="' + thisurl + '">' + thisurl + '</a></i>';
}
function getPausedTestPermanentHref(pid) {
    //var items = row.trim().split(/[ ]+/);
    var editsuffix = document.location.pathname.length - "Editor_pages/Editor.aspx".length;
    var testpathname = document.location.pathname.slice(0, editsuffix).concat("psychotest.htm");

    var thisurl = document.location.origin + testpathname + "#p" + encodeid(pid);//fix bug #294
    return '<a href="' + thisurl + '">' + thisurl + '</a></i>';
}
// var PausedTestPerUserURL = "../api//psychotestpausedperuser";
function updateTestList() {
    var username = document.getElementById('username') ? document.getElementById('username').value : "";
    //console.log(username);
    $.ajax({
        dataType: "json",
        url: PsychoTestUrl,//+"?loginname="+username,
        //headers: { "username": username },
        success: function (data) {
            
            /*$('#models > option').remove();
            //console.log("updatetestlist");
            //console.log(data);
            if (data.length>0){
                $('#models').show();
                data.forEach(function (item) {
                $('#models').append("<option value='" + item.id + "'>" + item.name + "</option>");
                });
            }else{
                $('#models').hide();
            }*/
            $('#tests').empty();
            console.log("updatetestlist");
            console.log(data);
            if (data.length > 0) {
                data.reverse(); //reverse the order of tests, oldest last, newest first
                //$('#models').show();
                data.forEach(function (item) {
                    $('#tests').append("<button class ='w3-btn w3-btn-block w3-left-align w3-hover-light-blue' onclick='getSelectedTest(this); focusTest();' value='" + item.id + "'>" + item.name + "</button>");
                });
            }
        }
    });
    //get paused tests only for logged in users
    if (username && (username.length>0)) $.ajax({
        dataType: "json",
        url: PausedTestPerUserURL,//+username,
        //headers: { "username": username },
        success: function (data) {
            $('#pausedtests > option').remove();
            console.log("updatetestlist");
            console.log(data);
            /*if (data.length>0) {
                $('#pausedtests').show();
                data.forEach(function (item) {
                    $('#pausedtests').append("<option value='" + item.id + "'>" + item.psychotestname + " (" + item.screennumber + ") " + "</option>");
                });
            } else {
                $('#pausedtests').hide();

            }*/
            if (data.length > 0) {
                data.reverse(); //reverse the order of tests, oldest last, newest first
                data.forEach(function (item) {
                    $('#tests').append("<button class ='w3-btn w3-btn-block w3-left-align w3-hover-light-blue' onclick='getSelectedPausedTest(this); focusResumeTest();' value='" + item.id + "'>" + item.psychotestname + " (paused on screen " + item.screennumber + ") " + "</button>");
                });
            }
        },
        error: function (data) {
            console.log("error");
            console.log(data);

        }
    });
    //check of existence - editor has defined this variable
    if (typeof PsychoTestStimuliUrl !== "undefined" )
    $.ajax({
        dataType: "json",
        url: PsychoTestStimuliUrl,//+"?loginname="+username,
        //headers: { "username": username },
        success: function (data) {
            $('#stimuligroup > option').remove();
            //console.log("updatetestlist");
            //console.log(data);
            data.forEach(function (item) {
                $('#stimuligroup').append("<option value='" + item.id + "'>" + item.name + "</option>");
            });
        }
    });
    /*$.getJSON(PsychoTestUrl, null, function (data) {
        $('#models > option').remove();
        //console.log("updatetestlist");
        //console.log(data);
        data.forEach(function (item) {
            $('#models').append("<option value='" + item.id + "'>" + item.name + "</option>");
        });
    });*/
}

function updatePausedList() {
 $.ajax({
        dataType: "json",
        url: AllPausedTestURL,//+username,
        headers: { "username": username },
        success: function (data) {
            $('#pausedtests > li').remove();
            console.log("updatepauselist");
            console.log(data);
            if (data.length>0) {
                $('#pausedtests').show();
                data.forEach(function (item) {
                    $('#pausedtests').append("<li>"+ item.psychotestname + " at screen " + item.screennumber + ". User:"+item.psychotestaccountName+ "<br /> URL: " +getPausedTestPermanentHref(item.id)+ "</li>");
                });
            } else {
                $('#pausedtests').hide();
            }
        },
        error: function (data) {
            console.log("error");
            console.log(data);

        }
    });

}

function updateProjectList() {
    var username = document.getElementById('loginname') ? document.getElementById('loginname').value : "";
    $.ajax({
        dataType: "json",
        url: PsychoTestProjectUrl,
        headers: { "username": username },
        success: function (data) {
            $('#projects > option').remove();
            //console.log("updatetestlist");
            //console.log(data);
            data.forEach(function (item) {
                $('#projects').append("<option value='" + item.id + "'>" + item.name + "</option>");
            });
        }
    });
    /*$.getJSON(PsychoTestUrl, null, function (data) {
        $('#models > option').remove();
        //console.log("updatetestlist");
        //console.log(data);
        data.forEach(function (item) {
            $('#models').append("<option value='" + item.id + "'>" + item.name + "</option>");
        });
    });*/
}

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function insertSelectedSounds(groupid,soundid) {
    //console.log("selected", item);
    var item = document.getElementById(soundid);

    var replacement = "";
    var from = editor.doc.getCursor();
    //indent each row as the cursor position
    var indent = Array(from.ch + 1).join(" ");
    for (var i = 0; i < item.selectedOptions.length; i++)
        if (item.selectedOptions[i].value.contains(" ")) //the space in stimulus name is quoted
            replacement += "stimulus \"" + item.selectedOptions[i].value + "\"\n" + indent;
        else
            replacement += "stimulus " + item.selectedOptions[i].value + "\n" + indent;

    editor.doc.replaceRange(replacement,from)
    //var selectedTest = item.options[item.selectedIndex].value;
}

function insertSelectedSoundsInRow(groupid, soundid) {
    //console.log("selected", item);
    var item = document.getElementById(soundid);
    var replacement = "";
    var from = editor.doc.getCursor();
    //indent each row as the cursor position
    var indent = Array(from.ch + 1).join(" ");
    replacement += "stimulus ";
    for (var i = 0; i < item.selectedOptions.length; i++)
        if (item.selectedOptions[i].value.contains(" ")) //the space in stimulus name is quoted
            replacement += "\"" + item.selectedOptions[i].value + "\" ";
        else
            replacement += item.selectedOptions[i].value + " ";
     replacement+="\n"+ indent;
    editor.doc.replaceRange(replacement, from)
    //var selectedTest = item.options[item.selectedIndex].value;
}

function updateSoundList(id, groupid) {
    var url = SoundsUrl;
    if (typeof groupid !== "undefined") url += groupid;
    $.getJSON(url, null, function(data) {
        $('#' + id + ' > option').remove();
        //console.log("updatesoundlist");
        //console.log(data);
        data.forEach(function (item) {
            var stimulname = item.substr(item.lastIndexOf('/')); //show only filename without group/path
            if (stimulname.startsWith('/')) stimulname = stimulname.substr(1);
            $('#'+id).append("<option value='" + item + "'>" + stimulname + "</option>");
        });
    });
}

function updateGroupSoundList(id) {
    $.getJSON(SoundGroupsUrl, null, function (data) {
        updateHTMLGroupList(id, data);
    });
}

function updateHTMLGroupList(id, data) {
    $('#' + id + ' > option').remove();
    $('#' + id).append("<option value='.'>" + "." + "</option>");
    //console.log("updatesoundlist");
    //console.log(data);
    data.forEach(function (item) {
        $('#' + id).append("<option value='" + item + "'>" + item + "</option>");
    });
}

function getSelectedGroup(item,soundid) {
    var selectedGroup = item.options[item.selectedIndex].value;
    //getSelectedTestById(selectedGroup);
    updateSoundList(soundid, selectedGroup);
}


function uploadSoundsForm(groupid) {
    var item = document.getElementById(groupid);
    var selectedGroup = ".";
    try {
        selectedGroup = item.options[item.selectedIndex].value;
    } catch (e) {
//no group selected, default is '.'
    }
    if (selectedGroup === ".") window.open("UploadSound.aspx", "uploadsound", "width=300,height=300,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0");
    else window.open("UploadSound.aspx?group=" + selectedGroup, "uploadsound", "width=300,height=300,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0");
}

function createGroup(id1,id2) {
    var groupname = prompt("Jméno nové skupiny stimulů");
    if (groupname.length>0)
    $.ajax({
        type: "PUT",
        url: SoundGroupsUrl+groupname,
        contentType: 'application/json',
        processData: false,
        success: function (data) {
            console.log("created. Response:");
            console.log(data);
            if (typeof id1 !== "undefined") updateHTMLGroupList(id1, data);
            if (typeof id2 !== "undefined") updateHTMLGroupList(id2, data);

        },
        error: function (data) {
            console.log("error:" + data.toSource());
        }
    });

}
function deleteGroup(id1, id2) {
    var item = document.getElementById(id1);
    var selectedGroup = item.options[item.selectedIndex].value;
    if (selectedGroup !== "." )
        $.ajax({
            type: "DELETE",
            url: SoundGroupsUrl + selectedGroup,
            contentType: 'application/json',
            processData: false,
            success: function (data) {
                console.log("created. Response:");
                console.log(data);
                if (typeof id1 !== "undefined") updateHTMLGroupList(id1, data);
                if (typeof id2 !== "undefined") updateHTMLGroupList(id2, data);
            },
            error: function (data) {
                console.log("error:" + data.toSource());
            }
        });
}

function createNewTest(editor){
    if (typeof editor !== "undefined") {
        editor.setValue("test [testname]\n");
        editor.focus();
        //editor.refresh();
    }
}

function createNewStimuliGroup(editor){
    if (typeof editor !== "undefined") {
        editor.setValue("stimuligroup [stimuliname]\n");
        editor.focus();
        //editor.refresh();
    }
}

//encoding using multiplicative inverse if (x * y) % m == 1, then (x * z * y) % m == z % m for any positive integer z
//x=387419, y=708179, m=1000000, http://stackoverflow.com/questions/8554286/obfuscating-an-id
function encodeid(did) {
    //console.log("encodeid:" + did);
    var idid = parseInt(did) * 387419 % 1000000;
    //console.log('encoded:' + idid);
    return idid.toString();
}

function decodeid(did) {
    //console.log("decodeid:" + did);
    var idid = parseInt(did) * 708179 % 1000000;
    //console.log('decoded:' + idid);
    return idid.toString();
}