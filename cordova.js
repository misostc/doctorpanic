setTimeout(function() {
    var e = document.createEvent('Events');
    e.initEvent('deviceready', false, false);
    document.dispatchEvent(e);
}, 0);