/* ==========================================================================
   IMAGE CONFIGURATION  —  change EVERY picture on the website from this one file.

   How to use
     1. Upload your picture somewhere and copy its link (a full https://… address),
        OR put the file in the assets/images/ folder and use its path,
        e.g. "assets/images/doctor.jpg".
     2. Paste the link between the quotes, save, upload this file.
     3. Leave "" (empty) to keep the picture that is already on the page
        (exceptions: for "hero" an empty value means no photo; for "logo" and
        "doctor" it keeps the built-in icon / "Portrait to be added" placeholder).
        A link that does not work is ignored too – the old picture stays.
     4. When you replace a sample picture in the gallery or a before/after
        slider, its "Representative image" / "Illustrative sample" label is
        removed automatically, because the label would no longer be true.

   Tips
     • Every picture is CROPPED to fit its frame (never stretched). Keep the
       important part (faces, teeth) near the middle.
     • Use compressed JPG or WebP. Aim for under ~300 KB for small pictures and
       under ~600 KB for the hero – the page loads faster on mobile data.
     • The Unsplash pictures that are in this file now are only samples. Replace
       them with real photos of your clinic. (Before/after photos need the
       written consent of each patient.)
     • Only public links belong here – this file is visible to every visitor.

   Picture sizes (best shape → minimum size)
     logo ................ square 1:1 ........................ 120 × 120 px
     hero ................ landscape 16:9 ..................... 1920 × 1080 px
     doctor .............. portrait 4:5 ........................ 800 × 1000 px
     services ............ landscape 4:3 ....................... 800 × 600 px
     gallery ............. landscape 4:3 (see note below) ....... 1400 × 1050 px
     before / after ...... landscape 4:3, BOTH the same size ... 900 × 675 px
   ========================================================================== */

const IMAGE_CONFIG = {

  /* ---- Logo (navigation bar) ----------------------------------------------
     Shown in a 30 × 30 px square at the left of the navigation bar, replacing
     the built-in tooth icon. Use a square image (a transparent PNG/SVG/WebP
     is best), about 120 × 120 px so it stays sharp on phones.
     "" = keep the built-in tooth icon.                                       */
  logo: "",

  /* ---- Favicon (the small icon in the browser tab) ------------------------
     Square, e.g. 64 × 64 px PNG. "" = browser default.                        */
  favicon: "",

  /* ---- Hero (large picture behind the headline at the top) ----------------
     Fills the whole top section and is cropped to fit, from the CENTRE:
       desktop ≈ 16:9 (wide)   tablet ≈ 3:4   phone ≈ tall and narrow
     so only a middle slice shows on phones. Use a landscape photo, at least
     1920 px wide, with the main subject in the centre. The left side is
     covered by a light fade behind the text, so keep it uncluttered.
     (Unsplash links automatically get responsive sizes.)                      */
  hero: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=75",

  /* ---- Doctor (section "05 — The dentist") ---------------------------------
     Portrait frame, 4:5 (taller than wide). Use an 800 × 1000 px portrait with
     the face in the upper half. "" = the "Portrait to be added" placeholder.   */
  doctor: "",

  /* ---- Services (the 12 treatments in the "Services" list) -----------------
     Each picture shows in a 4:3 frame (about 340 × 255 px on desktop) when the
     treatment is opened. They are in the SAME ORDER as the page – the name
     after // tells you which one is which. Keep the commas.                  */
  services: [
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=500&h=375&q=75",   // 1  General Dentistry
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=500&h=375&q=75",   // 2  Cleaning & Scaling
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=500&h=375&q=75&sat=-10",   // 3  Fillings & Restorations
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=375&q=75",   // 4  Root Canal Treatment
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=500&h=375&q=75&sat=-5",   // 5  Crowns & Bridges
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=500&h=375&q=75&sat=5",   // 6  Dental Veneers
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&h=375&q=75",   // 7  Cosmetic Dentistry
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&h=375&q=75&sat=5",   // 8  Dental Implants
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=500&h=375&q=75&sat=-15",   // 9  Orthodontics & Aligners
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=500&h=375&q=75&sat=-20",   // 10  Oral Surgery
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=500&h=375&q=75",   // 11  Gum Care
    "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=500&h=375&q=75",   // 12  Dentures
  ],

  /* ---- Gallery (the 4 pictures in the "Our clinic" mosaic) -----------------
     The shape depends on the screen:
       phones and tablets .... every picture 4:3 (landscape)
       desktop ............... 1st = tall (about 3:4)   2nd = wide (about 3:2)
                               3rd and 4th = tall (about 3:4)
     A landscape 4:3 photo, at least 1400 px wide, with the subject in the
     centre works well in every slot (the sides are trimmed on desktop).       */
  gallery: [
    "https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=1400&q=80",   // 1  Reception
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1400&q=80",   // 2  Treatment room
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&q=80",   // 3  Equipment
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=900&q=80",   // 4  Waiting area
  ],

  /* ---- Before / After sliders (the 3 sliders in "Results") -----------------
     For each slider give a "before" and an "after" picture. They must have the
     SAME size and framing, so the slider lines up – ideally 900 × 675 px (4:3),
     same angle and distance.  Leave BOTH of a pair as "" to keep the sample.
     (If only one of a pair is filled in, the pair is ignored.)                 */
  beforeAfter: [
    {   // 1  Cosmetic dentistry
      before: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&h=675&q=75&sat=-55&blur=1",
      after:  "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=900&h=675&q=75&sat=-25"
    },
    {   // 2  Root canal & crown
      before: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&h=675&q=75&sat=-45&blur=1",
      after:  "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&h=675&q=75&sat=-20"
    },
    {   // 3  Dental implants
      before: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&h=675&q=75&sat=-45&blur=1",
      after:  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&h=675&q=75"
    }
  ]
};
