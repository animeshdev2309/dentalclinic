/* ==========================================================================
   PROMOTIONAL BANNER CONFIGURATION
   --------------------------------------------------------------------------
   This is the single source of truth for promotional banners.
   Change banner images, destination, dates, and placement here —
   main.js handles everything else.

   Keep `enabled: false` when there is no active campaign. The banner
   will not appear and will not leave empty space.
   ========================================================================== */

const PROMOTION_CONFIG = {
    /* Master switch. Date rules still apply when true. */
    enabled: false,

    /* Unique identifier for this campaign. Used for dismissal persistence.
       Change it when you launch a new campaign. */
    campaignName: "Festival Special Offer",

    /* Image URLs. At least ONE must be non-empty for the banner to show.
       If mobileImage is "" the desktop image is used on mobile (and vice versa). */
    desktopImage: "",
    mobileImage: "",

    /* Destination URL. Leave "" for a non-clickable image banner. */
    link: "",
    openInNewTab: false,

    /* Placement:
       "top"         — above the main navigation
       "hero-before" — immediately above the hero section
       "hero-after"  — immediately below the hero section (default)
       "floating"    — compact floating card (bottom-left, unobtrusive)
       "bottom-bar"  — fixed bar at the bottom of the viewport */
    placement: "hero-after",

    /* Optional ISO-8601 date-times. Empty = no restriction.
       Example: "2026-10-28T00:00:00+05:30"
       Both rules use the visitor's local clock via Date parsing. */
    startDate: "",
    endDate: "",

    /* Dismissal controls. */
    showCloseButton: true,
    dismissible: true,

    /* Accessible alt text for the banner image. */
    altText: "Special promotional offer"
};
