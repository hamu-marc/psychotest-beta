
/*
Main scripts to interpret DSL for psychoacoustic and educational tests and surveys
 */
var parser;// = new Interpreter();

function starttest() {
    $("#tab2help").hide();//.fadeOut(500); TODO html specific
    var currentRawTest = selectedTestDefinition;
    if (typeof editor !== "undefined") currentRawTest = editor.getValue();
    parser = new Interpreter();
    parser.initTest(currentRawTest);
    hideNonAnswered();
    document.getElementById('preview').innerHTML = nextpage();//parser.currentTest);
    //console.log(document.getElementById('preview').innerHTML);
    evaluateScripts();
}

function resumetest() {
    $("#tab2help").hide();//.fadeOut(500); TODO html specific
    //var currentRawTest = selectedTestDefinition;
    //if (typeof editor !== "undefined") currentRawTest = editor.getValue();
    parser = new Interpreter();
    parser.resumeTest(selectedTestDefinition,selectedTestScreennumber,selectedTestAnswers,selectedTestId);
    hideNonAnswered();
    document.getElementById('preview').innerHTML = nextpage();//parser.currentTest);
    //console.log(document.getElementById('preview').innerHTML);
    evaluateScripts();
}

//switches hidden or visible style of button or other html element
function switchvisibility(allow, bid) {
    var item = document.getElementById(bid);
    if (item) {
        if (allow) item.style.visibility = 'visible';
        else item.style.visibility = 'hidden';
    }
}

function nextpage() {
    var testDSL = parser.currentTest;
    parser.currentPage++;
    parser.questionPage = 0;
    parser.stimul.audioid = 0; //reset audioid
    //console.log(currentPage);
    if (parser.currentPage == parser.maxPages) { //show only stop button at the end of test
//        document.getElementById('start').style.visibility = 'hidden';
//        document.getElementById('next').style.visibility = 'hidden';
//        document.getElementById('stop').style.visibility = 'visible';
        switchvisibility(false,'start');
        switchvisibility(false,'resume');
        switchvisibility(false,'next2');
        switchvisibility(true,'stop2');
        switchvisibility(false,'pause2');
        if (parser.currentPage > 1) {
            switchvisibility(parser.allowprev, 'previous');
            switchvisibility(parser.allowprev, 'previous2');
        }
    } else
    if (parser.currentPage == 1) { //show next button in the begining
//            document.getElementById('start').style.visibility = 'hidden';
//            document.getElementById('next').style.visibility = 'visible';
//            switchvisibility(false, 'previous');
//            document.getElementById('stop').style.visibility = 'hidden';
        switchvisibility(false,"start");
        switchvisibility(false,'resume');
        switchvisibility(false,"pause2");
        switchvisibility(true,'next2');
        switchvisibility(false, 'previous2');
        switchvisibility(false,'stop2');
    } else { //show next and previous otherwise
//            document.getElementById('next').style.visibility = 'visible';
//            switchvisibility(allowprev, 'previous');
        switchvisibility(false,'resume');
        switchvisibility(true,'next2');
        switchvisibility(parser.allowprev, 'previous2');
        switchvisibility(true,'pause2');
    }
    var translatedheader = "";

    var splitted = testDSL.split("\n");
    //go from cursor to the first "screen" which will be start of interpretation
    while ((parser.currentCursor < splitted.length) && (!isObrazovka(splitted[parser.currentCursor]))) parser.currentCursor++;

    //translate obrazovka row
    if (parser.currentCursor < splitted.length) {
        translatedheader += parser.translateObrazovka(splitted[parser.currentCursor]);
        parser.currentCursor++;
    }

    //interpret everything until next 'obrazovka or end'
    while ((parser.currentCursor < splitted.length) && (!isObrazovka(splitted[parser.currentCursor]))) {
        translatedheader += parser.translateTestItems(splitted[parser.currentCursor]);
        parser.currentCursor++;
    }
    //console.log("translated 0:" + translatedheader);
    translatedheader += parser.closeOtazka(); //close open questions without values
    translatedheader += parser.closeSloupce();

    translatedheader += parser.stimul.closeQuestionDiv();
    translatedheader += parser.footerPageNumber();
    //console.log("translated:" + translatedheader);
    return translatedheader;
}

function traversetest(definition,callback,errorcallback) {
    parser.initTest(definition);
    while (parser.currentPage<parser.maxPages) nextpage();
    //evaluateScripts(); //there are no scripts, only innerhtml
    postAnswers(callback,errorcallback);
}

function cleartest() {
    document.getElementById('preview').innerHTML = "";
    showButtonsStart();
}

function previoustestitem() {
    parser.findPreviousObrazovka(parser.currentTest);
    document.getElementById('preview').innerHTML = nextpage();
    evaluateScripts();
}

//TODO violation of separation, mixed parser-interpreter and content
function checkAnswersInScreen() {
    var foundNA = false;
    var item;
    if (parser.result.answers[parser.currentPage - 1])
        for (var i=0;i<parser.result.answers[parser.currentPage-1].length;i++) {

            if (parser.result.answers[parser.currentPage - 1][i] && parser.result.answers[parser.currentPage - 1][i].answer)
                if (parser.result.answers[parser.currentPage - 1][i].answer === "N/A") {
                    //highlight - parser.result

                    item = $('#q' + parser.currentPage + '\\.' + (i + 1) + ">fieldset");//document.getElementById('q' + parser.currentPage + '.' + (i + 1));
                    if (!item.length) item = $('#q' + parser.currentPage + '\\.' + (i + 1));
                    //if (item.length)
                    item.css("background-color", "#ffdddd");
                    foundNA = true;
                } else {
                    item = $('#q' + parser.currentPage + '\\.' + (i + 1) + ">fieldset");//document.getElementById('q' + parser.currentPage + '.' + (i + 1));
                    if (!item.length) item = $('#q' + parser.currentPage + '\\.' + (i + 1));
                    if (item.length) item.css("background-color","#ffffff");
                    //if (item) item.style.backgroundColor = "#ffffff";
                }
        }
    return foundNA;
}


/* returns true if all questions are answered, false if at least one answer is not*/
function checkAnswers() {
    //for each answers[pagenum-1] answer!= N/A
    //var foundNA = false;
    var dontcheckanswers = $('#dontcheckanswers');
    if (dontcheckanswers.length && dontcheckanswers.prop('checked')) return true; //don't check in editor mode
    var foundNA = checkAnswersInScreen();
    return !foundNA;
}

function highlightNonAnswered() {
    var item = $("#notification");
    item.css("background-color","#fdd");
    item.html(" Pro pokračování, prosím, vyplňte vyznačené otázky!");
}

function hideNonAnswered() {
    document.getElementById('notification').innerHTML = "";
}

function nexttestitem() {
    if (checkAnswers()) { //check whether all mandatory questions are answered - set to non-default value
        if (highlightEducation()) {
            document.getElementById('preview').innerHTML = nextpage();
            parser.highlighted = false;
            evaluateScripts();
            hideNonAnswered();
        } else {
            //not highlighted
        }
    } else {
        highlightNonAnswered();
    }
}

function highlightEducation() {
    var atleastoneeduanswer = false;
    if (parser.educational) {
        if (! parser.result.answers[parser.currentPage - 1]) return true;
        if (parser.highlighted) {
            document.getElementById('notification').innerHTML = "";
            return true;
        }
        parser.highlighted = true;
        if (parser.result.answers[parser.currentPage - 1]){
            for (var i = 0; i < parser.result.answers[parser.currentPage - 1].length; i++) {
                if (parser.result.answers[parser.currentPage - 1][i] && ("answer" in parser.result.answers[parser.currentPage - 1][i])) {//fix bug 268
                    var item = $("#q" + parser.currentPage + "\\." + (i + 1)); //document.getElementById('q' + currentPage + '.' + (i + 1));
                    //disable editing the subelement within this form
                    item.find("input").prop("disabled", true);
                    item.find("option").prop("disabled", true);
                    item.find(".ui-slider").labeledslider("disable");

                    //console.log("#q" + currentPage + "\\." + (i + 1));
                    //if (item) item.style.backgroundColor = "#eeffee";
                    var aquestion = parser.result.answers[parser.currentPage - 1][i].question.trim();
                    var acase = parser.result.answers[parser.currentPage - 1][i].case;
                    var answer = parser.result.answers[parser.currentPage - 1][i].answer;
                    //var myeduanswer;
                    if (parser.eduresults[acase]) {
                        var myeduanswer = parser.eduresults[acase].answer[aquestion];
                        console.log("eduanswer");
                        console.log(parser.eduresults[acase]);
                        console.log("'" + aquestion + "'");
                        console.log(Object.keys(parser.eduresults[acase].answer));
                        console.log(myeduanswer);
                        if (myeduanswer) {
                            atleastoneeduanswer = true;
                            //creating tooltip div
                            $("<div class='tooltipContent'>" + parser.eduresults[acase].note[aquestion] + "</div>").appendTo(item);
                            //adding tooltip class to the form
                            item.addClass("tooltip");
                            //process all eduanswers;
                            var eduanswermulti = myeduanswer.split(';'); //show multiple values delimited by ;
                            eduanswermulti.forEach(function(eduanswer) {
                                var hitem = item.find("[value|='" + eduanswer + "']"); //selects <input>
                                if (hitem.length > 0) {
                                    var nexthitem = hitem.next(); //selects related <label>
                                    //console.log("item:" + item.prop('nodeName') + " hitem:" + hitem.prop('nodeName') + " nexthitem:" + nexthitem.prop('nodeName'));

                                    if (nexthitem.is("label"))
                                        nexthitem.attr("style", "background-color: lightgreen");
                                    else if (hitem.is("option"))
                                        hitem.attr("style", "background-color: lightgreen;border:solid 2px green");
                                } else { // show in slider handle
                                    hitem = item.find(".ui-slider");
                                    if (hitem.length > 0) {
                                        //var idhitem = hitem.prop("id");
                                        var currentvalue = hitem.labeledslider("value"); //keep current value
                                        var sliderid = hitem.prop("id");
                                        var slidernum = parseInt(Interpreter.extract("slider"));
                                        var eduanswerint = parseInt(eduanswer);
                                        var eduanswerindex = parser.sliderValues[slidernum].indexOf(eduanswerint);
                                        //moves slider handle to educational value
                                        if (eduanswerindex > -1) //move to edu value from sequence
                                        {
                                            //console.log("slidervalue:" + sliderValues[slidernum][eduanswerindex]);
                                            hitem.labeledslider("value", parser.sliderValues[slidernum][eduanswerindex]);
                                        } else //move to edu value
                                        {
                                            //console.log("normal value:" + eduanswerint);
                                            hitem.labeledslider("value", eduanswerint); //move to edu value
                                        }
                                        //var handle = item.find(".ui-slider-handle");
                                        var oldhandle = hitem.find(".ui-slider-handle");
                                        var newhandle = hitem.find(".ui-slider-handle").clone(); //.appendTo(hitem); //clone the handle
                                        //slider already has some style - position, whihc must be preserved
                                        hitem.labeledslider("value", currentvalue); //return to current value - the clone will remain on the edu value
                                        var oldstyle = oldhandle.attr("style") + "border:solid 2px blue;";
                                        var newstyle = newhandle.attr("style") + "background:lightgreen;";
                                        newhandle.attr("style", newstyle);
                                        oldhandle.attr("style", oldstyle);
                                        hitem.labeledslider("disable");
                                        newhandle.appendTo(hitem);
                                        //hitem.find(".ui-slider-handle").last().attr("style", "background:green");
                                    } else {
                                        //select

                                    }
                                }
                            });
                        }
                    }
                }
            }
            //allanswers highlighted, enable tooltip
            $(".tooltip").hover(function () {
                var tooltip = $("> div", this).show();
                var pos = tooltip.offset();
                tooltip.hide();
                var right = pos.left + tooltip.width();
                var pageWidth = $(document).width();
                if (pos.left < 0) {
                    tooltip.css("marginLeft", "+=" + (-pos.left) + "px");
                }
                else if (right > pageWidth) {
                    tooltip.css("marginLeft", "-=" + (right - pageWidth));
                }
                tooltip.fadeIn();
            }, function () {
                $("> div", this).fadeOut(function () { $(this).css("marginLeft", ""); });
            });
        }
        if (atleastoneeduanswer) {
            var item2 = $("#notification");
            item2.css("background-color","lightgreen");
            item2.html("Vyznačeny jsou průměrné, nejvíce vybírané hodnoty na uvedené otázky.");
        } else parser.highlighted = false;
    return (!atleastoneeduanswer);
    } else {
        return true;
    }
}

function showButtonsStart() {
    switchvisibility(true,"start");
    ["next2","previous2","stop2"].forEach(function(item){switchvisibility(false,item);});
}

function postAnswerCallback(data) {
    console.log("saved. Response:");
    console.log(data);
    //OK to delete resume
    if (parser.resumeid>0) {
        $.ajax({
            type:"DELETE",
            url:PsychoTestPauseUrl+parser.resumeid,
            contentType: 'application/json',
            dataType: 'json',
            success: function (data) { parser.resumeid=0;},//pausetestcallback,
            error: function (data){console.log("error during deleting paused test"); console.log(data);}//postAnswerErrorCallback
        })
    }
        updateResultList();
    //initializeAll();
}

function postAnswerErrorCallback(data){
    console.log("error:");
    console.log(data);
    if (!localStorage.psychoTestIndex) {
        localStorage.psychoTestIndex = 0;
    } else {
        localStorage.psychoTestIndex++;
    }
    if (!localStorage.psychoTestResults) localStorage.psychoTestResults = [];
    localStorage.psychoTestResults[localStorage.psychoTestIndex] = JSON.stringify(parser.result.answers);
    alert("Při ukládání výsledků tohoto testu došlo k chybě. Výsledky uloženy dočasně lokálně. Budou moci být odeslány po vyzvání administrátora.");
}

function postAnswers(callback,errorcallback) {
    var answers2 = [];
    parser.result.answers.forEach(function (item) {
        //console.log(item);
        if (item)
        item.forEach(function (subitem) {
            if (subitem.hasOwnProperty('checkedvalues')) delete subitem.checkedvalues;
            answers2.push(subitem);
        });

    });
    var testUser = document.getElementById('loginname') ? document.getElementById('loginname').value : "administrator";
    var testResult = {name: parser.testName, user: testUser, resultItems: answers2};

    //console.log(testResult);
    $.ajax({
        type: "POST",
        url: PsychoResultUrl,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(testResult),
        processData: false,
        success: callback,
        error: errorcallback
    });
}
function submittest() {
    if (!checkAnswers()) {
        highlightNonAnswered();
        return false;
    }
    if (!highlightEducation()) {
        return false;
    }
        
    //console.log("Responses");
    //console.log(answers);
    //var testName2 = testName.toString().extract("test ");
    //console.log(testName2);
    showButtonsStart();
    postAnswers(postAnswerCallback,postAnswerErrorCallback);
    return true;
    //$.post("../psychotestResults", ,null,"json");
}

//TODO add PsychoTestPauseUrl, construct pausedtestresult, implement resumetest(), add a select box with tests to resume into HTML, after selection load raw test, load results and go into the last screen,
function pausetest() {
    if (!confirm("Do you want to postpone the test execution? Postponed test can be resumed later from the current screen.")) return;
    //store results, raw test and screen number into server
    var pausedtestResult = {};
    pausedtestResult.testname = parser.testName;//{ get; set; }
    pausedtestResult.screennumber = parser.currentPage;//{ get; set; }
    pausedtestResult.rawtestdefinition = parser.currentTest;//{ get; set; }

    //pausedtestResult.loginname = prompt("Enter your unique ID, e.g. email address");
    pausedtestResult.temporalresults= JSON.stringify(parser.result.answers);
    var METHOD = "PUT"
    if (parser.resumeid>0) {pausedtestResult.id = parser.resumeid; METHOD="POST"}
    $.ajax({
        type:METHOD,
        url:PsychoTestPauseUrl,
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(pausedtestResult),
        processData: false,
        success: pausetestcallback,
        error: postAnswerErrorCallback
    })
    //console.log("TODO, not yet implemented pausetest()");
}
var pausedtestid = 0;
function pausetestcallback(data){
    console.log("saved paused test. Response:");
    //console.log(data)
    pausedtestid = data.id;
    focusPaused(); //calling back to focus the paused Tab
}

function evaluateScripts() {
    //evaluate graphs
    var codes = document.getElementById('preview').getElementsByTagName("script");
    //console.log("codes"+codes);
    //console.log(codes);
    for (var i = 0; i < codes.length; i++) {
        eval(codes[i].text);
    }
}

