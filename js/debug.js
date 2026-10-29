/*
 * Debug helper: lets you open the screens that normally appear at random
 * during a game (heart attack, phone call, events, ...).
 *
 * Not loaded by default. To use it, add before </body> of the operation
 * pages (and homepage.html to toggle it there):
 *   <script src="../js/debug.js" type="text/javascript"></script>
 *
 * Enable:  add ?debug=1 to any page URL (remembered in localStorage)
 * Disable: add ?debug=0
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

            if (name === "choc" && window.gameplay) {
                $("#choc span#charge").text(gameplay.getCharge());
                $("#canvas img#pulse").hide();
                $("#canvas img#no-pulse").show();
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
        var $toggle = $("<button type='button' id='dp-debug-toggle' data-role='none'>&#128027;</button>");

        if (isOperation) {
            var addButton = function (label, fn) {
                $("<button type='button' data-role='none' />").text(label).on("click", function (e) {
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
        $("<button type='button' data-role='none' />").text("disable debug").on("click", function () {
            window.localStorage.setItem("dp-debug", "0");
            window.location.reload();
        }).appendTo($panel);

        $toggle.on("click", function (e) {
            e.stopPropagation();
            $panel.toggle();
        });

        $("<style>" +
                "#dp-debug-toggle{position:fixed;left:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:99999;" +
                "width:40px;height:40px;border-radius:20px;border:2px solid #000;background:#ffcc33;font-size:20px;line-height:1;padding:0}" +
                "#dp-debug-panel{position:fixed;left:8px;right:8px;bottom:calc(56px + env(safe-area-inset-bottom));max-height:60vh;overflow:auto;" +
                "z-index:99999;background:rgba(0,0,0,.85);padding:6px;border-radius:6px;display:flex;flex-wrap:wrap;gap:4px}" +
                "#dp-debug-panel button{font:12px/1.2 monospace;padding:6px 8px;border:0;border-radius:3px;background:#eee;color:#000}" +
                "</style>").appendTo("head");
        $("body").append($toggle, $panel);
    });
})(jQuery);
