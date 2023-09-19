/**
 * Created by tomaton on 10/22/2015.
 */
Preprocesor = function(parent) {
    this.currentCursor = 0;
    this.state = TestState.UND;// getState(this.splitted, currentCursor++);
    this.tstate = {};
    this.myTest = "";
    this.expandedTest = [];
    this.expandedGroup = [];
    this.replaceableStimuli = [];
    this.tempTest = "";
    this.parent = parent; //expects parser
    
};
    //console.log(this.splitted);
Preprocesor.prototype.getState = function () {
        //console.log("getState() "+currentCursor);
        //console.log(this.splitted[currentCursor]);
        if (this.currentCursor >= this.splitted.length) return TestState.END;
        if (isParovy(this.splitted[this.currentCursor])) return TestState.PAR;
        if (isKategorie(this.splitted[this.currentCursor])) return TestState.KAT;
        if (isObrazovka(this.splitted[this.currentCursor])) return TestState.OBR;
        if (isExtends(this.splitted[this.currentCursor])) return TestState.EXT;
        if (isStimuliGroup(this.splitted[this.currentCursor])) return TestState.STIMGR;
//        if (isReplaceStimuli(this.splitted[this.currentCursor])) return TestState.REPSTIM;
//        if (isReplaceGroup(this.splitted[this.currentCursor])) return TestState.REPGRP;
        if (isRandomPairs(this.splitted[this.currentCursor])) { this.tstate.randompairs = true;return TestState.UND;}
        if (isPoradiVNtici(this.splitted[this.currentCursor])) { this.tstate.poradivnticinahodne = true;return TestState.UND;}
        if (isPoradiZvuku(this.splitted[this.currentCursor])) { this.tstate.poradizvukunahodne = true;return TestState.UND;}
        if (isPoradiCase(this.splitted[this.currentCursor])) { this.tstate.poradicasenahodne = true;return TestState.UND;}
        if (isType(this.splitted[this.currentCursor])) this.parent.translateType(this.splitted[this.currentCursor]); // feature #208, type in the beginning of test definition
        return TestState.UND;
    };

Preprocesor.prototype.copyTest = function () {
        this.currentCursor++;
        this.myTest += this.splitted[this.currentCursor - 1] + "\n"; //copy of row with obrazovka or test ...
        while (this.getState() === TestState.UND) this.myTest += this.splitted[this.currentCursor++] + "\n"; //copy of rows
    };

//all after the cursor will be shuffled per screens
Preprocesor.prototype.shuffleTest = function () {
        //readalltestToArray
        var tempcursor = this.currentCursor++;
        var testArray = [];
        while (this.getState() != TestState.END) {
            this.tempTest = this.splitted[this.currentCursor - 1] + "\n";
            while (this.getState() === TestState.UND) this.tempTest += this.splitted[this.currentCursor++] + "\n"; //copy of rows
            testArray.push(this.tempTest); //each item is a screen
            this.currentCursor++;
        }
        //shuffle screens
        testArray.shuffle();

        //expandArrayToText
        this.currentCursor = tempcursor;
        var testCase = [];
        for (var i = 0; i < testArray.length; i++) {
            testCase = testArray[i].split("\n");
            for (var j = 0; j < testCase.length;j++) this.splitted[this.currentCursor++] = testCase[j];
        }
        //console.log("test after shuffle", this.splitted);    //this.splitted[this.currentCursor]
        this.currentCursor = tempcursor;
    };

Preprocesor.prototype.collectSounds = function () {
        var zvuks = [];
        while (startsWithZvuk(this.splitted[this.currentCursor])) {
            zvuks.push(this.splitted[this.currentCursor++]);
        }
        if (this.tstate.poradizvukunahodne) {
            zvuks.shuffle();
            //console.log("zvuks after random shuffling:", zvuks);
        }
        return zvuks;
    };

Preprocesor.prototype.foreachSoundGenerateObrazovka = function (zvuks,title) {
        var obrazovkacontent = [];
        while (this.getState() == TestState.UND) {
            obrazovkacontent.push(this.splitted[this.currentCursor++]);
        }
        for (var i = 0; i < zvuks.length; i++) {
            this.myTest += "screen "+Interpreter.extract("screen per 1")+"\n" + zvuks[i] + "\n";
            for (var j = 0; j < obrazovkacontent.length; j++) {
                this.myTest += obrazovkacontent[j] + "\n";
            }
        }
    };
Preprocesor.prototype.expandKategorie = function () {
        var title = this.splitted[this.currentCursor++]; //skip over the row defining the kategory test
        while (startsWithComment(this.splitted[this.currentCursor])) {//skip over comments - there might be some styling
            title += "\n" + this.splitted[this.currentCursor++];
        }
        var zvuks = this.collectSounds();
        this.foreachSoundGenerateObrazovka(zvuks,title);
    };

Preprocesor.prototype.makePairs = function (zvuks) {
        var combinations = [];
    //recursive generation of all possible pairs
        var getpairs = function (active, rest) {
            //console.log("iteration");
            //console.log(active);
            //console.log(rest)
            if (rest.length == 0) {
                if (active.length == 2) {

                    combinations.push(active);
                    //console.log("found:");
                    //console.log(active);
                }
            } else {
                var active1 = active.slice();
                active.push(rest[0]);
                getpairs(active, rest.slice(1));
                getpairs(active1, rest.slice(1));
            }
        };
        getpairs([], zvuks);
        return combinations;
    };

Preprocesor.prototype.foreachPairofSoundsGenerateObrazovka = function (pairs,title) {
        var obrazovkacontent = [];
        while (this.getState() == TestState.UND) {
            obrazovkacontent.push(this.splitted[this.currentCursor++]);
        }
        for (var i = 0; i < pairs.length; i++) {
            this.myTest += "screen "+Interpreter.extract("screen per 2")+"\n" + "column\n" + pairs[i][0] + "\n" +pairs[i][1] + "\n";
            for (var j = 0; j < obrazovkacontent.length; j++) {
                this.myTest += obrazovkacontent[j] + "\n";
            }
            /*myTest += "sloupec\n" + pairs[i][1] + "\n";
             for (var j = 0; j < obrazovkacontent.length; j++) {
             myTest += obrazovkacontent[j] + "\n";
             }*/
        }
    //fix bug ranodm in tuple

    };

Preprocesor.prototype.expandParovy = function () {
        var title = this.splitted[this.currentCursor++]; //skip row defining par test
        var zvuks = this.collectSounds();
        var pairs = this.makePairs(zvuks);
        if (this.tstate.poradicasenahodne || this.tstate.randompairs) pairs.shuffle();
        if (pairs.length==0) console.log('Expected more rows with stimulus to generate pairs, but no pairs generated.');
        this.foreachPairofSoundsGenerateObrazovka(pairs,title);
    };

//splice array into array
Array.prototype.spliceArray = function(index, n, array) {
    return Array.prototype.splice.apply(this, [index, n].concat(array));
}

//expands inherited test - read definition into separated array.
Preprocesor.prototype.expandInheritance = function() {
    var parentrow = this.splitted[this.currentCursor].split(/[ ;,]+/); //each inherited test is separated
    //for (var i=indexofnames;i<parentrow.lengt h;i++){ //
    //extends [0] test [1] withstimuli [2] a,b,c,d [3,4,5,6]
        var parent = parentrow[1];
        //gets from url test definition
        var myurl = PsychoTest2Url + parent;
        $.ajax({
            dataType: "json",
            url: myurl,
            data: null,
            success: function (testdto){
                if (parser.prep.expandedTest[parent]) console.log("expandInheritance, Warning: test definition already exists for "+parent);
                parser.prep.expandedTest[parent] = testdto[0].definition;
            },
            error: function(jq,status,error){
                console.log("expandInheritance, Error: When loading data for the test definition "+myurl+ " "+ error);
            },
            async:false
        });
    if (parentrow.length>3){ //extends with replacement of stimuli
        if (isWithStimuli(parentrow[2])){
            var stimuli = parentrow.slice(3); //stimuli names without previous -- TODO parse with apostrophes
        //this.replaceStimuli(parent,stimuli);//replace stimuli with new one from array
        //inserts a extended test with replaced stimuli
            this.splitted.spliceArray(this.currentCursor,1,this.replaceStimuli(this.expandedTest[parent],stimuli));
        } else if (isWithStimuligroup(parentrow[2])) {
            var parent2 = parentrow[3];
            myurl = PsychoTest2Url + parent2;
            $.ajax({
                dataType: "json",
                url: myurl,
                data: null,
                success: function (testdto) {
                    if (parser.prep.expandedGroup[parent2]) console.log("expandGroup, Warning: test definition already loaded for " + parent2);
                    parser.prep.expandedGroup[parent2] = testdto[0].definition;
                },
                error: function (jq, status, error) {
                    console.log("expandGroup, Error: When loading data for the test definition " + myurl + " " + error);
                },
                async: false
            });
            if (this.expandedTest[parent])
                if (this.expandedGroup[parent2]) this.splitted.spliceArray(this.currentCursor, 1, this.replaceStimuliGroup(this.expandedTest[parent], this.expandedGroup[parent2]));
                else {
                    console.log("expandinheritance: Info, nothing to replace from group");
                    this.splitted.spliceArray(this.currentCursor, 1, this.expandedTest[parent]);
                }
            else console.log("expandinheritance: Info, nothing to expand");
        } else console.log("expandinheritance: Warning unrecognized extend attribute:"+parentrow[2]);
    } else { //extends without replacement
        if (this.expandedTest[parent]) {
            console.log("expandinheritance: Info, nothing to replace from group");
            this.splitted.spliceArray(this.currentCursor, 1, this.splitExtendTestDefinition(this.expandedTest[parent]));
        } else console.log("expandinheritance: Info, nothing to expand");
    }
    this.currentCursor++;
};

//expands stimuligroup into the current test - reads all stimulus in a group into separate array
Preprocesor.prototype.expandStimuliGroup = function() {
    var parentrow = this.splitted[this.currentCursor].split(/[ ;,]+/); //each expanded group is split
    //for (var i=indexofnames;i<parentrow.lengt h;i++){ //
    //stimuligroup [0] [groupname] [1...]
    var parent = parentrow[1];
    //gets from url test definition
    var myurl = PsychoTest2Url + parent;
    $.ajax({
        dataType: "json",
        url: myurl,
        data: null,
        success: function (testdto){
            if (this.expandedGroup[parent]) console.log("expandGroup, Warning: test definition already loaded for "+parent);
            this.expandedGroup[parent] = testdto[0].definition;
        },
        error: function(jq,status,error){
            console.log("expandGroup, Error: When loading data for the test definition "+myurl+" "+error);
        },
        async:false
    });
    if (this.expandedGroup[parent]) {
        this.splitted.spliceArray(this.currentCursor,1,this.splitStimuliDefinition(this.expandedGroup[parent]));
    }
    else console.log("expandGroup: Info, nothing to expand from stimuligroup.");
    //this.currentCursor++;
};

//splits only stimulus from group definition into array
Preprocesor.prototype.splitExtendTestDefinition = function (testdefinition) {
    var rawtest = testdefinition.split("\n");
    //rawtest.shift(); //removes first row -- usually definition of test name
    rawtest[0] = "# "+rawtest[0]; //comments out the first row -- usually definition of test name
    return rawtest;
};

//splits only stimulus from group definition into array
Preprocesor.prototype.splitStimuliDefinition = function (groupdefinition) {
    var rawstimuli = groupdefinition.split("\n");
    var stimuli = [];
    //    var newrows = [];
    for (var i = 1; i < rawstimuli.length; i++) { //step over first row
        var mystimuli = rawstimuli[i].trim();
        if (mystimuli.length>0)
        stimuli.push("stimulus "+rawstimuli[i]);
    } //adds only rows with stimulus prefix
    return stimuli;
};

//replace each occurence of stimuli with a stimulus row from group definition,
// if some stimulus remains, it is inserted at the last position of stimulus in definition
Preprocesor.prototype.replaceStimuliGroup = function(definition,groupdefinition) {
    var defrows = definition.split("\n"); //splits per row
    var stimuli = this.splitStimuliDefinition(groupdefinition);
    var laststimulusindex=0;
    for (var i=0;i<defrows.length;i++){ //parse each row
        if (isZvuk(defrows[i]))
            if (stimuli.length>0) {laststimulusindex=i; defrows[i] = stimuli.shift();} //stimulus keyword with new stimulus from array
            else console.log("replaceStimuli: Warning not enough stimuli for replacement.");
    }
    if (stimuli.length>0) {
        console.log("replaceStimuli: Info adding remaining stimuli after last stimulus in extended test");
        defrows.spliceArray(laststimulusindex,0,stimuli);
    }
    return defrows;
};

//replace each occurence of stimuli with a stimulus row from group definition,
// if some stimulus remains, it is inserted at the last position of stimulus in definition
Preprocesor.prototype.replaceStimuli = function(definition,stimuli){
    var defrows = definition.split("\n"); //splits per row
    defrows[0] = "# "+defrows[0]; //comment out first row of definition --usually testname
//    var newrows = [];
    var laststimulusindex=0;
    for (var i=0;i<stimuli.length;i++) {stimuli[i]="stimulus "+stimuli[i]} //adds stimulus keyword as prefix
    for (var i=0;i<defrows.length;i++){ //parse each row
        if (isZvuk(defrows[i]))
            if (stimuli.length>0) {laststimulusindex=i; defrows[i] = stimuli.shift();} //stimulus keyword with new stimulus from array
            else console.log("replaceStimuli: Warning not enough stimuli for replacement.");
    }
    if (stimuli.length>0) {
        console.log("replaceStimuli: Info adding remaining stimuli after last stimulus in extended test");
        defrows.spliceArray(laststimulusindex+1,0,stimuli);
    }
    return defrows;
}



//preprocessing
    //copy everything before first state
    //this.currentCursor++;
Preprocesor.prototype.preprocessTest = function(rawTest) {
    this.currentCursor = 0;
    this.splitted = rawTest.split("\n"); //split to rows and parse rows
    this.state = TestState.UND;// getState(this.splitted, currentCursor++);
    this.tstate = {};
    this.myTest = "";
    this.tempTest = "";

    //copy between test and first screen
    this.copyTest();

    if (this.tstate.poradicasenahodne) this.shuffleTest();

    //console.log("cursor " + this.currentCursor + " row " + this.splitted[this.currentCursor]);
    this.state = this.getState();
    while (this.state != TestState.END) {
        if (this.state == TestState.OBR) this.copyTest();
        else if (this.state == TestState.KAT) this.expandKategorie();
        else if (this.state == TestState.PAR) this.expandParovy();
        else if (this.state == TestState.EXT)  this.expandInheritance();
        else if (this.state == TestState.STIMGR) this.expandStimuliGroup();
//        else if (this.state == TestState.REPSTIM) this.replaceStimuli();
//        else if (this.state == TestState.REPGRP) this.replaceStimuliGroup();
        else {
            //console.log("Parse error. " + this.state + ". Not expected state. Line " + this.currentCursor + " row:" + this.splitted[this.currentCursor++]);
            this.myTest+=this.splitted[this.currentCursor++]+"\n"; //probably extension - copy test.
        }
        this.state = this.getState();
        //if (this.currentCursor<this.splitted.length) console.log("cursor " + this.currentCursor + " row " + this.splitted[this.currentCursor]);
    }
    //return coppiedTest;
    return this.myTest;
};
//flatenize inheritance
//TODO continue with recursive - flatenize, remove statement from preprocess and add them to recursive call, or use ajax(async:false)

//flatenize -- collect artefacts
Preprocesor.prototype.flatenizeTest = function(rawTest) {
    this.splitted = rawTest.split("\n");
    var i= 0,j=0;
    var artefacts = [];
    for (i =0;i<this.splitted.length;i++) {
        if (isExtends(this.splitted[i])|| isStimuliGroup(this.splitted[i])) {
            var parentrow = this.splitted[i].split(/[ ;,]+/);
            for (j=1;j<parentrow.length;j++){
                artefacts.push(parentrow[j]); //add artefact names that will be recursively obtained from server
            }
        }
    }
}

Preprocesor.prototype.loadTestDefinition = function(row) {
    var parentrow = this.splitted[this.currentCursor++].split(" ");
    for (var i=1;i<parentrow.length;i++){
        var parent = parentrow[i];
        this.myTest+= this.getTestDefinition(parent); //gets test definition by name, skip first row with test name and copy&paste to
    }
}
