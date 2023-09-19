/**
 * Created by tomaton on 10/21/2015.
 */
//main object
function Stimulus(){
    this.navelement = false;
    this.divelement = false;
    this.audioid = 0
    //this.sloupce = false;
}
/* separates non-stimulus part of test */
Stimulus.prototype.translateNonZvuk = function(row) {
    if (this.navelement) {
        this.navelement = false;
        this.divelement = true;
        return "</nav><div class='task' id='questions'>\n";
    }
    if (!this.divelement) {
        this.divelement = true;
        return "<div class='task' id='questions'>\n";
    }
    return "";
};

/* close unclosed <div>*/
Stimulus.prototype.closeQuestionDiv = function() {
    if (this.divelement) {
        this.divelement = false;
        return "<p class='footer'></p></div>";
    } else return "";
};

/* same name different extension => <audio> with different sources, different names => different <audios>
 * translates "zvuk [filename2.wav] [filename2.ogg]" to HTML representation of sound player to one or both formats wav, ogg
 * translates "zvuk [file1.wav] [file1.ogg] [file2.wav] [file3.wav] into tuple of buttons file1 has 2 sources with ogg and wav, file2 and file3 has one source with wav
 */

Stimulus.prototype.openAudio=function(sloupce) {
    if (!sloupce && !this.navelement) {
        this.navelement = true;
        switch (this.tagtype) {
            case "mp4":
                this.tags.push("<nav class='stimulus videos'>"); //video takes more space
                break;
            case "png":
            case "jpg":
                this.tags.push("<nav class='stimulus pictures'>"); //image takes variable space
                break;
            case "txt":
                this.tags.push("<nav class='stimulus txts'>"); //text takes more space
                break;
            default:
                this.tags.push("<nav class='stimulus sounds'>"); //audio on left 10 % collumn
        }
    }

    switch (this.tagtype) {
        case "mp4":
            this.currentTag.push("<video style='max-width:100%;' id='video" + (this.audioid++) + "' width='480' height='360' controls>");
            break;
        case "png":
        case "jpg":
            this.currentTag.push("<img style='width:100%;' id='image"+(this.audioid++) +"'"); //imageo takes more space
            break;
        case "txt":
            this.currentTag.push("<p id='text" + (this.audioid++) + "'>"); //text takes more space
            break;
        default:
            this.inputindex = this.currentTag.length;
            this.currentTag.push("<input class='sound-button' type='button' onclick='document.getElementById(\"audio" + this.audioid + "\").play();' value='play'/><audio id='audio" + (this.audioid++) + "'>");
            break;
    }
};

//add range playing of sound
Stimulus.prototype.repairLastAudio = function(rowsplitted) {
    //preserve that
    switch (this.tagtype) {
        case "mp4":
        case "png":
        case "jpg":
        case "txt":
            console.log("Error, expected audio for range playing");
            break;
        default:
            var re2 = /[\[\],]/; // fix feature bug #240, coma ',' is used to separate interval numbers
            var rowsplitted2 = rowsplitted.split(re2);
            var starttime = rowsplitted2[1]; //[10,10] is separates as [0] is empty, [1] is 10, [2] is 10 [3] is empty
            var duration = rowsplitted2[2];
            this.audioid--; //will repair the last audio
            this.currentTag[this.inputindex] = "<input type='button' onclick='playAudioPart(document.getElementById(\"audio" + this.audioid + "\")," + starttime + "," + duration + ");' value='play'/><audio id='audio" + (this.audioid++) + "'>";
    }
};

//close <audio> tag
Stimulus.prototype.closeAudio = function() {
    switch (this.tagtype) {
        case "mp4":
            this.currentTag.push("Your browser does not support the video element.</video>\n");
            break;
        case "png":
        case "jpg":
            this.currentTag.push("/>");
            break;
        case "txt":
            this.currentTag.push("</p>");
            break;
        default:
            this.currentTag.push("Your browser does not support the audio element.</audio>\n");
    }
    //adds copy of current tag to the array of tags dedicated to unique stimulus
    this.tags.push(this.currentTag.join(''));
    //nulls the current tag so new content audio/video can be inserted
    this.currentTag = [];
};

//add <source> of the <audio> <video and src of the image
Stimulus.prototype.addSource = function() {
    switch (this.tagtype) {
        case "mp4":
            this.currentTag.push("<source src='" + SOUNDDIR + this.currentsound[0] + "." + this.currentsound[1] + "' type='audio/"); //+rowsplitted[j+1]+"'>';
            this.currentTag.push("mpeg'>");
            break;
        case "png":
        case "jpg":
            this.currentTag.push(" src='" + SOUNDDIR + this.currentsound[0] + "." + this.currentsound[1] + "'");
            break;
        case "txt": //loads the content of the txt file
            this.currentTag.push("<span src='" + SOUNDDIR + this.currentsound[0] + "." + this.currentsound[1] + "'/>"); //to hold the source
            this.currentTag.push("</p><script>$('#text" + (this.audioid - 1) + "').load('" + SOUNDDIR + this.currentsound[0] + "." + this.currentsound[1] + "')</script>");
            break;
        default:
            this.currentTag.push("<source src='" + SOUNDDIR + this.currentsound[0] + "." + this.currentsound[1] + "' type='audio/"); //+rowsplitted[j+1]+"'>';
            this.currentTag.push(this.currentsound[1] + "'>");
    }

    this.lastsoundname = this.currentsound[0];
};
/*
Stimulus.prototype.firstscreenaudioid= function()
{
//    this.audioid = 0
//    this.firstscreenaudioid = this.audioid;
}
*/

Stimulus.prototype.translateZvuk = function(rowsplitted,poradivnticinahodne,result,sloupce) {
    var j = 1;
    this.lastsoundname = "";
    this.tagtype = rowsplitted[j].slice(rowsplitted[j].length-3, rowsplitted[j].length).toLowerCase();// || rowsplitted[j].startsWith('v_');

    this.tags = [];
    this.currentTag = [];
    this.currentsound = [];
    this.inputindex = 0;
    if (sloupce) this.currentTag.push("<td class='stimulus'>");
    /* open initial tag */
    this.openAudio(sloupce);

    while (j < rowsplitted.length) {
        this.currentsound = rowsplitted[j].split(".");
        //if (!quotes)
        if ((this.lastsoundname==="") || (this.lastsoundname === this.currentsound[0])) {
            //add only new source type (wav,ogg), if soundname is same and only extension differs
            this.addSource();
            j++;
        } else if (rowsplitted[j].startsWith('[')) {
            //interval of previous sound
            this.repairLastAudio(rowsplitted[j]);
            j++; //skip the interval in [..]
        } else
        {//add new audio, different sound and it's source if different name
            this.closeAudio();
            this.openAudio(sloupce);
            this.addSource();
            j++;
        }
        //bug in feature #235, must randomize also the case order
        //lastqcase += rowsplitted[j] + "." + rowsplitted[j + 1] + " "; //adds sound to qcase structure
    }
    /* close last tag*/
    this.closeAudio();

    /* shuffle if needed */
    if (poradivnticinahodne) {
        //keep first <nav>,
        var mytag = this.tags.shift();
        //shuffle
        this.tags.shuffle();
        //adds first <nav>
        this.tags.unshift(mytag);
    }
    //gets filenames from the tags to keep order of cases in result, fix of feature #235, for starts from 1, 0 is <nav>, if sloupce then starts from 0 (no <nav> element
    //added sloupce?0:1 and parser.result.addCase() fix bug #284
    for (var k = sloupce?0:1; k < this.tags.length;k++) parser.result.addCase(Interpreter.extract(SOUNDDIR) + " ");
    //translatedRows = tags.join
    return this.tags.join(' ');
};

/* executive part of the audio
 playing part of the audio,
 audio element is expected as the calling argument,
 e.g. document.getElementById('myAudio') */
function stopAudio(audio) {
    audio.pause();
}

/* starts playing at "start" position and stops after specified duration
 "start" and "duration" in milliseconds
 */
function playAudioPart(audio, start, duration) {
    audio.currentTime = start / 1000; //in seconds
    audio.play();
    setTimeout(stopAudio, duration, audio); //in milliseconds
}
