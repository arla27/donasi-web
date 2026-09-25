(function () {
    "use strict";

    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    });

    document.addEventListener("dragstart", function (e) {
        if (e.target && e.target.tagName === "IMG") {
            e.preventDefault();
        }
    });

    document.addEventListener("keydown", function (e) {

        const key = String(e.key || "").toLowerCase();

        if (e.key === "F12") {
            e.preventDefault();
            return;
        }

        if (e.ctrlKey && e.shiftKey && key === "i") {
            e.preventDefault();
            return;
        }

        if (e.ctrlKey && e.shiftKey && key === "j") {
            e.preventDefault();
            return;
        }

        if (e.ctrlKey && e.shiftKey && key === "c") {
            e.preventDefault();
            return;
        }

        if (e.ctrlKey && key === "u") {
            e.preventDefault();
            return;
        }

        if (e.ctrlKey && key === "s") {
            e.preventDefault();
            return;
        }

        if (e.ctrlKey && key === "p") {
            e.preventDefault();
            return;
        }

    });

})();
