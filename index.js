const publicSpreadsheetDoc = "https://opensheet.elk.sh/1-XABpNzY6jgg_Bh9KaDKS-pPNgGF22d_yAxqKOAM6RI/FoE%20Tips"; // opensource redirect for google sheet w/o auth
let isSticky = false;

function __init__() {
    /*  Load the public sheet data, add anchorJS and
        if there's an anchor hash, reload to force scroll
        after content has been loaded.
    */
    $('[data-toggle="tooltip"]').tooltip({trigger : 'hover'});
    fetch(publicSpreadsheetDoc)
    .then(response => response.json())
    .then(data => {
        new formatData(data);
        anchors.options.visible = 'touch';
        anchors.add('#scroll-content h2, #scroll-content h4');
        
        setTimeout(function() {
            if (window.location.hash) {
                const hash = window.location.hash;
                window.location.hash = '';
                window.location.hash = hash;
            }
        }, 400)

        const anchorsAll = document.querySelectorAll('.anchorjs-link');
        anchorsAll.forEach(anchor => {
            anchor.addEventListener('click', handleAnchorClick);
            anchor.setAttribute('data-toggle', 'tooltip');
            anchor.setAttribute('data-placement', 'bottom');
            anchor.setAttribute('data-html', 'true');
        })
    })
}

function handleAnchorClick() {
    copyToClipboard(this.href);
    $(this).attr('data-original-title', 'Copied!').tooltip('show');

    setTimeout(() => {
        $(this).tooltip('hide');
        $(this).on('hidden.bs.tooltip', () => { $(this).tooltip('dispose'); })
    }, 1000)
}

$(document).scroll(function() {
    /*  Sticky navigation change bg color on scroll,
        display back to top button.
    */
    let scroll = $(window).scrollTop();
    
    if (scroll < 300) {
        isSticky = false;
        $('.sticky-top')[0].classList.remove('active-sticky');
        $('.js-top').css('display', 'none');

    } else if (!isSticky) {
        isSticky = true;
        $('.sticky-top')[0].classList.add('active-sticky');
        $('.js-top').css('display', '');
    }
})

$(document).on('click', '[data-toggle="lightbox"]', function(event) {
    event.preventDefault();
    $(this).ekkoLightbox();
})

$(document).ready(__init__);
