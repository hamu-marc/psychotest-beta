/**
 * Created by tomaton on 10/22/2015.
 */
/*
 *	Library to interpret the definition of the test in PSYCHOACOUSTICTEST-DSL language in HTML5 and Javascript
 */

function Interpreter() {
    this.currentCursor = 0;
    this.currentPage=0;
    this.maxPages = 0;
    this.questionPage = 0;
    this.sliderValues = [];
    this.testName = "";
    this.currentTest = "";
    this.sloupce = false;
    this.sliderId = 0;
    this.previoustoken = ""; //holds previous token - for distinguishing states during interpretation
    this.previousrow = "";//holds previous row
    this.tstate = {}; //holds structure of state variables
//keep the last question and values for answer
    this.allowprev = true;
    this.educational = false;
    this.highlighted = false;
    this.eduid = 0;
    this.eduresults = {};//new Responses();
    this.resumeid = 0; //id of paused test; for future update

    this.hodnoty = [];
    this.hodnotySetted = true;
//    this.columnnumber = 0;
    this.lastformid = "";
    this.lastformidescaped = "";

    this.parovaotazka = false;

    this.result = new Responses();
    this.stimul = new Stimulus();
//    this.prep = new Preprocesor(this); //backward reference
}

//make prototype function startsWith - if it does not exist
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}
//definitions of regex for keyword
var isZvuk = function(c) { return /^[\s]*stimulus/.test(c); },
    isText = function(c) { return /^[\s]*text/.test(c); },
//    isVideo = function(c) { return /^[\s]*video/.test(c); },
    isOtazka = function(c) { return /^[\s]*task/.test(c); },
    isPanel = function(c) { return /^[\s]*panel/.test(c); },
//    isParovaOtazka = function(c) { return /^[\s]*taskpair/.test(c); },
    isTaskForStimuli = function(c) { return /^[\s]*taskforstimuli/.test(c); },
    startsWithZvuk = function(c) { return /^[\s]*stimulus/.test(c); },
    startsWithComment = function(c) { return /^[\s]*#/.test(c); },
//isObrazovka2 = function(c) { return /^[\s]*dvouobrazovka/ .test(c); },
    isKategorie = function(c) { return /^[\s]*screen per 1/.test(c); },
    isParovy = function(c) { return /^[\s]*screen per 2/.test(c); },
    isObrazovka = function(c) { return /^[\s]*screen/.test(c); },
    isSloupce = function(c) { return /^[\s]*column/.test(c); },
    isHodnoty = function(c) { return /^[\s]*values/.test(c); },
    isCheckboxvalues = function(c) { return /^[\s]*checkboxvalues/.test(c); },
    isCheckboxvaluesOnRow = function(c) { return /^[\s]*checkboxvaluesonrow/.test(c); },
//isSkalovaci = function(c) { return /^[\s]*taskscale/ .test(c); },
    isSkalovaciHodnoty = function(c) { return /^[\s]*scalevalues/.test(c); },
    isSkala = function(c) { return /^[\s]*scale/.test(c); },
    isPopis = function(c) { return /^[\s]*edit/.test(c); },
    isSerad2d = function(c) { return /^[\s]*ranking2d/.test(c); },
    isPoradiVNtici = function(c) { return /^[\s]*randomintuple/.test(c); },
    isPoradiZvuku = function(c) { return /^[\s]*randomstimuli/.test(c); },
    isPoradiCase = function(c) { return /^[\s]*randomscreen/.test(c); },
    isRandomPairs = function (c) { return /^[\s]*randompairs/.test(c); },
    isValuesOnRow = function(c) { return /^[\s]*valuesonrow/.test(c); },
    isSelect = function(c) { return /^[\s]*select/.test(c); },

    isStyle = function(c) { return /^[\s]*#style/.test(c); },
    isStyleButton = function(c) { return /^[\s]*#stylebutton/.test(c); },
    isStyleForm = function(c) { return /^[\s]*#styleform/.test(c); },
    isType = function(c) { return /^[\s]*type /.test(c);},
    isExtends = function(c) {return /^[\s]*extends /.test(c);},
    isStimuliGroup = function(c) {return /^[\s]*stimuligroup /.test(c);},
    isWithStimuli = function(c) {return /^[\s]*withstimuli/.test(c);},
    isWithStimuligroup = function(c) {return /^[\s]*withgroup/.test(c);};
//    isReplaceStimuli = function(c) {return /^[\s]*replace stimuli/.test(c);},
//    isReplaceGroup = function(c) {return /^[\s]*replace group/.test(c); };


Interpreter.prototype.translateObrazovka = function(row) {
    this.result.resetLast();
    this.sloupce = false;
    var translatedRow = "<span class='lefthead'>" + this.currentPage + ". " + Interpreter.extract("screen") + " </span><span class='righthead'>" + this.testName + "</span><p style='clear:both;margin:20px;'></p>\n";
    this.previoustoken = "screen";
    return translatedRow;
};
/*
 *	translateXXX translate a row from PSYCHOACOUSTICTEST-DSL language to the HTML5 interpretation
 */

/*var valuesonrow = false;//true; fix #212, added to translateHodnoty
 function translateValuesOnRow(rowsplitted) {
 valuesonrow = true;
 var tr = translateHodnoty(rowsplitted,true);
 valuesonrow = false;
 return tr;
 }
 */

/*
 *	anything after the "text" is added to HTML output
 */
Interpreter.prototype.translateText = function(row) {
    var output = "";
    if (this.sloupce) output += "<tr><td colspan='2'>";
    output += "<p>" + Interpreter.extract("text") + "</p>";
    if (this.sloupce) output += "</td></tr>";
    return output;
};


/*Interpreter.prototype.generateHtmlOtazkaRow = function() {
    return generateHtmlOtazkaRow("");
}*/

//used multipletimes
Interpreter.prototype.generateHtmlOtazkaRow = function(suffix) {
    this.lastformid = "q" + this.currentPage + "." + this.questionPage;
    this.lastformidescaped = "q" + this.currentPage + "\\\\." + this.questionPage;
    var mysuffix = "";
    if (suffix) mysuffix=suffix;
    return "<form id='"+this.lastformid+"' name='q" + this.currentPage + "." + this.questionPage + "'><fieldset><legend>" + this.result.lastotazka +mysuffix+ " </legend>";
};

Interpreter.prototype.generateEditHeaderRow = function() {
    this.lastformid = "q" + this.currentPage + "." + this.questionPage;
    this.lastformidescaped = "q" + this.currentPage + "\\\\." + this.questionPage;
    return "<form id='"+this.lastformid+"' name='q" + this.currentPage + "." + this.questionPage + "'><fieldset><legend>" + this.result.lastotazka + "</legend>";
};

Interpreter.prototype.translateTaskForStimuli = function(row) {
    this.parovaotazka = false;
    this.result.lastotazka = Interpreter.extract("taskforstimuli "); //adds to the #1 to the question
    this.hodnotySetted = false;
    this.questionPage++;
    //var mytable = "";
    //mytable += this.generateHtmlOtazkaRow();
    //if (this.sloupce) { //make row of table
//        var mytable =  + mytable;//  + "</td>"; //
    //}
    return "<tr><td class='task'>"+ this.generateHtmlOtazkaRow(" #1");
};

/*
 *	translates "task ..." to the HTML form
 */
Interpreter.prototype.translateOtazka = function(row) {
    this.parovaotazka = false;
    this.result.lastotazka = Interpreter.extract("task ");
    this.hodnotySetted = false;
    this.questionPage++;
    return this.generateHtmlOtazkaRow();
};
//mytableend = "</td>";
//if (columnnumber == 1) mytableend += "</tr>";
//TODO finish otazka and parovaotazka in table with 2 columns
/*
 *	translates "parovaotazka ... " to the HTML form with 2 sounds each in 1 column and each row has the same question
 */
Interpreter.prototype.translateParovaOtazka = function(row) {
    //lastotazka = row.substring("otazka".length);
    //hodnotySetted = false;
    this.parovaotazka = true;
    this.questionPage++;
    this.result.lastotazka = Interpreter.extract("task ");
    this.lastformid = "q" + this.currentPage + "." + this.questionPage;
    this.lastformidescaped = "q" + this.currentPage + "\\\\." + this.questionPage;
    return "<tr><td colspan='2'><form id='" + this.lastformid + "'><fieldset><legend>" + this.result.lastotazka + "</legend>";
};
/*
 *	translates "hondoty ..." to the opened HTML form, interprets as allowed values to be chosen by user
 */
/*function translateHodnoty(rowsplitted) {
 return translateHodnoty(rowsplitted, true,false);
 }
 */

hashCode = function (s) {
    return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
};

Interpreter.prototype.generateHtmlRow = function (rowsplitted,radiobuttons,taskindex) {
    var translatedRow="";
    for (var j = 1; j < rowsplitted.length; j++) {
        var mybr = "<br />";
        var myvalue = rowsplitted[j];
        var myid = hashCode(this.lastformid + "v" + myvalue);
        if (this.parovaotazka || this.valuesonrow) mybr = "&nbsp; &nbsp;"; //don't make new line in parova otazka or when values on row
        if(radiobuttons)
            translatedRow += "<input id='" + myid + "'type='radio' name='otazka' value='" + myvalue + "' onclick='setAnswer(" + this.currentPage + "," + this.questionPage + ",this)'/><label for='"+myid+"' class='answer'><span><span></span></span>" + myvalue + "</label>"+mybr;
        else
            translatedRow += "<input id='" + myid + "' type='checkbox' name='otazka' value='" + myvalue + "' onclick='setCheckAnswer(" + this.currentPage + "," + this.questionPage + ",this)'/><label for='" + myid + "'span class='answer'><span></span>" + myvalue + "</label>"+mybr;
        this.result.setDefaultAnswer(this.currentPage, this.questionPage,taskindex);
    }
    return translatedRow;
};

Interpreter.prototype.translateHodnoty = function(rowsplitted) {
    var radiobuttons = ! isCheckboxvalues(rowsplitted[0]);
    this.valuesonrow = isCheckboxvaluesOnRow(rowsplitted[0]) || isValuesOnRow(rowsplitted[0]);
    var translatedRow = "";
    var taskindex = ""; if (this.sloupce && !this.parovaotazka) taskindex=" #1";
    translatedRow+=this.generateHtmlRow(rowsplitted,radiobuttons,taskindex);
    translatedRow += "</fieldset></form>\n";
    if (this.sloupce) //coppies the same task and values to the second collumn of the pairs
        if (this.parovaotazka) {
            translatedRow += "</td></tr>";
        } else {//close the column, duplicate question to second column and close the row
            this.questionPage++;
            taskindex=" #2"
            translatedRow += "</fieldset></form></td><td class='task'>"+this.generateHtmlOtazkaRow(taskindex); //fix bug#249 added closing form tag
            translatedRow+=this.generateHtmlRow(rowsplitted,radiobuttons,taskindex);
            translatedRow += "</fieldset></form></td></tr>";

        }
    //will remember the values of last question - it is not needed to repeat them
    this.hodnoty[this.result.lastotazka] = rowsplitted;
    this.hodnotySetted = true;
    return translatedRow;
};

function splitValues(row) {
    var re1 = /[ ;,]+/; // fix feature bug #240, coma ',' is used to separate interval numbers
    if (!row.contains('"')) return row.split(re1);
    var rowsplitted = [];
    var quote = false;
    var currentitem = "";
    for (var i = 0; i < row.length; i++) {
        if (!quote) //normal split
            if (/[\"]/.test(row[i])) quote = true;
            else if (/[, ;]/.test(row[i])) {
                if (currentitem.length>0) rowsplitted.push(currentitem);
                currentitem = "";
            } else {
                currentitem += row[i];
            }
        else { //quotes add everything between quotes
            if (/[\"]/.test(row[i])) {
                rowsplitted.push(currentitem);
                currentitem = "";
                quote = false;
            } else {
                currentitem += row[i];
            }
        }
    }
    if (currentitem.length > 0) rowsplitted.push(currentitem);
    return rowsplitted;
}

Interpreter.prototype.translateScale = function(previousrow,rowsplitted) {
    if (this.sloupce && ! this.parovaotazka) { //makes two coppies of the task for each stimulus in pair
        var translated= "\n"+this.translateSkalovaci() + this.translateSkalovaciHodnoty(rowsplitted, " #1");
        this.questionPage++;
              translated+="</fieldset></form></td><td>"+this.generateHtmlOtazkaRow(" #2")+this.translateSkalovaci() + this.translateSkalovaciHodnoty(rowsplitted," #2")+"</fieldset></form></tr></td>\n";
        return translated;
    }
    return this.translateSkalovaci(previousrow) + this.translateSkalovaciHodnoty(rowsplitted);
};

Interpreter.prototype.translateVAScale = function(previousrow,rowsplitted) {
    if (this.sloupce && ! this.parovaotazka) {//makes two coppies of the task for each stimulus in pair
        var translated= "\n"+this.translateSkalovaci() + this.translateSkalovaciVAHodnoty(rowsplitted," #1");
        this.questionPage++;
        translated+="</fieldset></form></td><td>"+this.generateHtmlOtazkaRow(" #2")+this.translateSkalovaci() + this.translateSkalovaciVAHodnoty(rowsplitted," #2")+"</fieldset></form></tr></td>\n";
        return translated;
    }
    return this.translateSkalovaci(previousrow) + this.translateSkalovaciVAHodnoty(rowsplitted);
};

Interpreter.prototype.translateSkalovaciHodnoty = function(rowsplitted) {
return this.translateSkalovaciHodnoty(rowsplitted,"");
};

Interpreter.prototype.translateSkalovaciHodnoty = function(rowsplitted, taskindex) {
    //moved to translateSkalovaci questionPage++; //increase index of answer
    this.result.setDefaultAnswer(this.currentPage, this.questionPage,taskindex); //fix bug # 198
    //var rowsplitted = splitValues(row);
    var translatedRow = "";
    this.sliderValues[this.sliderId] = rowsplitted.slice(1);
    translatedRow += "<script>makeSlider(0, 0," + (this.sliderValues[this.sliderId].length-1) + ", 1, " + this.sliderId + "," + this.questionPage + ");</script>";
//    if (this.sloupce)
//        if (this.parovaotazka) {
//            translatedRow += "</td></tr>";
/*        } else {
            this.questionPage++;
            this.sliderId++;
            this.sliderValues[this.sliderId] = rowsplitted.slice(1);
            this.result.setDefaultAnswer(this.currentPage, this.questionPage); //fix bug # 198
            translatedRow += "<script>makeSlider(0, 0," + (this.sliderValues[this.sliderId].length-1) + ", 1, " + this.sliderId + "," + this.questionPage + ");</script>";
        }*/
        //} else {
        //    this.questionPage++;
        //    this.sliderId++;
        //    this.result.setDefaultAnswer(this.currentPage, this.questionPage); //fix bug # 198
        //    //var rowsplitted = splitValues(row);
        //    //translatedRow = "";
        //    this.sliderValues[this.sliderId] = rowsplitted.slice(1);
        //    translatedRow += "<td><tr><script>makeSlider(0, 0," + (this.sliderValues[this.sliderId].length-1) + ", 1, " + this.sliderId + "," + this.questionPage + ");</script>";
        //}
    return translatedRow;
};

Interpreter.prototype.translateSkalovaciVAHodnoty = function(rowsplitted) {
  return this.translateSkalovaciVAHodnoty(rowsplitted,"");
};

Interpreter.prototype.translateSkalovaciVAHodnoty = function(rowsplitted,taskindex) {
    //moved to translateSkalovaci questionPage++; //increase index of answer
    this.result.setDefaultAnswer(this.currentPage, this.questionPage,taskindex); //fix bug #198
    var translatedRow = "";
    var mySliderValues = [];
    //console.log("translateSkalocavi rowsplitted:");
    //console.log(rowsplitted)
    /*for (var i = 3; i < rowsplitted.length;i=i+2 ) {
     mySliderValues[parseInt(rowsplitted[i])]= rowsplitted[i+1];
     }
     sliderValues[sliderId] = mySliderValues;
     */
    if (rowsplitted[2].indexOf('(') > 0) { //fix bug #269 scale 0 100(0.5) will be translated as 0 100 with step 0.5
        var maxstep = rowsplitted[2].split(/[\(\)]/);
        //console.log("maxstep");
        //console.log(maxstep)
        for (var i = 3; i < rowsplitted.length; i = i + 2) {
            //mySliderValues[Math.floor(parseInt(rowsplitted[i])/maxstep[1] - rowsplitted[1])] = rowsplitted[i + 1];//fix bug #269 add correct indices to ticks -100 100(0.5) will make -200 200
            mySliderValues[parseFloat(rowsplitted[i])] = rowsplitted[i + 1]; //fix bug #269 new version of labeled, changed to parsefloat
            //mySliderValues[rowsplitted[i]] = rowsplitted[i + 1]; //fix bug #minus float values not determined??
        }
        this.sliderValues[this.sliderId] = mySliderValues;

        translatedRow += "<script>makeVASlider(" + this.sliderId + "," + rowsplitted[1] + "," + maxstep[0] + ", " + this.questionPage + "," + maxstep[1] + ");</script>";
    } else {
        for (i = 3; i < rowsplitted.length; i = i + 2) {
            mySliderValues[parseInt(rowsplitted[i])] = rowsplitted[i + 1];
        }
        this.sliderValues[this.sliderId] = mySliderValues;
        translatedRow += "<script>makeVASlider(" + this.sliderId + "," + rowsplitted[1] + "," + rowsplitted[2] + ", " + this.questionPage + ");</script>";
    }
    //console.log("va hodnoty js:" + translatedRow);

    return translatedRow;
};


Interpreter.prototype.translateSkalovaci = function(row) {
    var translatedRow = "";//"<br />";
    this.sliderId++;
    if (row) this.result.lastotazka = Interpreter.extract("task ");  //fix bug #198
    //move to task questionPage++; //moved from skalovaci??hodnoty
//fix #212    translatedRow += "<p id='q" + currentPage + "." + questionPage + "' class='label'><input class='sliderlabel' readonly='true' type='text' id='slider" + sliderId + "Value'></p>";
    translatedRow += "<p class='label'><input class='sliderlabel' readonly='true' type='text' id='slider" + this.sliderId + "Value'></p>";
    translatedRow += "<div id='slider" + this.sliderId + "'></div>";
    //translatedRow += "<br /><br />";
    //console.log("translateSkalovaci " + sliderId);
    //move it to skalovacihodnoty
    return translatedRow;
};

String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

Interpreter.prototype.translatePopis = function(row) {
    var taskindex = ""; if (this.sloupce && !this.parovaotazka) taskindex=" #1";
    if (Interpreter.endsWith("?")) this.result.setDefaultOptionalAnswer(this.currentPage, this.questionPage,taskindex);
    else this.result.setDefaultAnswer(this.currentPage, this.questionPage,taskindex);
    var translatedrow = "<textarea rows='1' onkeyup='setAnswer(" + this.currentPage + "," + this.questionPage + ",this)'></textarea>";
    if (this.sloupce) {
        if (this.parovaotazka) {
            translatedrow += "</fieldset></form></td></tr>";
        }else{
            this.questionPage++;
            taskindex=" #2";
            translatedrow += "</fieldset></form></td><td>"+this.generateHtmlOtazkaRow(taskindex); //fix bug#249 added closing form tag
            if (Interpreter.endsWith("?")) this.result.setDefaultOptionalAnswer(this.currentPage, this.questionPage," #2");
            else this.result.setDefaultAnswer(this.currentPage, this.questionPage,taskindex);
            translatedrow += "<textarea rows='1' onkeyup='setAnswer(" + this.currentPage + "," + this.questionPage + ",this)'></textarea>";
        }
    }
    return translatedrow;
};

//if the question is not closed put values from previously defined question with values
Interpreter.prototype.closeOtazka = function() {

    if (!this.hodnotySetted) {
        //console.log("closeOtazka() last values not set");
        //console.log(hodnoty);
        //console.log(lastotazka);\
        this.hodnotySetted = true;
        if (this.hodnoty[this.result.lastotazka]) {
            //console.log("setting from last values");
            return this.translateHodnoty(this.hodnoty[this.result.lastotazka]);
        } else return "</fieldset></form>\n";
    } else return "";
};
/*
 *	"sloupce" command initiate the HTML output to be generate into the HTML table with 2 collumns
 */
Interpreter.prototype.translateSloupce = function() {
    if (!this.sloupce) {
        this.sloupce = true;
        //return "<table><thead><tr><th class='tablefirst'/><th class='tablesecond'/></thead><tbody><tr>";
        return "<table><tr>";
    } else return "";

};

Interpreter.prototype.closeSloupce = function() {
    if (this.sloupce) {
        this.sloupce = false;
        return "</tr></tbody></table>";
    } else return "";
};

//select generates select menu
Interpreter.prototype.translateSelect = function(rowsplitted) {
    //fix bug ... indicate that the element was answered by changing the background
    var row = "<select onclick='this.style.background=\"lightblue\"; setAnswer(" +this.currentPage+ ","+this.questionPage+",this);' onchange='setAnswer(" +this.currentPage+ ","+this.questionPage+",this);'>";
    for (var i = 1; i < rowsplitted.length; i++) {
        row+="<option value='"+rowsplitted[i]+"'>" + rowsplitted[i] + "</option>";
    }
    row += "</select>";
    this.result.setDefaultAnswer(this.currentPage, this.questionPage); //fix bug # 198
    return row;
};

Interpreter.prototype.translateStyle= function(previoustoken, row) {
    var firsttoken = row.trim().split(' ', 2)[0]; //gets #style or #stylebutton or #styleform
    var styledefinition = Interpreter.extract(firsttoken); //extract the previously obtained token
    if (isObrazovka(previoustoken)) //style of body e.g.:max-width:40em
        return "\n<script>document.body.style='" + styledefinition + "'</script>\n";
    if (isZvuk(previoustoken)) //style of all stimulus attribute e.g.: width:10%;
        return "\n<script>$('.stimulus').attr('style','" + styledefinition + "');</script>\n";
    if (previoustoken === 'button')
        return "\n<script>$('.sound-button').attr('style','" + styledefinition + "');</script>\n";
    if (isOtazka(previoustoken))
        return "\n<script>$('.task').attr('style','" + styledefinition + "');</script>\n";
    if (previoustoken === 'form')
        return "\n<script>" +
                //"console.log('" +lastformidescaped+"');"+ //logs
            "$('#"+this.lastformidescaped+"').attr('style','" + styledefinition + "');" + //sets style for the form element with last formid
            "$('#" + this.lastformidescaped + " ~ form').attr('style','" + styledefinition + "');" + //and sets style for all other sibling forms
            "</script>\n";
    //fix #212, 248
    //return "\n<script>$('.task').children('form').attr('style','" + styledefinition + "');</script>\n";
    return "";
};


Interpreter.prototype.translateType = function(row) {
    //translates type - educational mode, previous button allowed/notallowed etc.
    if (row.contains("nopreviousbutton")) this.allowprev = false;
    if (row.contains("yespreviousbutton")) this.allowprev = true;
    if (row.contains("educational")) this.educational = true;
    if (this.educational) {
        this.eduid = row.match(/educational\(([\d]+)\)/)[1];
        if (this.eduid !== "") getEduResults(this);
    } //indexOf("educational")+1
};

    function getEduResults(parser){
        
            $.getJSON(PsychoResultIdUrl + parser.eduid, null, function (data) {
                //console.log("retrieved educational raw results");
                //console.log(data);
                parser.eduresults = {};
                data[0].resultItems.forEach(function (item) {
                    //console.log("parsing item:");
                    //console.log(item);
                    var itemobj = RepairJSONResultItem(item);
                    if (!parser.eduresults[itemobj.case]) parser.eduresults[itemobj.case] = {};
                    if (!parser.eduresults[itemobj.case].answer) parser.eduresults[itemobj.case].answer = [];
                    parser.eduresults[itemobj.case].answer[itemobj.question.trim()] = itemobj.answer;
                    if (!parser.eduresults[itemobj.case].note) parser.eduresults[itemobj.case].note = [];
                    if (!itemobj.note) parser.eduresults[itemobj.case].note[itemobj.question.trim()] = itemobj.date; //TODO new collumn for note, current workaround, note into date collumn
                    else parser.eduresults[itemobj.case].note[itemobj.question.trim()] = itemobj.note;
                });
                //console.log("retrieved educational results");
                //console.log(eduresults);
            });
    }
//translate one row
Interpreter.prototype.translateTestItems = function(row) {
    var translatedRow = "";
    row = row.trim();
    //console.log('test item:');
    //console.log(row);
    /*var re1 = /[ ;,]+/; // fix feature bug #240, coma ',' is used to separate interval numbers
     var rowsplitted = row.split(re1);*/
    var rowsplitted = splitValues(row); //fix bug, comas and spaces in quotes
    if (rowsplitted.length == 0) return translatedRow;

    if (isZvuk(rowsplitted[0])) translatedRow += this.stimul.translateZvuk(rowsplitted,this.tstate.poradivnticinahodne,this.result,this.sloupce);
    else if(!startsWithComment(rowsplitted[0])) translatedRow += this.stimul.translateNonZvuk(row); //do separation between stimuli and other elements

    if (isZvuk(rowsplitted[0])) { /* already done in previous call, no action*/ }
    //else if (isVideo(rowsplitted[0])) translatedRow += this.stimuli.translateVideo(rowsplitted); //deprecated
    else if (isText(rowsplitted[0])) translatedRow += this.translateText(row);
    else if (isSloupce(rowsplitted[0])) translatedRow += this.translateSloupce();
    /*else if (isParovaOtazka(rowsplitted[0])) { //priority over isOtazka
        translatedRow += this.closeOtazka();
        translatedRow += this.translateParovaOtazka(row);
    } //else if (isSkalovaci(rowsplitted[0])) translatedRow += translateSkalovaci(row); //priority over isOtazka
    */
    else if (isTaskForStimuli(rowsplitted[0])){
        translatedRow += this.closeOtazka();
        if (this.sloupce) translatedRow+=this.translateTaskForStimuli(row);
        else Console.log("Warning: unexpected token 'taskforstimuli' not in pair ")
    }
    else if (isOtazka(rowsplitted[0])) {
        translatedRow += this.closeOtazka();
        if (this.sloupce) translatedRow+=this.translateParovaOtazka(row);
        else translatedRow += this.translateOtazka(row);
    }
    else if (isPanel(rowsplitted[0])) {
        translatedRow+=this.closeOtazka();
    }
    else if (isHodnoty(rowsplitted[0]) || isCheckboxvalues(rowsplitted[0])) translatedRow+= this.translateHodnoty(rowsplitted); //will match also valuesonrow and checkboxvaluesonrow
    // move decision on type of hodnoty on function translateValues else if (isHodnoty(rowsplitted[0])) translatedRow += translateHodnoty(rowsplitted,true);
    //else if (isCheckboxvalues(rowsplitted[0])) translatedRow += translateHodnoty(rowsplitted, false);

    else if (isSkalovaciHodnoty(rowsplitted[0])) translatedRow += this.translateScale(this.previousrow,rowsplitted);
    else if (isSkala(rowsplitted[0])) translatedRow += this.translateVAScale(this.previousrow,rowsplitted);
    else if (isPopis(rowsplitted[0])) translatedRow += this.translatePopis(row);
    else if (isSerad2d(rowsplitted[0])) translatedRow += this.translateSerad2d(row.slice("ranking2d".length), this.stimul.audioid, this.currentPage, this.questionPage++);
    else if (isSelect(rowsplitted[0])) translatedRow += this.translateSelect(rowsplitted);
    else if (isStyleButton(rowsplitted[0])) translatedRow += this.translateStyle("button", row);
    else if (isStyleForm(rowsplitted[0])) translatedRow += this.translateStyle("form", row);
    else if (isStyle(rowsplitted[0])) translatedRow += this.translateStyle(this.previoustoken, row);
    else if (isType(rowsplitted[0])) this.translateType(row);
    this.previoustoken = rowsplitted[0];
    if (!startsWithComment(rowsplitted[0])) this.previousrow = row;
    return translatedRow;
};

Interpreter.prototype.footerPageNumber = function() {
    return "<p align='center' class='footer'>Obrazovka "+this.currentPage+" z celkem "+this.maxPages +".</p>"
};

//shuffle randomly the array
Array.prototype.shuffle = function () {
    var i = this.length, j, temp;
    if (i == 0) return this;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
};

String.prototype.extract = function (subs) {
    return this.substring(this.indexOf(subs)+subs.length);

};
/*
 *	this script will preprocess the test - make combination of screens etc. before it is interpretted
 * e.g. "parovytest", there are made pairs from the sounds within this test and generated screens,
 *      for 2 sound there is 1 pair, for 3 sounds there are 3 pair combination [1,2][1,3][2,3], ...
 */
TestState = { UND:0, OBR: 1, PAR: 2, KAT: 3,  END: 4, START: 5, EXT:6, STIMGR:7, REPSTIM:8, REPGRP:9 };

//reset all values
Interpreter.prototype.initTest = function(currentRawTest) {
    /*this.tstate.poradivnticinahodne = false;
    this.tstate.poradizvukunahodne = false;
    this.tstate.poradicasenahodne = false;*/
    this.educational = false;
    this.highlighted = false;
    this.prep = new Preprocesor(this);

    this.currentTest = this.prep.preprocessTest(currentRawTest); //preprocess from currentRawTest to currentTest
    this.tstate = this.prep.tstate;
    //console.log(currentTest);
    this.maxPages = this.currentTest.match(/\n[\s]*screen/ig).length;
    this.testName = this.currentTest.match(/test .*/i).toString().extract("test ");

    this.currentCursor = 0;
    this.currentPage = 0;
    this.resumeid= 0;

    this.result.answers = [];//reset answers TODO check
    this.sliderValues = [];//reset slider values
};

Interpreter.prototype.resumeTest = function(currentRawTest,page,answers,resumeid) {
    this.educational = false; //TODO persist
    this.highlighted = false; //TODO persist
    this.sliderValues = [];//TODO persist?
    this.resumeid = resumeid;
    this.prep = new Preprocesor(this);

    this.currentTest = currentRawTest; //a;ready preprocessed
    this.tstate = this.prep.tstate;
    //console.log(currentTest);
    this.maxPages = this.currentTest.match(/\n[\s]*screen/ig).length;
    this.testName = this.currentTest.match(/test .*/i).toString().extract("test ");

    this.currentCursor = 0;
    this.currentPage = 0;
//    this.currentPage = page; //persistent
    if (page>0) {
        page--;
        while (this.currentPage<page) nextpage();
    } else {
        console.log("weird paused at page 0; or 1;");
    }

    this.result.answers = answers;//reset answers
}

Interpreter.prototype.findPreviousObrazovka = function(testDSL) {
    var splitted = testDSL.split("\n");
    this.currentCursor--;
    this.currentPage -= 2;
    while ((this.currentCursor > 0) && (!splitted[this.currentCursor].startsWith('screen'))) this.currentCursor--;
    if (this.currentCursor > 0) this.currentCursor--; //step over the curent item
    while ((this.currentCursor > 0) && (!splitted[this.currentCursor].startsWith('screen'))) this.currentCursor--;
};
