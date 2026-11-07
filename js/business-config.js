/* ==========================================================================
   BUSINESS CONFIGURATION  —  edit this file to change business details.

   • Only PUBLIC information belongs here. This file is downloaded by every
     visitor's browser, so never put passwords, admin logins or private API
     keys in it. Hiding things in JavaScript does not make them secret.
   • Keep the quotes and commas exactly as they are; change only the text
     between the quotes.
   • Loaded by index.html BEFORE promotion-config.js and main.js.
   ========================================================================== */

const BUSINESS_CONFIG = {

  /* ---- Identity --------------------------------------------------------- */

  // Full business name. Used in headings, the footer, the copyright line,
  // the map title and the greeting of WhatsApp enquiry messages.
  name: "Dr. Raj's Multispeciality Dental Clinic",

  // The two lines of text beside the logo in the navigation bar.
  // (The subtitle is hidden on very small phones by the stylesheet.)
  // Set navbarSubtitle to "" if you do not want a second line.
  navbarName: "Dr. Raj's",
  navbarSubtitle: "Multispeciality Dental Clinic",

  // Year the business was founded (shown in the quick-facts strip, hero and footer).
  established: "2012",

  // NOTE: all pictures – logo, favicon, hero, doctor's photo, services, gallery and
  // before/after – are set in ONE place: js/image-config.js


  /* ---- The dentist ------------------------------------------------------ */

  doctor: {
    name: "Dr. Ritu Raj",
    // (The doctor's photo is set in js/image-config.js → doctor)
    qualifications: "BDS — full qualifications to be confirmed with the clinic",
    interests: "Root canal treatment, dental implants, cosmetic dentistry",
    memberships: "To be confirmed",
    languages: "Hindi, English — to be confirmed"
  },


  /* ---- Contact ---------------------------------------------------------- */

  contact: {
    // Used for the "Call" buttons: international format, no spaces.
    phone: "+917033184080",

    // How the number is displayed on the page.
    phoneDisplay: "+91 70331 84080",

    // WhatsApp number: country code + number, digits only, no "+" or spaces.
    whatsapp: "917033184080",

    // Leave "" to hide the email rows.
    email: "dr.riturajbds@gmail.com"
  },


  /* ---- Address ---------------------------------------------------------- */
  // Displayed as three lines:
  //   line1,
  //   line2, city,
  //   state pincode, country

  address: {
    line1: "Saraidhela, Opposite New Madan Medical",
    line2: "Near Steel Gate",     // optional – use "" to skip this part
    area: "Saraidhela",           // short locality name used in headings ("Saraidhela, Dhanbad")
    city: "Dhanbad",
    state: "Jharkhand",
    pincode: "828127",
    country: "India"
  },


  /* ---- Opening hours ---------------------------------------------------- */
  // One entry per line. Leave the list empty ([]) to hide the opening-hours rows.
  // NOTE: the appointment form's time options and the FAQ answer about opening
  // hours are written in index.html – update those too if the hours change.

  openingHours: [
    "Mon–Sat: 11:00 AM – 2:00 PM · 5:00 PM – 8:00 PM",
    "Sunday: 11:00 AM – 2:00 PM · 4:30 PM – 8:00 PM"
  ],


  /* ---- Consultation fee ------------------------------------------------- */

  consultation: {
    fee: "₹200",                                // "" hides the fee everywhere it is a separate item
    note: "to be confirmed with the clinic"     // shown after the fee in the "Find us" section; "" for none
  },


  /* ---- Rating (optional) ------------------------------------------------ */
  // Leave "" until you have a confirmed, sourced figure, e.g. "4.9 ★ · 962 reviews".
  // While empty, the "Google rating" item stays hidden.

  rating: "",


  /* ---- Social media (optional) ------------------------------------------ */
  // Full https:// addresses. Leave "" and the link is not shown at all.

  social: {
    instagram: "",
    facebook: "https://www.facebook.com/doctor.rituraj",
    youtube: ""
  },


  /* ---- Map -------------------------------------------------------------- */

  map: {
    // Opens when someone taps "Get directions" / "Open in Google Maps".
    directionsUrl: "https://maps.app.goo.gl/926QzrJQJLn52RQp9",

    // What the embedded Google Map searches for. A business name plus
    // address works well.
    embedQuery: "Dr Raj's Multispeciality Dental Clinic, Saraidhela, Dhanbad, Jharkhand 828127"
  },


  /* ---- Enquiries -------------------------------------------------------- */

  booking: {
    // Message pre-filled when a visitor taps any WhatsApp button.
    // (The appointment form builds its own, longer message that starts with
    // "Hello <business name>,".)
    whatsappMessage: "Hello Dr. Raj's Multispeciality Dental Clinic, I would like to book a dental appointment. Please share your available timings."
  },


  /* ---- Legal (optional) ------------------------------------------------- */
  // Address of your privacy-policy page. Leave "" and the footer link stays hidden.

  privacyUrl: ""
};
