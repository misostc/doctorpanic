/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$(document).ready(function () {
    //window.plugins.orientationLock.lock("landscape");
    var d_level = GetQueryStringParams('level');
    var patientId = GetQueryStringParams("id");
    //$("#set_level").html("(" + d_level);

    $(".redirectHome").click(function () {
        window.location.href = "homepage.html";
    });

    $(".patientList").click(function () {
        window.location.href = "patient-list.html?level=" + d_level;
    });

    $(".redirectVictory").click(function () {
        window.location.href = "victory.html?level=" + d_level + "&page=victory&id=" + patientId;
    });

    var char_picture = $(".getPic img").attr("src");
    var getPage = GetQueryStringParams("page");

    if (getPage == "victory") {
        if (getPage != undefined) {
            var imagePath = window.localStorage.getItem('imagePath');
            var strArray = imagePath.split("/");
            var ch_name = strArray[3];
            ch_name = ch_name.substr(0, ch_name.length - 4);
            window.localStorage.setItem('ch_name', ch_name);
            window.localStorage.setItem('pageName', getPage);
            //Put Victory image from completd folder which from images folder
            $(".putpic img").attr("src", "../images/completed/" + ch_name + "-alive.png");
        }
        else {
            window.localStorage.setItem('imagePath', char_picture);
        }
    }
    else if (getPage == "defeat")
    {
        if (getPage != undefined) {
            var imagePath = window.localStorage.getItem('imagePath');
            var strArray = imagePath.split("/");
            var ch_name = strArray[3];
            ch_name = ch_name.substr(0, ch_name.length - 4);
            window.localStorage.setItem('ch_name', ch_name);
            window.localStorage.setItem('pageName', getPage);
            //Put Victory image from completd folder which from images folder
            $(".putpic img").attr("src", "../images/completed/" + ch_name + "-dead.png");
        }
    }
    else {
        window.localStorage.setItem('imagePath', char_picture);
    }
});

function GetQueryStringParams(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

