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
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {


        var scheme;

// Don't forget to add the cordova-plugin-device plugin for `device.platform`
        if (device.platform === 'iOS') {
            scheme = 'fb://';
        }
        else if (device.platform === 'Android') {
            scheme = 'com.facebook.katana';
        }
//        appAvailability.check(
//                scheme, // URI Scheme or Package Name
//                function () {  // Success callback
//                    NSLogger.log(scheme + ' is available :)');
//                },
//                function () {  // Error callback
//                    NSLogger.log(scheme + ' is not available :(');
//                }
//        );


        if (window.plugins && window.plugins.NativeAudio) {
            // Preload audio resources
            window.plugins.NativeAudio.preloadComplex('DrTime1Mp3', 'sounds/DrPanic_time1.mp3', 1, 1, 0, function (msg) {
            }, function (msg) {
                console.log('error: ' + msg);
            });
            window.plugins.NativeAudio.preloadComplex('DrTime2Mp3', 'sounds/DrPanic_time2.mp3', 1, 1, 0, function (msg) {
            }, function (msg) {
                console.log('error: ' + msg);
            });
            window.plugins.NativeAudio.preloadComplex('DrTime3Mp3', 'sounds/DrPanic_time3.mp3', 1, 1, 0, function (msg) {
            }, function (msg) {
                console.log('error: ' + msg);
            });
            window.plugins.NativeAudio.preloadComplex('DrTime4Mp3', 'sounds/DrPanic_time4.mp3', 1, 1, 0, function (msg) {
            }, function (msg) {
                console.log('error: ' + msg);
            });
            window.plugins.NativeAudio.preloadComplex('DrTime5Mp3', 'sounds/DrPanic_time5.mp3', 1, 1, 0, function (msg) {
            }, function (msg) {
                console.log('error: ' + msg);
            });
            window.plugins.NativeAudio.preloadComplex('heartAttackMp3', 'sounds/arret_cardiaque.mp3', 1, 1, 0, function (msg) {
            }, function (msg) {
                console.log('error: ' + msg);
            });
            window.plugins.NativeAudio.preloadComplex('phoneRingMp3', 'sounds/sound_phone.mp3', 1, 1, 0, function (msg) {
            }, function (msg) {
                console.log('error: ' + msg);
            });
            window.plugins.NativeAudio.preloadComplex('gameLostMp3', 'sounds/lost.mp3', 1, 1, 0, function (msg) {
            }, function (msg) {
                console.log('error: ' + msg);
            });
        }

        if (window.plugins.NativeAudio.play) {
            window.plugins.NativeAudio.stop('DrTime1Mp3');
            window.plugins.NativeAudio.stop('DrTime2Mp3');
            window.plugins.NativeAudio.stop('DrTime3Mp3');
            window.plugins.NativeAudio.stop('DrTime4Mp3');
            window.plugins.NativeAudio.stop('DrTime5Mp3');
            window.plugins.NativeAudio.stop('heartAttackMp3');
            window.plugins.NativeAudio.stop('phoneRingMp3');
        }

        app.receivedEvent('deviceready');
        var cLANGUAGE = null;
        navigator.globalization.getPreferredLanguage(
                //Get Language from Settings
                        function (locale) {
                            cLANGUAGE = locale.value;
                            languageControls(cLANGUAGE);
                        },
                        //On Failure set language to english
                                function () {
                                    cLANGUAGE = "en";
                                }
                        );
                        var patientID = GetQueryStringParams("id");
                        
                        var defeat_1;
                        var defeat_2;
                        var victory_1;
                        var victory_2;
                        var languageSpecificObject = null;
                        var languageSpecificURL = "";
                        var frenchLanguageSpecificURL = "../i18n/fr/strings_fr.json";
                        var englishLanguageSpecificURL = "../i18n/en/strings_en.json";
                        var germanLanguageSpecificURL = "../i18n/de/strings_de.json";
                        var today = new Date();
                        var dd = today.getDate();
                        var month = today.getMonth() + 1; //January is 0, so always add + 1
                        var hh = today.getHours();
                        var mm = today.getMinutes();
                        var ss = today.getSeconds();
                        var yyyy = today.getFullYear();
                        if (dd < 10) {
                            dd = '0' + dd
                        }
                        if (mm < 10) {
                            mm = '0' + mm
                        }
                        if (month < 10) {
                            month = '0' + month
                        }
                        if (hh < 10) {
                            hh = '0' + hh
                        }
                        if (ss < 10) {
                            ss = '0' + ss
                        }
                        today = dd + ':' + month + ':' + yyyy;
                        var shareDatetime = yyyy + '-' + month + '-' + dd + '%20' + hh + ':' + mm + ':' + ss;
                        var dt = new Date();
                        var hh = dt.getHours();
                        var minute = dt.getMinutes();
                        //Function to make network call according to language on load
                        var languageControls = function (language) {
//                            alert(language.toString());
                            if ((language.toString() == "fr") || (language.toString() == "french") || (language.toString().indexOf("fr") != -1)) {
                                lang_code = "fr";
                                languageSpecificURL = frenchLanguageSpecificURL;
                                $("#curr_datetime").html("Le " + today + " &agrave; " + hh + "h" + minute + " en mode facile");
                                defeat_1 = ", heure du decees:";
                                defeat_2 = "";
                                victory_1 = ", le temps de sauver:";
                                victory_2 = "";
                                $("#tutorialVideo").prop("src", "https://www.youtube.com/embed/R9MSQNvIVRA?autoplay=1");
                            }
                            else if ((language.toString() == "de") || (language.toString() == "deutsch") || (language.toString().indexOf("de") != -1)) {
                                lang_code = "de";
                                languageSpecificURL = germanLanguageSpecificURL;
                                $("#curr_datetime").html("Am " + today + " " + hh + "h" + minute + " mit Schwierigkeit â€ždiscoveryâ€œ");
                                defeat_1 = ", dÃ¸dstidspunktet:";
                                defeat_2 = "";
                                victory_1 = ", cirka gemme:";
                                victory_2 = "";
                                $("#tutorialVideo").prop("src", "https://www.youtube.com/embed/VQOSZ_cLJ4g?autoplay=1");
                            }
                            else {
                                //Default English
                                lang_code = "en";
                                languageSpecificURL = englishLanguageSpecificURL;
                                $("#curr_datetime").html("The " + today + " " + hh + "h" + minute + " in intro mode");
                                defeat_1 = ", time of death:";
                                defeat_2 = "";
                                victory_1 = ", time of save:";
                                victory_2 = "";
                                $("#tutorialVideo").prop("src", "https://www.youtube.com/embed/VQOSZ_cLJ4g?autoplay=1");
                            }
                            //Make an ajax call to strings.json files
                            onNetworkCall(languageSpecificURL, function (msg) {
                                languageSpecificObject = JSON.parse(msg);
                                $(".languagespecificHTML").each(function () {
                                    $(this).html(languageSpecificObject.languageSpecifications[0][$(this).data("text")]);
                                });
                                $(".languageSpecificPlaceholder").each(function () {
                                    $(this).attr("placeholder", languageSpecificObject.languageSpecifications[0][$(this).data("text")]);
                                });
                                $(".languageSpecificValue").each(function () {
                                    $(this).attr("value", languageSpecificObject.languageSpecifications[0][$(this).data("text")]);
                                });
                            });
                        };
                        //Function to get specific value with unique key
                        var getLanguageValue = function (key) {
                            value = languageSpecificObject.languageSpecifications[0][key];
                            return value;
                        };
                        //Network Call
                        var onNetworkCall = function (urlToHit, successCallback) {
                            $.ajax({
                                type: "POST",
                                url: urlToHit,
                                timeout: 30000,
                            }).done(function (msg) {
                                successCallback(msg);
                            }).fail(function (jqXHR, textStatus, errorThrown) {
                                alert("Internal Server Error");
                            });
                        }
                        var chrName = window.localStorage.getItem('ch_name');
                        var pageName = window.localStorage.getItem('pageName');
                        $(".operationVictory").html(chrName);



                        if (pageName == "victory") {
                            var imagePath = "www/FBShare/" + chrName + "-alive.jpg";
                            //var sharedlink = "http://docpanic.com/game/" + lang_code + "/share/" + patientID + "/win/" + shareDatetime;

                            $(".FBShare").click(function () {

                                //window.plugins.socialsharing.shareViaFacebook(chrName + victory_1 + today + " " + hh + "h" + minute, imagePath, null,
                                window.plugins.socialsharing.shareViaFacebook("", null, "http://docpanic.com/game/" + lang_code + "/share/" + patientID + "/win/" + shareDatetime,
                                        function () {
                                            console.log('share ok')
                                        },
                                        function (errormsg) {
                                            console.log('share cancel')
                                            //alert("Please install Facebook mobile app to enable sharing.");
                                        })
                            });
                        }
                        else {
                            var imagePath = "www/FBShare/" + chrName + "-dead.jpg";
                            $(".FBShare").click(function () {
//                                window.plugins.socialsharing.shareViaFacebook(chrName + defeat_1 + today + " " + hh + "h" + minute, imagePath, null,
                                window.plugins.socialsharing.shareViaFacebook("", null, "http://docpanic.com/game/" + lang_code + "/share/" + patientID + "/lost/" + shareDatetime,
                                        function () {
                                            console.log('share ok')
                                        },
                                        function (errormsg) {
                                            //alert("Please install Facebook mobile app to enable sharing.")
                                            console.log('share cancel')
                                        })
                            });
                        }
                    },
            receivedEvent: function (id) {

                console.log('Received Event: ' + id);
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