// Initialise
let inputTa = document.getElementById("inputText");
inputTa.onpaste = pasteText;


// Text Processing
function toOutput(txt=document.getElementById("inputText").value) { //display on output text area
    document.getElementById("outputText").value = txt;
    currOutputText = document.getElementById("outputText").value;
}

function pasteText(event) {
    var checkboxesIn = document.querySelectorAll("input[name=cb-in]");
    for (i=0; i<checkboxesIn.length; i++) {
        checkboxesIn[i].checked = true;
    }

    setTimeout(getInput, 100);

    function getInput(){ 
        let txt = document.getElementById("inputText").value;
        toOutput(txt);
    }
}

function clearText() {
    var checkboxesIn = document.querySelectorAll("input[name=cb-in]");
    for (i=0; i<checkboxesIn.length; i++) {
        checkboxesIn[i].checked = false;
    }

    toOutput("");
}

function replaceTerm() {
    var term = document.getElementById("replaceTerm").value;
    var txt = document.getElementById("outputText").value;
    txt = txt.replaceAll(term, "");

    toOutput(txt);
}

function removeLine() {
    var txt = document.getElementById("outputText").value;
    // txt = txt.replaceAll("\n\n", '\n');
    // txt = txt.replace(/^\s*[\r<br>]/g, '');
    txt = txt.replace(/^\s*$(?:\r\n?|\n)/gm, '');
    txt = txt.replace(/\n*$/, '');
    txt = txt.replaceAll(/    +/g, ' ');

    toOutput(txt);
}

function removeNumber() {
    var txt = document.getElementById("outputText").value;
    txt = txt.replace(/\d+/g,'');

    toOutput(txt);
}

function removeSymbol() {
    var txt = document.getElementById("outputText").value;
    txt = txt.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/《》（）、：–]/gi, ' ')

    toOutput(txt);
}

function removeAll() {
    removeLine()
    removeNumber()
    removeSymbol()
}

function addTerm() {
    var txt = document.getElementById("outputText").value;
    var term = document.getElementById("addTerm").value;

    txt = term + " " + txt.replaceAll("\n", "\n" + term + " ")

    toOutput(txt);
}

function extractByComposer(position) {
    removeSymbol();
    removeLine();
    var txt = document.getElementById("outputText").value;
    var pattern = document.getElementById("inputPattern");
    txt = txt.split("\n")

    var result = ""

    for (i in txt) {
        line = txt[i].trim()
        tracks = line.split(" ")

        if (position == 'last') {
            artist = tracks.pop()
        } else {
            artist = tracks.shift()
        }

        for (j in tracks) {
            result += artist + " " + tracks[j] + "\n"
        }
    }
    toOutput(result);
}


// checkboxes to split input
var checkboxesIn = document.querySelectorAll("input[name=cb-in]");
checkboxes = checkboxesIn;
for (var i=0, len=checkboxes.length; i<len; i++) {
    getCb(checkboxes, i);
}

var checkboxesOut = document.querySelectorAll("input[name=cb-out]");
checkboxes = checkboxesOut;
currOutputText = "";
// currOutputText = document.getElementById("outputText").value;
for (var i=0, len=checkboxes.length; i<len; i++) {
    getCb(checkboxes, i, true);
}

function getCb(checkboxes, i, output=false) {
    if ( checkboxes[i].type === 'checkbox') {
            checkboxes[i].onclick = function() {
                var checkboxesChecked = [];
                // loop over them all
                for (var i=0; i<checkboxes.length; i++) {
                        // And stick the checked ones onto an array...
                        if (checkboxes[i].checked) {
                            checkboxesChecked.push(checkboxes[i].value);
                        }
                }
                // alert(checkboxesChecked);

                splitLine(checkboxesChecked, output);
            }
    }
}

function splitLine(checkboxesChecked, output) {
    var tabRadioId = "tab";
    var inputAreaId = "inputText";
    var txt = document.getElementById(inputAreaId).value;

    if (output) {
        tabRadioId = "tab-out";
        inputAreaId = "outputText";
        txt = currOutputText;
    }

    var inputPattern = " "
    if (document.getElementById(tabRadioId).checked) {
        inputPattern = "\t"
    }
    // alert(inputPattern)

    lines = txt.match(/[^\r\n]+/g);
    // alert(checkboxesChecked);
    var outputText = "";
    for (var i=0; i<lines.length; i++) {
        line = lines[i].trim()
        line = line.split(inputPattern);
        var temp = "";
        for (var j=0; j<checkboxesChecked.length; j++) {
            temp = temp + " " + line[checkboxesChecked[j]]
        }
        outputText = outputText + temp + "\n";
    }
    // alert(outputText);
    if (output==true) {
        document.getElementById("outputText").value = outputText;
    } else {
        toOutput(outputText);
    }
}


// Regex
function regId(string) {
    var myRe = /"id":"(.*?)"/;
    var myArray = myRe.exec(string);
    // console.log(myArray['1']);
    return myArray['1']
}

function regName(string) {
    var myRe = /"name":"(.*?)"/g;
    var myArray = [...string.matchAll(myRe)];
    // var myArray = myRe.exec(string);
    // console.log(myArray['1']);
    for (i in myArray) {
        myArray[i] = myArray[i][1]
    }
    return [myArray[myArray.length-2], myArray[myArray.length-1]]
}

function regTrack(string) {
    var myRe = /spotify:track:(.*?)"/;
    var myArray = myRe.exec(stringData);
    return myArray['1'];
}


// Spotify API --------------------------------
function getTrack(token, trackId) {
    var url = "https://api.spotify.com/v1/tracks/" + trackId;
    var result;

    var data = $.ajax({
        url: url,
        type: 'get',
        headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
        },
        dataType: 'json',
        async: false, 
        success:function(response)
        {
            result = response
            // console.log("Get track info");
            // console.log(JSON.stringify(result))
        },
        error: function(xhr, status, error)
        {
            console.log("Status of error message" + status + "Error is" + error);
        } 
    });
    stringData = JSON.stringify(result).replace("index.html:367:23", "");
    parsedData = JSON.parse(stringData);

    trackInfo = regName(stringData)
    console.log("Track Info " + trackInfo)
    // artist, trackTitle = regName(stringData)
    // console.log(artist, trackTitle)

    return trackInfo
}

function createNewPlaylist(token, userId, title) {
    var url = "https://api.spotify.com/v1/users/" + userId + "/playlists";
    var result;

    $.ajax({
        url: url,
        type: 'post',
        data: "{\"name\":\"" + title + "\",\"description\":\"\",\"public\":false}",
        headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
        },
        dataType: 'json',
        async: false, 
        success:function(response)
        {
            result = response;
            console.log("New playlist created");
            // console.log("Success!!" + JSON.stringify(response));
        },
        error: function(xhr, status, error)
        {
            console.log("Status of error message" + status + "Error is" + error);
        }
    });
    stringData = JSON.stringify(result).replace("index.html:367:23", "");
    parsedData = JSON.parse(stringData);
    return regId(stringData)
}

function searchTracks(token, term) {
    var url = "https://api.spotify.com/v1/search?q="+ term +"&type=track";
    var result;

    var data = $.ajax({
        url: url,
        type: 'get',
        headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
        },
        dataType: 'json',
        async: false, 
        success:function(response)
        {
            result = response
            console.log("Search for " + term);
            // console.log(JSON.stringify(result))
        },
        error: function(xhr, status, error)
        {
            console.log("Status of error message" + status + "Error is" + error);
        }
    });
    stringData = JSON.stringify(result).replace("index.html:367:23", "");
    parsedData = JSON.parse(stringData);

    if (parsedData.tracks.total > 0) {
        var myRe = /spotify:track:(.*?)"/;
        var myArray = myRe.exec(stringData);
        return myArray['1'];
    }
    return false
}

function addSongToPlaylist(token, playlistId, trackId) {
    var url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?uris=spotify:track:" + trackId
    var result;

    var data = $.ajax({
        url: url,
        type: 'post',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        dataType: 'json',
        async: false, 
        success:function(response)
        {
            result = response
            console.log("Successfully added track!");
        },
        error: function(xhr, status, error)
        {
            console.log("Status of error message" + status + "Error is" + error);
        }
    });
}

function newPlaylistTitle() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    return dateTime
}

$("#generatePlaylist").click(function(){
    var token = document.getElementById("token").value;
    var userId = document.getElementById("userId").value;
    var playlistTitle = document.getElementById("playlistTitle").value;

    if (playlistTitle.length == 0) {
        playlistTitle = newPlaylistTitle();
    }

    playlistId = createNewPlaylist(token, userId, playlistTitle);

    var txt = document.getElementById("outputText").value;
    lines = txt.split("\n");

    var resultSpotify = ""

    var bar = document.getElementById("progressBar");

    for (k in lines) {
        trackId = searchTracks(token, lines[k]);
        no = parseInt(k) + 1
        if (trackId != false) {
            artist = getTrack(token, trackId)
            resultSpotify += "<br>" + no + " " + artist
            addSongToPlaylist(token, playlistId, trackId)
        } else {
            resultSpotify += "<br>" + no
        }
        bar.setAttribute("value", parseInt(no / lines.length * 100));
    }

    txt = txt.replaceAll("\n", "<br>");
    resultSpotify = resultSpotify.replace("<br>", "");
    document.getElementById("resultText").innerHTML = "<h5 class=\"title is-5\">Text</h5> "+ txt;
    document.getElementById("resultSpotify").innerHTML = "<h5 class=\"title is-5\">Spotify</h5> "+ resultSpotify;
}); 