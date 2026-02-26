// Shared navigation and search behavior for all pages
(function () {
  function getPrefix() {
    var path = window.location.pathname || "";
    var segments = path.split("/");
    var last = segments[segments.length - 1] || segments[segments.length - 2] || "";
    // pages under the FAQ's & Notices folder live one level deeper
    if (
      last === "FAQs.html" ||
      last === "Notices.html" ||
      last === "Did You Know.html" ||
      last === "Did%20You%20Know.html"
    ) {
      return { prefix: "../", faqHref: "faqs-notices.html" };
    }
    return { prefix: "", faqHref: "faqs-notices.html" };
  }

  function initNav() {
    var cfg = getPrefix();
    var prefix = cfg.prefix;

    var homeLink = document.getElementById("home_link");
    if (homeLink) {
      homeLink.setAttribute("href", prefix + "index.html");
    }


    var nodeList = document.getElementById("nodeList");
    if (nodeList) {
      var navAs = nodeList.getElementsByTagName("a");
      if (navAs.length > 0) navAs[0].setAttribute("href", prefix + "index.html");
      if (navAs.length > 1) navAs[1].setAttribute("href", prefix + "licensing.html");
      if (navAs.length > 2) navAs[2].setAttribute("href", prefix + "searchpermits.html");
      if (navAs.length > 3) navAs[3].setAttribute("href", prefix + "news.html");
      if (navAs.length > 4) navAs[4].setAttribute("href", cfg.faqHref);

      // add active class based on current file name
      try {
        var current = (window.location.pathname || "").split("/").pop().toLowerCase();
        if (current === "" || current === null) current = "index.html";
        for (var i = 0; i < navAs.length; i++) {
          var href = navAs[i].getAttribute("href") || "";
          var file = href.split("/").pop().toLowerCase();
          var li = navAs[i].closest("li");
          if (file === current) {
            if (li) li.classList.add("active");
          } else {
            if (li) li.classList.remove("active");
          }
        }
      } catch (e) {}
    }

    var external = document.querySelectorAll("a[href^='http']");
    for (var i = 0; i < external.length; i++) {
      var a = external[i];
      a.setAttribute("href", "#");
      a.removeAttribute("target");
      a.onclick = function (e) {
        e = e || window.event;
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false;
        }
        return false;
      };
    }
  }

  function normalize(str) {
    return (str || "").trim().toLowerCase();
  }

  function initSearchPermits() {
    var permitNumberInput = document.getElementById("permitNumber");
    var permitHolderInput = document.getElementById("permitHolder");
    var dateInput = document.querySelector(
      '.publicSearchContainer input[aria-label="Date input field"]'
    );
    var searchBtn = document.getElementById("localSearchButton");

    if (!searchBtn) {
      return;
    }

    var permits = [
      {
        number: "MOL-WP-2025-29098",
        date: "25/02/2026",
        holder: "anees ahmad",
        result: "resultc9529449.html",
      },
      {
        number: "MOL-WP-2025-28078",
        date: "25/02/2026",
        holder: "anees ahmad",
        result: "resultc9529448.html",
      },
    ];

    searchBtn.addEventListener("click", function (e) {
      e.preventDefault();

      var permitNumber =
        ((permitNumberInput && permitNumberInput.value) || "").trim().toUpperCase();
      var issuedDate = ((dateInput && dateInput.value) || "").trim();
      var holder = normalize(permitHolderInput && permitHolderInput.value);

      var target = null;

      for (var i = 0; i < permits.length; i++) {
        if (permitNumber && permitNumber === permits[i].number) {
          target = permits[i].result;
          break;
        }
      }

      if (!target && (issuedDate === "25/02/2026" || holder === "anees ahmad")) {
        target = permits[0].result;
      }

      if (!target) {
        target = "searchpermitnotfound.html";
      }

      window.location.href = target;
    });
  }

  function initMobileNav() {
    // create namespace if necessary
    window.stmobilenav = window.stmobilenav || {};
    window.stmobilenav.toggleMobileNavigation = function () {
      var body = document.body;
      var opened = body.classList.toggle("stNavigationShow");
      // update accessibility state on the toggle button if present
      var toggle = document.getElementById("stMobileNavToggle");
      if (toggle) {
        toggle.setAttribute("aria-expanded", opened);
      }
      var overlay = document.querySelector(".mobile-menu-overlay");
      if (overlay) {
        overlay.setAttribute("aria-hidden", !opened);
      }
    };

    // Attach listener to the main toggle button as well (the A tag)
    var toggleBtn = document.getElementById("stMobileNavToggle");
    if (toggleBtn) {
        // Remove inline onclick handler to prevent double-toggling
        toggleBtn.removeAttribute("onclick");
        
        // Use a flag to prevent attaching multiple listeners if init is called multiple times
        if (!toggleBtn.dataset.hasMobileNavListener) {
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.stmobilenav.toggleMobileNavigation();
            });
            toggleBtn.dataset.hasMobileNavListener = "true";
        }
    }

    // Attach listener to close buttons
    var closeBtns = document.querySelectorAll('.close-menu');
    closeBtns.forEach(function(btn) {
        if (!btn.dataset.hasCloseListener) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                window.stmobilenav.toggleMobileNavigation();
            });
            btn.dataset.hasCloseListener = "true";
        }
    });

    // close the menu when a navigation link is clicked (optional)
    document.addEventListener("click", function (e) {
      if (document.body.classList.contains("stNavigationShow")) {
        // Close if clicked on a link inside the mobile menu
        var link = e.target.closest && (e.target.closest("#stBootstrapNav a") || e.target.closest(".mobile-menu-overlay a"));
        // Don't close if it's the toggle button itself (handled by its own listener) or the close button (handled by onclick)
        // But the close button calls toggleMobileNavigation, so that's fine.
        // The issue is if we click the toggle button, this global click listener might fire and immediately close it?
        // No, toggleMobileNavigation toggles the class.
        
        if (link && !link.classList.contains("close-menu") && link.id !== "stMobileNavToggle") {
           // actually we can just let the user close it manually or close on link click
           // window.stmobilenav.toggleMobileNavigation();
           // But wait, if I navigate, the page reloads anyway.
           // If it's a single page app or anchor link, we want to close.
           // For now, let's just leave the existing logic but extend it to mobile menu overlay links
           if (link && !link.getAttribute('href').startsWith('javascript')) {
                document.body.classList.remove("stNavigationShow");
           }
        }
      }
    });
  }

  function init() {
    try {
      initNav();
    } catch (e) {}
    try {
      initSearchPermits();
    } catch (e) {}
    try {
      initMobileNav();
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();