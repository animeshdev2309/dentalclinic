/* ==========================================================================
   BUSINESS CONFIGURATION
   --------------------------------------------------------------------------
   Edit this file to change business details without touching HTML/CSS/JS.
   Every value here is PUBLIC — it ships to every visitor. Never put
   passwords, API keys, or private credentials in this file.
   ========================================================================== */

const BUSINESS_CONFIG = {
    /* ---- Identity ---- */
    name: "Dr. Raj's Multispeciality Dental Clinic",
    tagline: "Attentive, patient-focused dental care in Saraidhela, Dhanbad — serving the community since 2012.",
    doctorName: "Dr. Ritu Raj",

    /* Brand is displayed as two lines in the pill navbar. Set either to ""
       to hide it (the layout collapses gracefully). */
    brand: {
        name: "Dr. Raj's",
        sub: "Multispeciality Dental Clinic"
    },

    /* Optional image logo. Leave "" to keep the inline SVG mark.
       Accepts an absolute URL or a relative path like "assets/images/logo.png". */
    logo: "https://iili.io/n8A4tou.png",

    /* Optional favicon URL. Leave "" for the browser default. */
    favicon: "",

    /* Hero background. Provide a URL or path. srcset/sizes optional. */
    heroImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=75&w=1280",
    heroImageSrcset: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=75&w=640 640w, https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=75&w=960 960w, https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=75&w=1280 1280w, https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=75&w=1600 1600w, https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=75&w=2000 2000w, https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=75&w=2400 2400w",
    heroImageSizes: "100vw",

    /* ---- Contact ---- */
    contact: {
        phone: "+917033184080",             /* used for tel: links */
        phoneDisplay: "+91 70331 84080",    /* shown in text */
        whatsapp: "917033184080",           /* digits only, with country code, no + */
        email: "dr.riturajbds@gmail.com"
    },

    /* ---- Address (structured — main.js formats it for display) ---- */
    address: {
        line1: "Saraidhela, Opposite New Madan Medical",
        line2: "Near Steel Gate",
        city: "Dhanbad",
        state: "Jharkhand",
        pincode: "828127",
        country: "India"
    },

    /* ---- Opening hours ---- */
    hours: {
        weekdays: "Mon–Sat: 11:00 AM – 2:00 PM · 5:00 PM – 8:00 PM",
        sunday: "Sunday: 11:00 AM – 2:00 PM · 4:30 PM – 8:00 PM"
    },

    /* ---- Social media ("" hides the corresponding link/icon) ---- */
    social: {
        instagram: "",
        facebook: "https://www.facebook.com/doctor.rituraj",
        youtube: ""
    },

    /* ---- Practice facts ---- */
    established: "2012",
    consultationFee: "₹200 · to be confirmed with the clinic",

    /* Google rating — leave "" until confirmed & sourced. Empty hides the fact. */
    rating: "",

    /* ---- Booking ---- */
    booking: {
        whatsappMessage: "Hello Dr. Raj's Multispeciality Dental Clinic, I would like to book a dental appointment. Please share your available timings."
    },

    /* ---- Maps ---- */
    directionsUrl: "https://maps.app.goo.gl/926QzrJQJLn52RQp9",

    /* ---- Credentials shown on the Dentist section ---- */
    credentials: {
        qualifications: "BDS — full qualifications to be confirmed with the clinic",
        interests: "Root canal treatment, dental implants, cosmetic dentistry",
        memberships: "To be confirmed",
        languages: "Hindi, English — to be confirmed"
    },

    /* ---- Optional legal ---- */
    privacyUrl: ""
};
