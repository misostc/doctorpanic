/*
 * Debug helper: lets you open the screens that normally appear at random
 * during a game (heart attack, phone call, events, ...).
 *
 * Loaded on the homepage and the operation pages, but hidden unless enabled.
 *
 * Enable/disable: tap the Doctor Panic logo on the homepage 7 times (works
 * in the Android app too), or add ?debug=1 / ?debug=0 to any page URL.
 * The setting is remembered in localStorage.
 *
 * On operation pages a bug button opens a panel listing every screen.
 * From the console: dpDebug.show("event-airco"), dpDebug.show("choc"), ...
 */
(function ($) {
    var match = /[?&]debug=([01])/.exec(window.location.search);
    if (match) {
        try {
            window.localStorage.setItem("dp-debug", match[1]);
        } catch (e) {
        }
    }

    var enabled = false;
    try {
        enabled = window.localStorage.getItem("dp-debug") === "1";
    } catch (e) {
    }

    // Hidden switch: 7 quick taps on the homepage logo
    $(function () {
        var taps = 0, timer;
        $("#homepage .intro img").on("click", function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                taps = 0;
            }, 1500);
            if (++taps < 7) {
                return;
            }
            taps = 0;
            try {
                window.localStorage.setItem("dp-debug", enabled ? "0" : "1");
            } catch (e) {
            }
            alert(enabled ? "Debug off" : "Debug on: open an operation and use the bug button");
            window.location.reload();
        });
    });

    if (!enabled) {
        return;
    }

    var isOperation = $("#operation").length > 0;

    var dpDebug = {
        screens: function () {
            var list = ["choc", "phone", "escape", "opok"];
            $("[data-role='popup'][id^='event-']").each(function () {
                list.push(this.id);
            });
            return list;
        },
        startGame: function () {
            if ($(".overlay").is(":visible")) {
                $(".overlay").click();
            }
        },
        show: function (name) {
            var $popup = $("#" + name);
            if (!$popup.length) {
                console.warn("dpDebug: no screen " + name);
                return;
            }

            dpDebug.startGame();

            // Only one jQM popup can be open at a time
            var $open = $(".ui-popup-active [data-role='popup']");
            if ($open.length && $open[0] !== $popup[0]) {
                $open.one("popupafterclose", function () {
                    setTimeout(function () {
                        dpDebug.show(name);
                    }, 50);
                });
                $open.popup("close");
                return;
            }

            // A real cardiac arrest / phone call, so the alarm or ringtone
            // (and in the app, slap listening) start as in a game
            if ((name === "choc" || name === "phone") && window.gameplay) {
                haInProgerss = false;
                pcInProgerss = false;
                if (name === "choc") {
                    gameplay.heartAttack();
                } else {
                    gameplay.phoneCall();
                }
                return;
            }

            $popup.popup({positionTo: "window"});
            $popup.popup("open");
        },
        go: function (page) {
            if (window.gameplay) {
                gameplay.saveSummary(page === "victory");
            }
            var params = window.location.search;
            var id = /[?&]id=([^&]*)/.exec(params);
            var level = /[?&]level=([^&]*)/.exec(params);
            window.location.href = page + ".html?level=" + (level ? level[1] : "easy")
                    + "&page=" + page + "&id=" + (id ? id[1] : "");
        }
    };
    window.dpDebug = dpDebug;

    $(function () {
        var $panel = $("<div id='dp-debug-panel' />").hide();
        // Plain spans: jQuery Mobile enhances <button>s and duplicates them
        var $toggle = $("<span role='button' id='dp-debug-toggle'>&#128027;</span>");

        if (isOperation) {
            var addButton = function (label, fn) {
                $("<span role='button' class='dp-btn' />").text(label).on("click", function (e) {
                    e.stopPropagation();
                    $panel.hide();
                    fn();
                }).appendTo($panel);
            };

            $.each(dpDebug.screens(), function (i, name) {
                addButton(name, function () {
                    dpDebug.show(name);
                });
            });
            addButton("victory page", function () {
                dpDebug.go("victory");
            });
            addButton("defeat page", function () {
                dpDebug.go("defeat");
            });
        }
        $("<span role='button' class='dp-btn' />").text("disable debug").on("click", function () {
            window.localStorage.setItem("dp-debug", "0");
            window.location.reload();
        }).appendTo($panel);

        $toggle.on("click", function (e) {
            e.stopPropagation();
            $panel.toggle();
        });

        $("<style>" +
                "#dp-debug-toggle{position:fixed;left:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:99999;" +
                "width:40px;height:40px;border-radius:20px;border:2px solid #000;background:#ffcc33;font-size:20px;line-height:36px;text-align:center;box-sizing:border-box}" +
                "#dp-debug-panel{position:fixed;left:8px;right:8px;bottom:calc(56px + env(safe-area-inset-bottom));max-height:60vh;overflow:auto;" +
                "z-index:99999;background:rgba(0,0,0,.85);padding:6px;border-radius:6px;display:flex;flex-wrap:wrap;gap:4px}" +
                "#dp-debug-panel .dp-btn{font:12px/1.2 monospace;padding:6px 8px;border-radius:3px;background:#eee;color:#000;cursor:pointer}" +
                "</style>").appendTo("head");
        $("body").append($toggle, $panel);
    });
})(jQuery);
