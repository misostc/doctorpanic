//
//var myMedia;
//var loop = function (status) {
//    if (status === Media.MEDIA_STOPPED) {
//        myMedia.play();
//    }
//};

var app = {
// Application Constructor
    initialize: function () {
        this.initApp();
    },
    initApp: function () {


        // Preload audio resources
            AudioHelper.preload('DrTime1Mp3', 'sounds/DrPanic_time1.ogg');
            AudioHelper.preload('DrTime2Mp3', 'sounds/DrPanic_time2.ogg');
            AudioHelper.preload('DrTime3Mp3', 'sounds/DrPanic_time3.ogg');
            AudioHelper.preload('DrTime4Mp3', 'sounds/DrPanic_time4.ogg');
            AudioHelper.preload('DrTime5Mp3', 'sounds/DrPanic_time5.ogg');
            AudioHelper.preload('heartAttackMp3', 'sounds/arret_cardiaque.ogg');
            AudioHelper.preload('phoneRingMp3', 'sounds/sound_phone.ogg');
            AudioHelper.preload('gameLostMp3', 'sounds/lost.ogg');

        AudioHelper.stopAll();

        var cLANGUAGE = null;
        // Use navigator.language for browser-based language detection
        cLANGUAGE = navigator.language || navigator.userLanguage; // Fallback for older browsers
        app.languageControls(cLANGUAGE);

        app.dd = app.today.getDate();
        app.month = app.today.getMonth() + 1; //January is 0, so always add + 1
        app.hh = app.today.getHours();
        app.mm = app.today.getMinutes();
        app.ss = app.today.getSeconds();
        app.yyyy = app.today.getFullYear();
        if (app.dd < 10) {
            app.dd = '0' + app.dd
        }
        if (app.mm < 10) {
            app.mm = '0' + app.mm
        }
        if (app.month < 10) {
            app.month = '0' + app.month
        }
        if (app.hh < 10) {
            app.hh = '0' + app.hh
        }
        if (app.ss < 10) {
            app.ss = '0' + app.ss
        }
        app.today = app.dd + ':' + app.month + ':' + app.yyyy;
        app.shareDatetime = app.yyyy + '-' + app.month + '-' + app.dd + '%20' + app.hh + ':' + app.mm + ':' + app.ss;
        app.dt = new Date();
        app.hh = app.dt.getHours();
        app.minute = app.dt.getMinutes();

        app.initSocialSharing();
    },
    patientID: GetQueryStringParams("id"),
    defeat_1: null,
    defeat_2: null,
    victory_1: null,
    victory_2: null,
    languageSpecificObject: null,
    languageSpecificURL: "",
    frenchLanguageSpecificURL: "../i18n/fr/strings_fr.json",
    englishLanguageSpecificURL: "../i18n/en/strings_en.json",
    germanLanguageSpecificURL: "../i18n/de/strings_de.json",
    today: new Date(),
    dd: null,
    month: null,
    hh: null,
    mm: null,
    ss: null,
    yyyy: null,
    shareDatetime: null,
    dt: new Date(),
    chrName: null,
    pageName: null,

    //Function to make network call according to language on load
    languageControls: function (language) {
//                            alert(language.toString());

        // first, check if language is stored in local storage
        if (window.localStorage.getItem("language")) {
            language = window.localStorage.getItem("language");
        }
        
        if ((language.toString() == "cs") || (language.toString() == "czech") || (language.toString().indexOf("cs") != -1)) {
            lang_code = "cs";
            app.languageSpecificURL = "../i18n/cs/strings_cs.json";
            $("#curr_datetime").html("Dne " + app.today + " v " + app.hh + "h" + app.minute + " v jednoduchém režimu");
            app.defeat_1 = ", čas úmrtí:";
            app.defeat_2 = "";
            app.victory_1 = ", čas záchrany:";
            app.victory_2 = "";
            $("#tutorialVideo").prop("src", "https://www.youtube.com/embed/R9MSQNvIVRA?autoplay=1");
        } else if ((language.toString() == "fr") || (language.toString() == "french") || (language.toString().indexOf("fr") != -1)) {
            lang_code = "fr";
            app.languageSpecificURL = app.frenchLanguageSpecificURL;
            $("#curr_datetime").html("Le " + app.today + " &agrave; " + app.hh + "h" + app.minute + " en mode facile");
            app.defeat_1 = ", heure du decees:";
            app.defeat_2 = "";
            app.victory_1 = ", le temps de sauver:";
            app.victory_2 = "";
            $("#tutorialVideo").prop("src", "https://www.youtube.com/embed/R9MSQNvIVRA?autoplay=1");
        }
        else if ((language.toString() == "de") || (language.toString() == "deutsch") || (language.toString().indexOf("de") != -1)) {
            lang_code = "de";
            app.languageSpecificURL = app.germanLanguageSpecificURL;
            $("#curr_datetime").html("Am " + app.today + " " + app.hh + "h" + app.minute + " mit Schwierigkeit â€ždiscoveryâ€œ");
            app.defeat_1 = ", dÃ¸dstidspunktet:";
            app.defeat_2 = "";
            app.victory_1 = ", cirka gemme:";
            app.victory_2 = "";
            $("#tutorialVideo").prop("src", "https://www.youtube.com/embed/VQOSZ_cLJ4g?autoplay=1");
        }
        else {
            //Default English
            lang_code = "en";
            app.languageSpecificURL = app.englishLanguageSpecificURL;
            $("#curr_datetime").html("The " + app.today + " " + app.hh + "h" + app.minute + " in intro mode");
            app.defeat_1 = ", time of death:";
            app.defeat_2 = "";
            app.victory_1 = ", time of save:";
            app.victory_2 = "";
            $("#tutorialVideo").prop("src", "https://www.youtube.com/embed/VQOSZ_cLJ4g?autoplay=1");
        }
        //Make an ajax call to strings.json files
        app.onNetworkCall(app.languageSpecificURL, function (msg) {
            app.languageSpecificObject = msg;
            $(".languagespecificHTML").each(function () {
                $(this).html(app.languageSpecificObject.languageSpecifications[0][$(this).data("text")]);
            });
            $(".languageSpecificPlaceholder").each(function () {
                $(this).attr("placeholder", app.languageSpecificObject.languageSpecifications[0][$(this).data("text")]);
            });
            $(".languageSpecificValue").each(function () {
                $(this).attr("value", app.languageSpecificObject.languageSpecifications[0][$(this).data("text")]);
            });
        });
    },
    //Function to get specific value with unique key
    getLanguageValue: function (key) {
        value = app.languageSpecificObject.languageSpecifications[0][key];
        return value;
    },
    //Network Call
    onNetworkCall: function (urlToHit, successCallback) {
        $.ajax({
            type: "GET",
            url: urlToHit,
            timeout: 30000,
        }).done(function (msg) {
            successCallback(msg);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            alert("Internal Server Error");
        });
    },
    initSocialSharing: function() {
        app.chrName = window.localStorage.getItem('ch_name');
        app.pageName = window.localStorage.getItem('pageName');
        $(".operationVictory").html(app.chrName);

        if (app.pageName == "victory") {
            var imagePath = "www/FBShare/" + app.chrName + "-alive.jpg";
            $(".FBShare").click(function () {
                var facebookShareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent("http://docpanic.com/game/" + lang_code + "/share/" + app.patientID + "/win/" + app.shareDatetime);
                window.open(facebookShareUrl, '_system');
            });
        }
        else {
            var imagePath = "www/FBShare/" + app.chrName + "-dead.jpg";
            $(".FBShare").click(function () {
                var facebookShareUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent("http://docpanic.com/game/" + lang_code + "/share/" + app.patientID + "/lost/" + app.shareDatetime);
                window.open(facebookShareUrl, '_system');
            });
        }
    }
};
app.initialize();
function loadIframe(iframeName, url) {
    var $iframe = $('#' + iframeName);
    if ($iframe.length) {
        $iframe.attr('src', url);
        return false;
    }
    return true;
}

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