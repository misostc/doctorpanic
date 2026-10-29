/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var patientId = GetQueryStringParams("id");
var gameplay = gameplay || {
    init: function () {
        gameEnded = false;

//        var sounds = [
//            {src: "DrPanic_time1.mp3", id: heartBeepAudio1},
//            {src: "DrPanic_time2.mp3", id: heartBeepAudio2},
//            {src: "DrPanic_time3.mp3", id: heartBeepAudio3},
//            {src: "DrPanic_time4.mp3", id: heartBeepAudio4},
//            {src: "DrPanic_time5.mp3", id: heartBeepAudio5},
//            {src: "arret_cardiaque.mp3", id: heartAttackAudio},
//            {src: "sound_phone.mp3", id: phoneCallAudio},
//            {src: "lost.mp3", id: gameLostAudio}
//        ];

//        createjs.Sound.alternateExtensions = ["mp3"];
//        createjs.Sound.registerSounds(sounds, assetsPath);

        var startTime = gameDuration / 1000;
        var minutes = Math.floor(startTime / 60);
        var seconds = Math.floor(startTime % 60);

        var secondsString = seconds.toString();
        while (secondsString.length < 2) {
            secondsString = '0'.concat(secondsString);
        }

        $("#clock").text(minutes.toString() + ":" + secondsString);

        $(".power-charge a.btn").click(gameplay.hover_fix);
        gameplay.keepScreenOn();
    },
    // Browser/PWA only (the Android app does this natively). The lock is
    // dropped whenever the page is hidden, so take it again on return
    keepScreenOn: function () {
        if (window.DPNative || !navigator.wakeLock) {
            return;
        }
        var request = function () {
            if (document.visibilityState === "visible") {
                navigator.wakeLock.request("screen").catch(function () {
                });
            }
        };
        request();
        document.addEventListener("visibilitychange", request);
    },
    recover: function () {
        gameplay.listenForSlap(false);
        if (gameEnded) {
            return;
        }
        gameplay.playShock();

        console.log("recover");

        console.log(successArr);
        var success = successArr[Math.floor(Math.random() * successArr.length)];
        console.log(success);

        if (!success) {
            haInProgerss = false;
            recover_attempts++;

            setTimeout(function () {
                gameplay.heartAttack(recover_attempts);
            }, 1000);
        }
        else {
            recover_attempts = 1;
            completedHAs++;

            $("#canvas img#pulse").show();
            $("#canvas img#no-pulse").hide();

            if (pendingHA) {
                setTimeout(function () {
                    gameplay.heartAttack(recover_attempts);
                }, 1000);
            }

            if (pendingPC) {
                setTimeout(function () {
                    gameplay.phoneCall();
                }, 1000);
            }
        }

        haInProgerss = false;
        heartAttacksCompleted++;

                    //createjs.Sound.stop();
        
                    AudioHelper.stopAll();
        
        
        
        
                    gameplay.startLapAudio();    },
    heartAttack: function (recover_attempt) {
        if (recover_attempt === undefined) {
            recover_attempt = 1;
        }

        if (gameEnded || gamePaused) {
            return;
        }

        console.log("heartAttack");
        if (haInProgerss || pcInProgerss) {
            pendingHA = true;
            return;
        }

        haInProgerss = true;
        pendingHA = false;

        for (var i = 0; i < successRate; i++) {
            successArr[i] = false;
        }

        for (var i = 0; i < recover_attempt; i++) {
            successArr[i] = true;
        }

        $("#canvas img#pulse").hide();
        $("#canvas img#no-pulse").show();

        var charge = gameplay.getCharge();
        $("#choc span#charge").text(charge);
        $("#choc").popup("open");
        gameplay.listenForSlap(true);

        AudioHelper.stopAll();

        AudioHelper.loop('heartAttackMp3');

        //createjs.Sound.play(heartAttackAudio, ppc);
    },
    getCharge: function () {
        var charge = gameplay.generateCharge();
        return charge;
    },
    generateCharge: function () {
        var newCharge = 0;
        do {
            newCharge = Math.floor((Math.random() * 100000) + 1000);
            console.log(newCharge);
        } while (!gameplay.validCharge(newCharge));

        return newCharge;
    },
    validCharge: function (charge) {
        for (var k = 0; k < usedCharges.length; k++) {
            var usedCharge = usedCharges[k];
            if (charge === usedCharge) {
                return false;
            }
        }

        var str = charge.toString();

        if (str.length < 4 || str.length > 5) {
            return false;
        }

        for (var i = 0; i < str.length; i++) {
            var key_chr = str[i];
            var count = 0;

            for (var j = 0; j < str.length; j++) {
                var chr = str[j];
                if (chr === key_chr) {
                    count++;
                }
            }

            if (count > 1) {
                return false;
            }
        }

        usedCharges.push(charge);
        return true;
    },
    startLapAudio: function () {
        switch (currentLap) {
            case 1:
//                createjs.Sound.stop();
//                createjs.Sound.play(heartBeepAudio1, ppc);

                AudioHelper.stopAll();

                AudioHelper.loop('DrTime1Mp3');
                break;
            case 2:
//                createjs.Sound.stop();
//                createjs.Sound.play(heartBeepAudio2, ppc);

                AudioHelper.stopAll();

                AudioHelper.loop('DrTime2Mp3');
                break;
            case 3:
//                createjs.Sound.stop();
//                createjs.Sound.play(heartBeepAudio3, ppc);

                AudioHelper.stopAll();

                AudioHelper.loop('DrTime3Mp3');
                break;
            case 4:
//                createjs.Sound.stop();
//                createjs.Sound.play(heartBeepAudio4, ppc);

                AudioHelper.stopAll();

                AudioHelper.loop('DrTime4Mp3');
                break;
            case 5:
//                createjs.Sound.stop();
//                createjs.Sound.play(heartBeepAudio5, ppc);

                AudioHelper.stopAll();

                AudioHelper.loop('DrTime5Mp3');
                break;
            default:
                break;
        }
    },
    validEvent: function (event) {
        for (var k = 0; k < usedEvents.length; k++) {
            var usedEvent = usedEvents[k];
            if (event === usedEvent) {
                return false;
            }
        }

        usedEvents.push(event);
        return true;
    },
    hangUp: function () {
        if (gameEnded) {
            return;
        }

        console.log("hangUp");

        pcInProgerss = false;
        if (pendingHA) {
            setTimeout(function () {
                gameplay.heartAttack();
            }, 1000);
        }

        if (pendingPC) {
            setTimeout(function () {
                gameplay.phoneCall();
            }, 1000);
        }

        completedPCs++;
    },
    endCall: function () {
        if (gameEnded) {
            return;
        }

        do {
            var event = events[Math.floor(Math.random() * events.length)];
            console.log(event);

        } while (!gameplay.validEvent(event));

        $("#phone").popup("close");

        $("#event-" + event).popup({positionTo: "window"});
        $("#event-" + event).popup("open");

        phoneCallsCompleted++;

//        createjs.Sound.stop();

        AudioHelper.stopAll();

        gameplay.startLapAudio();
    },
    phoneCall: function () {
        if (gameEnded || gamePaused) {
            return;
        }

        console.log("phoneCall");
        if (haInProgerss || pcInProgerss) {
            pendingPC = true;
            return;
        }

        pcInProgerss = true;
        pendingPC = false;

        $("#phone").popup("open");

//        createjs.Sound.stop();

        AudioHelper.stopAll();

        AudioHelper.loop('phoneRingMp3');
//        createjs.Sound.play(phoneCallAudio, ppc);
    },
    startLap: function () {
        currentLap++;
        console.log("Lap: " + currentLap.toString());

        if (haInProgerss || pcInProgerss) {
            return;
        }

        gameplay.startLapAudio();
    },
    startGame: function () {
        // Runs on the "tap to start" tap: browsers only allow audio
        // contexts created or resumed during a user gesture
        gameplay.audioContext();
//        createjs.Sound.stop();
        AudioHelper.stopAll();

        $("header").click(function () {
            gameplay.gamePause();
            $("#escape").popup("open");
        });
        $("#pause, #done").click(gameplay.gamePause);
        $("#resume-game, #patient-not-save").click(gameplay.gameResume);

        $("#canvas img#pulse").show();

        $(".choc").popup({
            afterclose: gameplay.recover
        });


        $(".callof").click(gameplay.hangUp);

        $("#phone").popup({
            afterclose: gameplay.endCall
        });

        $("#resume-game, #patient-not-save").click(function () {

            if (haInProgerss || pcInProgerss || pendingHA || pendingPC) {
//                $.mobile.changePage( "/pages/defeat", { 
//                    transition: "slideup", 
//                    changeHash: false,
//                    reloadPage: true
//                });
                gameplay.saveSummary(false);
                window.location.href = "defeat.html?level=" + d_level + "&page=defeat&id=" + patientId;
            }
            else {
                $("#opok").popup("close");
                $("#escape").popup("close");
            }
        });

        $("#patient-save").click(function () {
            gameWon = true;
            gameplay.endGame();
        });

        gameplay.setGameEvents();
    },
    setGameEvents: function () {
        var lapTime = gameDuration / laps;
        var lapTimeHA = gameDuration / heartAttacks;

        var lapDelay = elapsedTime;
        var lastLapEnd = 0;

        for (var i = 0; i < laps; i++) {
            var lapStartTime = lastLapEnd;
            var lapEndTime = lapStartTime + lapTime;

            if (lapDelay > 0) {
                lapEndTime = lapStartTime + lapTime - lapDelay;
                lapDelay = lapDelay - lapTime;
            }

            var effectiveLapTime = (lapEndTime - lapStartTime) - (minimumInterval * 2);

            if (lapEndTime < 0 || effectiveLapTime < minimumInterval) {
                continue;
            }

            setTimeout(gameplay.startLap, lapStartTime);
            lastLapEnd = lapEndTime;

            console.log("Lap: " + i.toString() + " -> " + (lapStartTime / 1000).toString() + " - " + (lapEndTime / 1000).toString());
        }

        lapDelay = elapsedTime;
        var lastLapEndHA = 0;

        for (var i = 0; i < heartAttacks; i++) {
            var lapStartTime = lastLapEndHA;
            var lapEndTime = lapStartTime + lapTimeHA;

            if (lapDelay > 0) {
                lapEndTime = lapStartTime + lapTimeHA - lapDelay;
                lapDelay = lapDelay - lapTimeHA;
            }

            var effectiveLapTime = (lapEndTime - lapStartTime) - (minimumInterval * 2);

            if (lapEndTime < 0 || effectiveLapTime < minimumInterval) {
                continue;
            }

            var haTime = gameplay.getRandomTime(lapStartTime + minimumInterval, lapEndTime - (minimumInterval * 2));
            var pcTime = gameplay.getRandomTime(haTime + minimumInterval, lapEndTime - minimumInterval);

            setTimeout(gameplay.heartAttack, haTime);
            setTimeout(gameplay.phoneCall, pcTime);
            lastLapEndHA = lapEndTime;

            console.log("Lap HA: " + i.toString() + " -> " + (lapStartTime / 1000).toString() + " - " + (lapEndTime / 1000).toString());

            console.log("HA: " + (haTime / 1000).toString());
            console.log("PC: " + (pcTime / 1000).toString());
        }



        setTimeout(gameplay.startLap, last_lap - elapsedTime);

        setTimeout(gameplay.endGame, gameDuration - elapsedTime);
        setInterval(gameplay.updateClock, 1000);
    },
    getRandomTime: function (startTime, endtime) {
        do {
            var randomTime = gameplay.generateRandomTime(startTime, endtime);
        } while (!gameplay.validTime(randomTime, endtime));

        return randomTime;
    },
    generateRandomTime: function (startTime, endtime) {
        return Math.floor((Math.random() * endtime) + startTime);
    },
    validTime: function (randomTime, lapEndTime) {
        if (randomTime > lapEndTime) {
            return false;
        }

        return true;
    },
    endGame: function () {
        console.log("endGame");
        $("#canvas img#pulse").hide();
        $("#canvas img#no-pulse").hide();

        gameEnded = true;
        gameplay.listenForSlap(false);

        var id = window.setTimeout(function () {
        }, 0);
        while (id--) {
            window.clearTimeout(id);
        }

        $("#clock").text("00:00");

        gameplay.saveSummary(gameWon && !haInProgerss && !pcInProgerss);

        if (haInProgerss || pcInProgerss || !gameWon) {
//            createjs.Sound.stop();

            AudioHelper.stopAll();

            AudioHelper.play('gameLostMp3');

            //setTimeout(function () {
//                $(":mobile-pagecontainer").pagecontainer("change", "/pages/defeat", {
//                    role: "page",
//                    reloadPage: true,
//                    transition: "slideup"
//                });
            window.location.href = "defeat.html?level=" + d_level + "&page=defeat&id=" + patientId;
            //}, 8000);
        }
        else {
//            $(":mobile-pagecontainer").pagecontainer("change", "/pages/victory", {
//                role: "page",
//                reloadPage: true,
//                transition: "slideup"
//            });
            window.location.href = "victory.html?level=" + d_level + "&page=victory&id=" + patientId;
        }
    },
    audioContext: function () {
        var Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) {
            return null;
        }
        if (!gameplay.audio) {
            gameplay.audio = new Context();
        }
        if (gameplay.audio.state === "suspended") {
            gameplay.audio.resume();
        }
        return gameplay.audio;
    },
    // Defibrillator zap, synthesized: a noise burst through a falling
    // band-pass filter over a dropping low hum
    playShock: function () {
        var ctx = gameplay.audioContext();
        if (!ctx) {
            return;
        }
        var now = ctx.currentTime, duration = 0.5;

        var buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
        var samples = buffer.getChannelData(0);
        for (var i = 0; i < samples.length; i++) {
            samples[i] = Math.random() * 2 - 1;
        }
        var noise = ctx.createBufferSource();
        noise.buffer = buffer;
        var filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.Q.value = 1.5;
        filter.frequency.setValueAtTime(4000, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + duration);

        var hum = ctx.createOscillator();
        hum.type = "sawtooth";
        hum.frequency.setValueAtTime(140, now);
        hum.frequency.exponentialRampToValueAtTime(35, now + duration);

        var gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.8, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        hum.connect(gain);
        gain.connect(ctx.destination);
        noise.start(now);
        hum.start(now);
        noise.stop(now + duration);
        hum.stop(now + duration);
    },
    // Android app only: the native shell listens on the microphone while the
    // defibrillator screen is open and calls onSlap() on a loud slap
    listenForSlap: function (listen) {
        if (window.DPNative) {
            var enabled = true;
            try {
                // Homepage toggle
                enabled = window.localStorage.getItem("dp-slap") !== "off";
            } catch (e) {
            }
            if (listen && enabled) {
                DPNative.startSlap();
            } else {
                DPNative.stopSlap();
                $("#slap-meter").hide();
            }
        }
    },
    // level and threshold are peaks as a fraction of full scale; shown on a
    // -60..0 dB scale with a mark where a slap is loud enough. jolted: the
    // accelerometer felt the table being hit
    onMicLevel: function (level, threshold, jolted) {
        var toScale = function (peak) {
            var db = 20 * Math.log(Math.max(peak, 0.001)) / Math.LN10;
            return Math.min(100, Math.max(0, (db + 60) / 60 * 100));
        };
        var $meter = $("#slap-meter");
        if (!$meter.length) {
            $meter = $("<div id='slap-meter'><div class='slap-level'></div><div class='slap-threshold'></div></div>").appendTo("body");
        }
        if (!haInProgerss || gameEnded) {
            $meter.hide();
            return;
        }
        $meter.show();
        $meter.find(".slap-level").css("width", toScale(level) + "%").toggleClass("loud", level >= threshold);
        $meter.find(".slap-threshold").css("left", toScale(threshold) + "%");
        if (jolted) {
            $meter.addClass("jolt");
            clearTimeout(gameplay.joltTimer);
            gameplay.joltTimer = setTimeout(function () {
                $meter.removeClass("jolt");
            }, 250);
        }
    },
    onSlap: function () {
        if (haInProgerss && !gameEnded) {
            $("#choc").popup("close");
        }
    },
    saveSummary: function (won) {
        // Read by the victory/defeat page to show what happened in this game
        var summary = {
            won: won,
            patient: $.trim($(".content.op h2").text()),
            level: d_level,
            elapsed: elapsedTime,
            heartAttacks: completedHAs,
            phoneCalls: completedPCs,
            date: new Date().getTime()
        };
        try {
            window.localStorage.setItem("lastGame", JSON.stringify(summary));
        } catch (e) {
        }
    },
    gamePause: function () {
        if (gamePaused) {
            return;
        }
        console.log("gamePause");

        gamePaused = true;
        currentLap--;

        var id = window.setTimeout(function () {
        }, 0);
        while (id--) {
            window.clearTimeout(id);
        }

//        createjs.Sound.stop();

        AudioHelper.stopAll();

    },
    gameResume: function () {
        console.log("gameResume");

        gamePaused = false;

        gameplay.setGameEvents();
    },
    updateClock: function () {
        if (gamePaused) {
            return;
        }

        elapsedTime = elapsedTime + 1000;
        var timeRemaining = Math.floor((gameDuration - elapsedTime) / 1000);

        var minutes = Math.floor(timeRemaining / 60);
        var seconds = Math.floor(timeRemaining % 60);

        var secondsString = seconds.toString();
        while (secondsString.length < 2) {
            secondsString = '0'.concat(secondsString);
        }

        $("#clock").text(minutes.toString() + ":" + secondsString);
    },
    hover_fix: function () {
        console.log("hoverfix");

        $(this).clone(true).insertAfter($(this));
        $(this).remove();
    }
};

