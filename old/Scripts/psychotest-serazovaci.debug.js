var defaultSVG1 = '<svg width="100%" height="100%" version="1.1" viewBox="-10 0 800 200" style="border-style:solid;border-width:1px;"\
xmlns="http://www.w3.org/2000/svg" \
xmlns:xlink="http://www.w3.org/1999/xlink"\
onload="init(\'ball\',1)"';
var defaultSVG11 = '\
onmouseup="mouseUp(evt,1,1)"\
onmousemove="mouseMove(evt)">\
';
var defaultSVGball1 = '\
<g id="ball0" dragy="0"\
dragx="0"';
var defaulSVGball11 = '\
transform="translate(0,0)">\
<rect style="opacity:0.50000000000000000;fill:#acd8e6;stroke:#000000;stroke-width:5;fill-opacity:1;stroke-opacity:1"\
height="36"\
width="80"\
ry="18"\
rx="18"\
id="ball"\
x="0"\
y="0" />';
var defaultSVGball2= '\
<path style="fill:#c026f3;fill-opacity:1;stroke:#000000;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\
d="m 43.718257,11.24556 c 0.50507,17.67767 0.50507,18.18275 0.50507,18.18275 l 21.21321,-9.09137 z"\
id="path3792"\
onclick="document.getElementById(\'audio0\').play();"\
/>\
<path style="fill:#26f36d;fill-opacity:1;stroke:#000000;stroke-width:1.46451628px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"\
d="m 22,8 9.715929,5.5782 -8.741942,0.24254 0,5.33566 10.151933,0 0,-3.88049 6.203959,5.57821 -6.767956,5.09313 0,-3.88049 -9.587936,0.24254 0,7.27591 5.921961,0 -7.613951,5.09314 -6.203958,-5.09314 4.793968,0 0,-6.79085 -9.305939,-0.24254 0,3.63796 -6.485958,-5.09313 5.639962,-5.33567 0.563997,4.12301 8.459945,-0.48506 -0.281998,-5.82073 -5.357965,-0.24253 z"\
id="path5399"\
/>   \
</g>  \
';
var defaultSVG2 = '\
<text id="descx" x="0" y="149" font-size="8" fill="black">descX &#8594;</text>\
<text id="descy" x="-4" y="141" font-size="8" fill="black" transform="rotate(270,-4,141)">descY &#8594;</text>\
</svg>\
';
var ymax = 400; //max of y in "serad" svg graph

//create inner SVG element, where each sound is presented as an draggable icon, recounts size in contrast to default svg
Interpreter.prototype.translateSerad2d = function (row, maxaudioid, pagenum, questionnum) {
    var rowsplitted = row.split(/[;]+/);   
    ymax = maxaudioid * 50 + 50;
    this.result.setDefaultAnswer(pagenum, questionnum); //fix bug 198
    var svgsuffix = rowsplitted.length > 1 ? defaultSVG2.replace("descX", rowsplitted[0]).replace("descY", rowsplitted[1]) : defaultSVG2;
    var svgsuffix2 = svgsuffix.replace("y=\"149\"", "y=\"" + (ymax - 2) + "\"").replace(/141/g,(ymax - 9));
    return defaultSVG1.replace('init(\'ball\',1)', 'init(\'ball\',' + maxaudioid + ')').replace('viewBox="-10 0 800 200"', 'viewBox="-10 0 800 ' + (ymax) + '"')
        + defaultSVG11.replace('mouseUp(evt,1,1)', 'mouseUp(evt,' + pagenum + ',' + questionnum + ')')
        + generateSoundBall(maxaudioid)
        + svgsuffix2;//rowsplitted.length>1 ? defaultSVG2.replace("descX",rowsplitted[1]).replace("descY",rowsplitted[2]) : defaultSVG2;
}

//for each sound generates an interactive SVG element
function generateSoundBall(maxaudioid) {
    console.log("maxaudioid:"+maxaudioid);
    var soundBall = "";
    for (var i = 0; i < maxaudioid; i++) {
        soundBall += defaultSVGball1.replace('id="ball0" dragy="0"', 'id="ball' + i + '" dragy="' + i * 50 + '"');
        soundBall += defaulSVGball11.replace('translate(0,0)', 'translate(0,' + i * 50 + ')');
        soundBall += defaultSVGball2.replace(/audio0/, "audio" + i);
    }
    return soundBall;
}

//draggable part inspired by http://www.codedread.com/dragtest2.svg
function inspect(obj) {
        var str = new Array();
        var element = null;
        for(element in obj) { str[str.length] = element; }
        str.sort();
        alert(obj + ":" + str.join(' '));
    }
    
    var draggingElement = null;
var nMouseOffsetX = 0;
var nMouseOffsetY = 0;
    
function mouseDown(evt) { 
    var target = evt.currentTarget;
    draggingElement = target;

    if(target) {
        var p = document.getElementsByTagName("svg")[0].createSVGPoint();
        p.x = evt.clientX;
        p.y = evt.clientY;
        
        var m = getScreenCTM(document.getElementsByTagName("svg")[0]);

        p = p.matrixTransform(m.inverse());
        nMouseOffsetX = p.x - parseInt(target.getAttribute("dragx"));
        nMouseOffsetY = p.y - parseInt(target.getAttribute("dragy"));
        if (nMouseOffsetX>61 && nMouseOffsetX<91) play();
    }
}

function getDraggablePositions() {
    var positions = "";
    var draggable = document.getElementsByTagName("g");
    for (var i = 0; i < draggable.length; i++) {
        positions += Math.round(parseFloat(draggable[i].getAttribute("dragx"))) + "," + Math.round(parseFloat(draggable[i].getAttribute("dragy"))) + " ";
    }
    return positions;
}

function mouseUp(evt,pageNum,questionNum) { 
    draggingElement = null;
    var value = getDraggablePositions();
    setAnswer(pageNum,questionNum,value);
    nMouseOffsetX = 0;
    nMouseOffsetY = 0;
}

function mouseMove(evt) {
    var p = document.getElementsByTagName("svg")[0].createSVGPoint();
    p.x = evt.clientX;
    p.y = evt.clientY;

    var m = getScreenCTM(document.getElementsByTagName("svg")[0]);

    p = p.matrixTransform(m.inverse());
    p.x -= nMouseOffsetX;
    p.y -= nMouseOffsetY;

    if (draggingElement) {
        if (p.x < 0) p.x = 0; else if (p.x > 800) p.x = 800 - 50; //on borders keep 0
        if (p.y < 0) p.y = 0; else if (p.y > ymax - 50) p.y = ymax - 50;
        draggingElement.setAttribute("dragx", p.x);
        draggingElement.setAttribute("dragy", p.y);
        draggingElement.setAttribute("transform", "translate(" + p.x + "," + p.y + ")");

    }
}
    
function displayCoords(x,y,extra) {
    var xNode = document.getElementById("xpos");
    var yNode = document.getElementById("ypos");
    if(xNode && yNode) {
        xNode.firstChild.nodeValue = parseInt(x) + extra;
        yNode.firstChild.nodeValue = parseInt(y) + extra;
    }
}
    
function displayRawText(text) {
    var textNode = document.getElementById("raw");
    if(textNode) {
        textNode.firstChild.nodeValue = text;
    }
}
    
function init(prefix,count) {
    for (var i=0;i<count;i++)
    {
        var ball = document.getElementById(prefix+i);
        if (ball) ball.addEventListener("mousedown", mouseDown, false);
    }
    /*var ball = document.getElementById("ball");
    var square = document.getElementById("square");
    var logo = document.getElementById("cd_logo");
    //var feed = document.getElementById("feed_icon");
    if(ball && square && logo) {
        ball.addEventListener("mousedown", mouseDown, false);
        square.addEventListener("mousedown", mouseDown, false);
        logo.addEventListener("mousedown", mouseDown, false);
        //feed.addEventListener("mousedown", mouseDown, false);
    }
    //displayRawText("Drag stuff around");
    */
}
    
function displayMatrix(matrix) {
    displayRawText(matrix.a + ", " + matrix.b + ", " + matrix.c + ", "
                    + matrix.d + ", " + matrix.e + ", " + matrix.f);
}
    
// Following is from Holger Will since ASV3 and O9 do not support getScreenTCM()
// See http://groups.yahoo.com/group/svg-developers/message/50789
function getScreenCTM(doc){
    if(doc.getScreenCTM) { return doc.getScreenCTM(); }
        
    var root = document.getElementsByTagName("svg")[0];//doc
    var sCTM= root.createSVGMatrix()

    var tr= root.createSVGMatrix()
    var par=root.getAttribute("preserveAspectRatio")
    if (par==null || par=="") par="xMidYMid meet"//setting to default value
    parX=par.substring(0,4) //xMin;xMid;xMax
    parY=par.substring(4,8)//YMin;YMid;YMax;
    ma=par.split(" ")
    mos=ma[1] //meet;slice

    //get dimensions of the viewport
    sCTM.a= 1
    sCTM.d=1
    sCTM.e= 0
    sCTM.f=0


    w=root.getAttribute("width")
    if (w==null || w=="") w=innerWidth

    h=root.getAttribute("height")
    if (h==null || h=="") h=innerHeight

    // Jeff Schiller:  Modified to account for percentages - I'm not 
    // absolutely certain this is correct but it works for 100%/100%
    if(w.substr(w.length-1, 1) == "%") {
        w = (parseFloat(w.substr(0,w.length-1)) / 100.0) * innerWidth;
    }
    if(h.substr(h.length-1, 1) == "%") {
        h = (parseFloat(h.substr(0,h.length-1)) / 100.0) * innerHeight;
    }

    // get the ViewBox
    vba=root.getAttribute("viewBox")
    if(vba==null) vba="0 0 "+w+" "+h
    var vb=vba.split(" ")//get the viewBox into an array

    //--------------------------------------------------------------------------
    //create a matrix with current user transformation
    tr.a= root.currentScale
    tr.d=root.currentScale
    tr.e= root.currentTranslate.x
    tr.f=root.currentTranslate.y


    //scale factors
    sx=w/vb[2]
    sy=h/vb[3]


    //meetOrSlice
    if(mos=="slice"){
        s=(sx>sy ? sx:sy)
    }else{
        s=(sx<sy ? sx:sy)
    }

    //preserveAspectRatio="none"
    if (par=="none"){
        sCTM.a=sx//scaleX
        sCTM.d=sy//scaleY
        sCTM.e=- vb[0]*sx //translateX
        sCTM.f=- vb[0]*sy //translateY
        sCTM=tr.multiply(sCTM)//taking user transformations into acount

        return sCTM
    }


    sCTM.a=s //scaleX
    sCTM.d=s//scaleY
    //-------------------------------------------------------
    switch(parX){
        case "xMid":
            sCTM.e=((w-vb[2]*s)/2) - vb[0]*s //translateX

            break;
        case "xMin":
            sCTM.e=- vb[0]*s//translateX
            break;
        case "xMax":
            sCTM.e=(w-vb[2]*s)- vb[0]*s //translateX
            break;
    }
    //------------------------------------------------------------
    switch(parY){
        case "YMid":
            sCTM.f=(h-vb[3]*s)/2 - vb[1]*s //translateY
            break;
        case "YMin":
            sCTM.f=- vb[1]*s//translateY
            break;
        case "YMax":
            sCTM.f=(h-vb[3]*s) - vb[1]*s //translateY
            break;
    }
    sCTM=tr.multiply(sCTM)//taking user transformations into acount

    return sCTM
}
    

