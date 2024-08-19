//const publicSpreadsheetDoc = "https://script.google.com/macros/s/AKfycbxqQ0yYwkq8O7i39qGEfCvoltohnI2zNJQVow1Eq9U91PvG64aQDNiWj-MKaZorc5I/exec?req=pocketbook" // a bit slow, but works.
const publicSpreadsheetDoc = "https://opensheet.elk.sh/1-XABpNzY6jgg_Bh9KaDKS-pPNgGF22d_yAxqKOAM6RI/FoE%20Tips"; // opensource redirect for google sheet w/o auth
let isSticky = false;

/**
 * Load the public sheet data, add anchorJS and
 * if there's an anchor hash, reload to force scroll
 * after content has been loaded.
 */
$(function() 
{
    fetch(publicSpreadsheetDoc)
    .then(response => response.json())
    .then(data => {
        // Format the sheet data
        new formatData(data);

        // Force reload the hash if there's one, after the content is loaded.
        setTimeout(function() {
            if (window.location.hash) {
                const hash = window.location.hash;
                window.location.hash = "";
                window.location.hash = hash;
            }
        }, 500);

        // Setup anchor links on h2, h4
        anchors.options.visible = "touch";
        anchors.add("#content h2, #content h4");
        $(".anchorjs-link").each(function() {
            const el = $(this);
            el.on("click", handleAnchorClick);
            el.attr("data-bs-toggle", "tooltip");
            el.attr("data-bs-placement", "right");
            el.addClass("text-decoration-none");
        })
        $(`[data-bs-toggle="tooltip"]`).tooltip({trigger : "manual"});

        // Plug in image lightbox
        $(`a[data-toggle="lightbox"]`).each(function() {
            const el = $(this);
            el.on("click", function(event) {
                event.preventDefault();
                const lightbox = new Lightbox(el.get(0));
                lightbox.show();
            })
        })

        // Hide loading indicator
        $("#content > div:first-child").addClass("d-none");
    })
})

/**
 * Sticky navigation change bg color on scroll,
 * display back to top button.
 */
$(document).on("scroll", function()
{
    if ($(this).scrollTop() < 300) {
        isSticky = false;
        $(".sticky-top").removeClass("sticky");
    } 
    else if (!isSticky) {
        isSticky = true;
        $(".sticky-top").addClass("sticky");
    }
})

/**
 * Show bs tooltip event. 
 * Hide it after time has passed.
 */
$(document).on("show.bs.tooltip", function ()
{
    setTimeout(function() {
        $(`[data-bs-toggle="tooltip"]`).tooltip("hide");
    }, 1500);
})

/**
 * Copy the href to the clipboard and
 * display a tooltip as feedback.
 */
function handleAnchorClick()
{
    navigator.clipboard.writeText(this.href);
    
    // Set copied tooltip
    const el = $(this);
    el.on("hidden.bs.tooltip", () => el.tooltip("dispose"));
    // Update tooltip value and display it.
    el.attr("data-bs-original-title", "Copied!");
    el.tooltip("show");
}
