/**
 * Created by tomaton on 10/21/2015.
 */
//var parser = Interpreter();

/*executable function can be called from html */
function makeSlider(sliderVal, sliderMin, sliderMax, sliderStep, sliderId,myQuestionPage) {
    //console.log("slider");
    parser.result.setDefaultAnswer(parser.currentPage, myQuestionPage);
    var myslider = $("#slider" + sliderId);
    myslider.labeledslider({
        value: sliderVal, min: sliderMin, max: sliderMax, step: sliderStep, slide: function (event, ui) {
            $("#slider" + sliderId + "Value").val(parser.sliderValues[sliderId][ui.value]);
            //ui.handle.style.backgroundColor = "lightblue";//css("background-color","lightblue"); jquery ui
            this.style.background = "lightblue";
            setAnswer(parser.currentPage, myQuestionPage, parser.sliderValues[sliderId][ui.value]);
        },
        start: function(event,ui){
            $("#slider" + sliderId + "Value").val(parser.sliderValues[parser.sliderId][ui.value]);
            //ui.handle.style.backgroundColor = "lightblue";
            this.style.background = "lightblue";
            setAnswer(parser.currentPage, myQuestionPage, parser.sliderValues[parser.sliderId][ui.value]);
        },
        tickLabels: parser.sliderValues[sliderId]
    });
    var width = myslider.width() / (parser.sliderValues[parser.sliderId].length - 1);
};

function makeVASlider(sliderId, sliderMin, sliderMax, myQuestionPage) {
    makeVASlider(sliderId, sliderMin, sliderMax, myQuestionPage, 1)
}

function makeVASlider(sliderId, sliderMin, sliderMax, myQuestionPage,sliderStep) {
    //console.log("VAslider");
    parser.result.setDefaultAnswer(parser.currentPage, myQuestionPage);
    var sliderKeysstr = Object.keys(parser.sliderValues[sliderId]);
    var sliderKeys = sliderKeysstr.map(Number); //fix bug #269 new version of labeledslider requires numbers

    $("#slider" + sliderId).labeledslider({
        value: sliderMin, min: sliderMin, max: sliderMax, step: sliderStep, slide: function (event, ui) {
            $("#slider" + sliderId + "Value").val(ui.value);
            this.style.background = "lightblue";
            setAnswer(parser.currentPage, myQuestionPage, ui.value);
        },
        start: function(event,ui){
            $("#slider" + sliderId + "Value").val(ui.value);
            this.style.background = "lightblue";
            //$("#slider" + sliderId).css("background","lightblue");
            setAnswer(parser.currentPage, myQuestionPage, ui.value);
        },
        //tickInterval:sliderStep,
        tickArray: sliderKeys,
        tickLabels: parser.sliderValues[sliderId]
    });
}

