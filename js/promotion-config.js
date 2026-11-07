/* ==========================================================================
   PROMOTION BANNER CONFIGURATION  —  run a campaign by editing only this file.

   The banner is OFF until you set  enabled: true.
   Everything here is public (it is downloaded by every visitor).
   Loaded by index.html AFTER business-config.js and BEFORE main.js.

   Quick start
     1. Put your banner images in assets/images/ (or use full https:// links).
     2. Set desktopImage (and, ideally, mobileImage).
     3. Optionally set link, startDate and endDate.
     4. Set enabled: true, save, upload.
   ========================================================================== */

const PROMOTION_CONFIG = {

  // Master switch. false = nothing is shown and no space is reserved.
  enabled: false,

  // Name of the campaign. Used as the banner's accessible label, and – together
  // with the dates and image addresses – to remember that a visitor closed this
  // particular campaign. Give each new campaign a new name.
  campaignName: "Festival Special Offer",

  // Banner image for tablets, laptops and desktops (screens wider than 767 px).
  // Full https:// address or a path such as "assets/images/banner-desktop.jpg".
  desktopImage: "",

  // Banner image for phones (screens 767 px wide or narrower).
  // Leave "" to use the desktop image on phones too.
  mobileImage: "",

  // Where a click or tap on the banner goes. Leave "" for a banner that is
  // just a picture (it then does not look or behave like a link).
  // Allowed: https:// and http:// pages, mailto:, tel:, and paths inside
  // your site. Examples:
  //   "https://wa.me/917033184080?text=Hello"   (WhatsApp enquiry)
  //   "#visit"                                   (jump to a section of this page)
  link: "",

  // true = the link opens in a new tab; false = it opens in the same tab.
  openInNewTab: false,

  // Where the banner appears. One of:
  //   "top"          above the navigation bar, at the very top of the page
  //   "hero-before"  between the navigation bar and the hero section
  //   "hero-after"   directly below the hero section
  //   "floating"     a small card in the bottom-left corner
  //   "bottom-bar"   a slim bar fixed to the bottom of the screen
  placement: "hero-after",

  // Optional schedule. Leave "" for no limit.
  // Format:  "YYYY-MM-DDTHH:MM:SS+05:30"   (date, time and UTC offset)
  //          "YYYY-MM-DD"                   (whole day: a startDate means 00:00:00,
  //                                          an endDate means 23:59:59 of that day)
  // The banner is shown from startDate until endDate, both inclusive.
  // A date that cannot be understood HIDES the banner (and logs a warning in
  // the browser console) rather than risk showing it at the wrong time.
  // Dates are compared with the visitor's device clock.
  startDate: "",
  endDate: "",

  // Offset used for any date above that does not spell out its own offset.
  // "+05:30" = Indian Standard Time. Use "Z" for UTC.
  timeZoneOffset: "+05:30",

  // Show a close (×) button on the banner?
  showCloseButton: true,

  // true  = visitors can close the banner; it stays closed for the rest of
  //         their visit (this browser tab) and comes back on a new visit.
  // false = the banner cannot be closed (the close button is not shown,
  //         even if showCloseButton is true).
  dismissible: true,

  // Description of the banner image for screen readers and for when the image
  // cannot be seen. Describe what the banner says.
  altText: "Special promotional offer"
};
