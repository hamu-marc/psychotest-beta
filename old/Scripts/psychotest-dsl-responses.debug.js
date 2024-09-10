/**
 * Created by tomaton on 10/21/2015.
 */

function Responses() {
    this.answers = [];
    this.lastotazka ="";
    this.lastqcase ="";
}

Responses.prototype.resetLast = function(){
    this.lastqcase = "";
    this.lastotazka = "";
};

Responses.prototype.addCase = function (qcase)
{
    this.lastqcase += qcase;
}

Responses.prototype.setFullAnswer = function (pageNum, questionNum, qcase,question, answer) {
    //test if exists
    //console.log("setanswer " + pageNum + " " + questionNum+" "+qcase+" "+question+":", answer);
    if (!this.answers[pageNum - 1]) this.answers[pageNum - 1] = []; //some workaround probably not needed more
    if (!this.answers[pageNum - 1][questionNum - 1]) this.answers[pageNum - 1][questionNum - 1] = {};
    this.answers[pageNum - 1][questionNum - 1].case = qcase;
    this.answers[pageNum - 1][questionNum - 1].question = question;
    setAnswer(pageNum, questionNum, answer);
};


//sets default answer
/*Responses.prototype.setDefaultAnswer = function (pageNum, questionNum) {
    return this.setDefaultAnswer(pageNum,questionNum,"");
    // if (!this.answers[pageNum - 1] || !this.answers[pageNum - 1][questionNum - 1]) this.setFullAnswer(pageNum, questionNum, this.lastqcase,this.lastotazka,"N/A");
};

//sets default answer
Responses.prototype.setDefaultOptionalAnswer = function(pageNum, questionNum) {
    return setDetaultOptionalAnswer(pageNum,questionNum,"");
    //    if (!this.answers[pageNum - 1] || !this.answers[pageNum - 1][questionNum - 1]) this.setFullAnswer(pageNum, questionNum, this.lastqcase, this.lastotazka, "");
};*/

//sets default answer
Responses.prototype.setDefaultAnswer = function (pageNum, questionNum,suffix) {
    var mysuffix ="";    if (suffix) mysuffix=suffix;
    if (!this.answers[pageNum - 1] || !this.answers[pageNum - 1][questionNum - 1]) this.setFullAnswer(pageNum, questionNum, this.lastqcase,this.lastotazka+mysuffix,"N/A");
};

//sets default answer
Responses.prototype.setDefaultOptionalAnswer = function(pageNum, questionNum,suffix) {
    var mysuffix ="";    if (suffix) mysuffix=suffix;
    if (!this.answers[pageNum - 1] || !this.answers[pageNum - 1][questionNum - 1]) this.setFullAnswer(pageNum, questionNum, this.lastqcase, this.lastotazka+mysuffix, "");
};


/* executable function, can be called from html element*/
setAnswer = function(pageNum, questionNum, answer) {
    if (answer.value) parser.result.answers[pageNum - 1][questionNum - 1].answer = answer.value;
    else parser.result.answers[pageNum - 1][questionNum - 1].answer = answer;
    parser.result.answers[pageNum - 1][questionNum - 1].date = new Date();
};

setCheckAnswer = function(pageNum, questionNum, answer) {

    if (answer.value) {
        if (!parser.result.answers[pageNum - 1][questionNum - 1].hasOwnProperty('checkedvalues')) parser.result.answers[pageNum - 1][questionNum - 1].checkedvalues = [];
        if (answer.checked) parser.result.answers[pageNum - 1][questionNum - 1].checkedvalues[answer.value] = answer.value;
        else if (parser.result.answers[pageNum - 1][questionNum - 1].checkedvalues.hasOwnProperty(answer.value)) delete parser.result.answers[pageNum - 1][questionNum - 1].checkedvalues[answer.value];
        var currentanswer = "";
        parser.result.answers[pageNum - 1][questionNum - 1].checkedvalues.forEach(function(item) {
            if (parser.result.answers[pageNum - 1][questionNum - 1].checkedvalues[item]) currentanswer += item+";";
        },this); //this is propagated to foreach callback
        parser.result.answers[pageNum - 1][questionNum - 1].answer = currentanswer;
    }
//    else answers[pageNum - 1][questionNum - 1].answer = answer;
    parser.result.answers[pageNum - 1][questionNum - 1].date = new Date();
};

