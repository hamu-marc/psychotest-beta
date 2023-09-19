function updateNewResults() {
    //ko.applyBindings(new ViewModel());
     items = ko.observableArray([
{ testid: 1, testname:"psychotest", respondend:"guest",testcase:"1.wav",task:"volume",answer:"high",date:"12-03-05" }
//... more items
     ]);
    $.getJSON(PsychoResultUrl, null, function (data) {
        //console.log("updateResultList()");
        //console.log(data);*/
        $('#results2 > option').remove();
        data.reverse(); //get the newest data as the first one
        data.forEach(function (item) {
            $('#results2').append("<option value='" + item.name + "'>" + item.name + "</option>");
        });
    });
}

function getSelectedResult2(resultitem) {
    var resultname = resultitem.value;
    //fill items
    $.getJSON(PsychoResultUrl + resultname, null, function(data2) {
        data = [];
        data2.reverse();
        data2.forEach(function(item) {
            item.resultItems.forEach(function(subitem) {
                var newitem = {
                    testid: item.id,
                    testname: item.name,
                    respondent: item.user,
                    testcase: subValue(subitem, "case:", "question:"),
                    task: subValue(subitem, "question:", "answer:"),
                    answer: subValue(subitem, "answer:", "date:"),
                    date: subValue(subitem, "date:", "}")
                }
                data.push(newitem);
            });
        });
        //add empty last row
        updateItems(data);
        //items = data;//ko.observableArray(data);
    });
}

var items = [
{ testid: 1, testname: "psychotest", respondend: "guest", testcase: "1.wav", task: "volume", answer: "high", date: "12-03-05" }
//... more items
];

var selfModel;//= this;
function updateItems(data) {
    selfModel.itemsProvider.clear();
    selfModel.itemsProvider.addArray(data);
    selfModel.gridOptions().applyHandler();
}

function ViewModel() {
    selfModel = this;
    selfModel.itemsProvider = new TesserisPro.TGrid.ArrayItemsProvider(items);
    selfModel.gridOptions = ko.observable();
    selfModel.pageSize = function () {
        selfModel.gridOptions().pageSize = 7;
        selfModel.gridOptions().applyHandler();
    }
}

function selectElementContents(el) {
    var body = document.body, range, sel;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        } catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
    } else if (body.createTextRange) {
        range = body.createTextRange();
        range.moveToElementText(el);
        range.select();
    }

}
