/* ==========================================================
   RUDY AGRITACTIC – PAGE SCRIPT
   You shouldn't need to edit this file.
   Contact details come from config.js.
   ========================================================== */
(function () {
  var C = window.RUDY || {};
  var machine = document.body.getAttribute("data-machine") || "";

  function waLink(text) {
    return "https://wa.me/" + (C.whatsapp || "") + "?text=" + encodeURIComponent(text);
  }

  // Pre-filled WhatsApp messages. Edit the wording here if needed.
  var messages = {
    spares:  "Hi " + C.companyName + ", I need spares for my " + machine + ". Serial number: ",
    service: "Hi " + C.companyName + ", I'd like to book a service for my " + machine + ". My location is: ",
    help:    "Hi " + C.companyName + ", I need help with my " + machine + ". The problem is: ",
    quote:   "Hi " + C.companyName + ", I'm interested in the " + machine + ". Please send me a quote.",
    general: "Hi " + C.companyName + ", I'd like more information about your machines."
  };

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    // Text fills: <span data-fill="phoneDisplay"></span>
    document.querySelectorAll("[data-fill]").forEach(function (el) {
      var v = C[el.getAttribute("data-fill")];
      if (v) el.textContent = v;
    });

    // WhatsApp buttons: <a data-wa="spares">
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      var key = el.getAttribute("data-wa");
      var msg = el.getAttribute("data-wa-text") || messages[key] || messages.general;
      el.href = waLink(msg);
      el.target = "_blank";
      el.rel = "noopener";
    });

    // Call buttons
    document.querySelectorAll("[data-call]").forEach(function (el) {
      el.href = "tel:" + (C.phoneDial || "");
    });

    // Email links
    document.querySelectorAll("[data-email]").forEach(function (el) {
      el.href = "mailto:" + (C.email || "");
    });

    // Map / website / form links – hidden automatically if left empty in config.js
    document.querySelectorAll("[data-link]").forEach(function (el) {
      var url = C[el.getAttribute("data-link")];
      if (url) {
        el.href = url;
        if (/^https?:/.test(url)) { el.target = "_blank"; el.rel = "noopener"; }
      } else {
        var hideTarget = el.closest("[data-hide-if-empty]") || el;
        hideTarget.classList.add("hidden");
      }
    });

    // Photos: show a "add photo" note if the image file isn't there yet
    function photoMissing(img) {
      var box = document.createElement("div");
      box.className = "photo-missing";
      box.innerHTML = "Photo coming soon<br><small>(add <b>" + img.getAttribute("src") + "</b>)</small>";
      img.replaceWith(box);
    }
    document.querySelectorAll("img[data-photo]").forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) photoMissing(img);
      else img.addEventListener("error", function () { photoMissing(img); });
    });

    // Logo: if images/logo.png exists show it and hide the text name
    var logo = document.querySelector("img[data-logo]");
    if (logo) {
      var showLogo = function () { var t = document.querySelector(".brand-text"); if (t) t.classList.add("hidden"); };
      var noLogo = function () { logo.remove(); };
      if (logo.complete) { logo.naturalWidth ? showLogo() : noLogo(); }
      else { logo.addEventListener("load", showLogo); logo.addEventListener("error", noLogo); }
    }

    // Video: shows a thumbnail, loads YouTube only when tapped (saves mobile data)
    document.querySelectorAll(".video").forEach(function (box) {
      var raw = (box.getAttribute("data-youtube") || "").trim();
      var m = raw.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
      var id = m ? m[1] : (/^[\w-]{11}$/.test(raw) ? raw : "");
      if (!id) {
        box.classList.add("empty");
        box.innerHTML = '<div class="play"><span>Demo video coming soon</span>' +
          '<small>Need help now? Tap the WhatsApp button above.</small></div>';
        return;
      }
      box.innerHTML = '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy">' +
        '<div class="play"><span class="circle"><svg viewBox="0 0 24 24" width="28" height="28" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>' +
        'Watch the demo<small>Tap to play</small></div>';
      box.addEventListener("click", function () {
        box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
          '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Demo video"></iframe>';
      }, { once: true });
    });

    // Share button – lets a farmer forward the page on WhatsApp etc.
    document.querySelectorAll("[data-share]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var data = { title: document.title, url: location.href };
        if (navigator.share) { navigator.share(data).catch(function () {}); }
        else {
          try { navigator.clipboard.writeText(location.href); btn.textContent = "Link copied ✓"; }
          catch (e) { prompt("Copy this link:", location.href); }
        }
      });
    });

    // Download links: hidden automatically until the PDF is uploaded to /files
    document.querySelectorAll("a[data-file]").forEach(function (a) {
      a.classList.add("hidden");
      fetch(a.getAttribute("href"), { method: "HEAD" })
        .then(function (r) { if (r.ok) { a.classList.remove("hidden"); refreshDownloads(); } })
        .catch(function () {});
    });
    function refreshDownloads() {
      document.querySelectorAll("[data-downloads]").forEach(function (sec) {
        var any = sec.querySelector("a[data-file]:not(.hidden)");
        sec.classList.toggle("hidden", !any);
      });
    }
    refreshDownloads();

    // Footer year
    document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  });
})();
