# Dr. Raj's Multispeciality Dental Clinic — Website

A static website (plain HTML, CSS and JavaScript — no build step, no framework, no backend).
The original single-file page has been split into separate files, and two **config files**
let you change business details and run promotional banners without touching the code.

---

## 1. Folder structure

```
website/
├── index.html                 The page structure (all sections, forms, modal)
├── README.md                  This file
├── css/
│   └── style.css              All styling, incl. the promotional banner
├── js/
│   ├── business-config.js     ✏️  EDIT ME – business name, phone, address, hours, social links …
│   ├── image-config.js        ✏️  EDIT ME – ALL pictures: logo, hero, doctor, services, gallery, before/after
│   ├── promotion-config.js    ✏️  EDIT ME – promotional banner (on/off, images, link, dates)
│   └── main.js                Behaviour (navigation, sliders, form, banner). No need to edit.
└── assets/
    ├── images/                Put your own picture files here (or use image links instead)
    └── icons/                 Put your favicon here
```

**Load order matters** and is already set in `index.html`:
`business-config.js` → `image-config.js` → `promotion-config.js` → `main.js` (all with `defer`).

---

## 2. Change business details — `js/business-config.js`

Open the file in any text editor, change the text **between the quotes**, save, upload.
Keep the quotes, commas and brackets exactly as they are.

| What | Setting |
|---|---|
| Business name | `name` |
| Name / subtitle in the nav bar | `navbarName`, `navbarSubtitle` (`""` removes the subtitle) |
| Dentist's name and credentials | `doctor.name`, `doctor.qualifications`, … (the photo is in `image-config.js`) |
| Phone (for the Call button) / how it is shown | `contact.phone` / `contact.phoneDisplay` |
| WhatsApp number (digits only, with country code, no `+`) | `contact.whatsapp` |
| Email (`""` hides it everywhere) | `contact.email` |
| Address | `address.line1`, `line2`, `area`, `city`, `state`, `pincode`, `country` |
| Opening hours (one line per entry; `[]` hides them) | `openingHours` |
| Consultation fee | `consultation.fee`, `consultation.note` |
| Social links (`""` = not shown at all) | `social.facebook`, `social.instagram`, `social.youtube` |
| Directions link / embedded map search | `map.directionsUrl`, `map.embedQuery` |
| Text pre-filled in WhatsApp buttons | `booking.whatsappMessage` |
| Google rating (`""` keeps it hidden) | `rating` |
| Privacy policy page (`""` hides the footer link) | `privacyUrl` |

### Pictures — all in `js/image-config.js`

Every picture on the website is changed from **one file**: `js/image-config.js`. Paste an image **link**
(a full `https://…` address) between the quotes — or put a file in `assets/images/` and use its path,
e.g. `"assets/images/doctor.jpg"`. Save, upload the file, done.

| Picture | Setting | Shape it is shown in | Best size |
|---|---|---|---|
| Logo (navigation bar) | `logo` | square, 30 × 30 px box | 120 × 120 px, 1:1 |
| Browser-tab icon | `favicon` | square | 64 × 64 px |
| Hero (top of the page) | `hero` | full-width; **16:9 on desktop, 3:4 on tablets, tall and narrow on phones** — cropped from the centre | 1920 × 1080 px |
| Doctor ("Meet the dentist") | `doctor` | **4:5** portrait | 800 × 1000 px |
| 12 treatments (Services) | `services` (list of 12) | **4:3** | 800 × 600 px |
| Clinic gallery (4 pictures) | `gallery` (list of 4) | phones/tablets **4:3**; desktop: 1st tall (≈3:4), 2nd wide (≈3:2), 3rd and 4th tall (≈3:4) | 1400 × 1050 px, subject in the centre |
| Before / after (3 sliders) | `beforeAfter` (3 × `before` + `after`) | **4:3** | 900 × 675 px — both pictures the same size and angle |

How it works:

- **Lists are matched by position.** Each line in `services` / `gallery` ends with a `// name` comment, so you can see
  which treatment or tile it is. Keep the commas and keep the order.
- **Empty `""` keeps the picture that is already there.** (Exceptions: an empty `hero` means no photo; an empty
  `logo` or `doctor` keeps the built-in tooth icon / "Portrait to be added" placeholder.)
- **A link that doesn't work is ignored** — the previous picture stays, so a typo never leaves a broken image.
- **Any shape is accepted.** Pictures are cropped to fill their frame, never stretched — keep faces and teeth near the middle.
- **Sample labels disappear automatically.** When you replace a gallery picture or a before/after pair, its
  "Representative image" / "Illustrative sample" label and the "Clinic photo to be added" note are removed (they would no
  longer be true). The alt text for screen readers is updated too. *The paragraph above each section that says
  photographs are "illustrative"/"to be added" is ordinary text in `index.html` — edit it when all real photos are in.*
- **Before / after needs both pictures** of a slider. If only one is filled in, that slider is left as it was.
  Always get written patient consent before publishing real before/after photos.
- For fast loading use compressed JPG/WebP: about 300 KB or less for small pictures, about 600 KB or less for the hero.

### Things that are NOT in the config (edit `index.html` by hand)

These are read by search engines or are written as ordinary page text, so they stay in `index.html`:

- `<title>`, `<meta name="description">`, Open Graph tags, and the JSON-LD block in `<head>`
  (Google reads these **without running JavaScript** — so update them when the business details change).
- The appointment form's time-slot options (`#f-time`) and the FAQ answer about opening hours.
- All headings and descriptive paragraphs, the service list and the "Before & after" captions.

> ⚠️ **Privacy:** both config files are downloaded by every visitor. Put only **public** information in them —
> never passwords or private API keys. Putting something in a JavaScript file does not make it secret.

---

## 3. Promotional banner — `js/promotion-config.js`

You run a campaign by editing **only this file**. The banner is **off** until you set `enabled: true`.
When it is off, expired, closed or its image can't load, **nothing is added to the page** — no empty box, no gap.

### Turn a promotion on or off

```js
enabled: true,    // show the banner (subject to dates)
enabled: false,   // never show it
```

### Change the desktop and mobile images

```js
desktopImage: "assets/images/diwali-desktop.jpg",   // screens wider than 767 px
mobileImage:  "assets/images/diwali-mobile.jpg",    // phones (767 px and narrower)
```

- Upload the images to `assets/images/` (or use full `https://` addresses).
- The right image is chosen automatically, and switches if the window is resized. Only one of them is downloaded.
- If `mobileImage` is empty, phones use the desktop image. If `desktopImage` is empty, the mobile image is used everywhere.
- If both are empty — or none can be loaded — no banner is shown.
- Suggested sizes: desktop about **1200 × 300 px**, mobile about **600 × 400 px** (any size works; the banner keeps the image's proportions).
  For `"bottom-bar"` use a short, wide image such as **970 × 90 px** (it is limited to 96 px tall, 84 px on phones).

### Change the destination (click target)

```js
link: "https://wa.me/917033184080?text=I%20saw%20your%20offer",   // e.g. a WhatsApp enquiry
openInNewTab: true,                                               // false = same tab
```

- With a `link`, the whole banner is clickable. With `link: ""` it is just a picture, not a link.
- Allowed: `https://`, `http://`, `mailto:`, `tel:`, and `#section` on this page. Anything else (such as `javascript:`) is ignored.
- A banner opened in a new tab uses `noopener noreferrer` for safety.

### Change the campaign dates

```js
startDate: "2026-10-28T00:00:00+05:30",
endDate:   "2026-11-05T23:59:59+05:30",
```

- Format `YYYY-MM-DDTHH:MM:SS+05:30` (date, time, offset). `+05:30` is Indian Standard Time.
- A date alone (`"2026-11-05"`) means the whole day: a start date begins at 00:00:00, an end date lasts until 23:59:59 of that day.
- Leave a date as `""` for no limit. With both empty, only `enabled` decides.
- The banner shows from the start instant to the end instant, both included.
- A date that isn't valid (e.g. `"2026-02-31"`, `"tomorrow"`) **hides** the banner and writes a warning to the browser console — it never shows by accident.
- The schedule is checked when the page opens, against the **visitor's device clock**. (A visitor with a wrong clock can see a banner early or late; this can't be prevented on a static site.)
- `timeZoneOffset` is used for dates that don't include their own offset.

### Change the placement

```js
placement: "hero-after",
```

| Value | Where it appears |
|---|---|
| `"top"` | Above the navigation bar, at the very top of the page |
| `"hero-before"` | Between the navigation bar and the hero section |
| `"hero-after"` | Directly below the hero section *(default)* |
| `"floating"` | A small card, bottom-left corner (clear of the WhatsApp / back-to-top buttons) |
| `"bottom-bar"` | A slim bar fixed to the bottom (sits above the phone's Book/Call bar; the page and floating buttons make room for it) |

An unknown value falls back to `"hero-after"`.

### Close button

```js
showCloseButton: true,   // show the × button
dismissible: true,       // visitors may close it
```

- `dismissible: false` → the banner can't be closed (no × button, even if `showCloseButton` is `true`).
- When closed, it stays closed for the rest of that visit (browser tab) and returns on a new visit.
  This uses `sessionStorage` only — no cookies, no personal data.
- Each campaign is remembered separately (by `campaignName`, dates and image addresses), so closing one promotion doesn't hide the next. **Give each new campaign a new `campaignName`.**
- Closing never triggers the banner's link.

### Accessibility

`altText` is read by screen readers — describe what the banner says. The banner link and × button work with the
keyboard (Tab / Enter / Space) and have a visible focus ring. Animation is skipped for visitors who
prefer reduced motion.

---

## 4. Test it on your computer

Opening `index.html` by double-clicking works for most of the page. For the most reliable result
(fonts, images, maps) run a tiny local server from the `website` folder:

```
python3 -m http.server 8000
```

then open <http://localhost:8000>.

---

## 5. Deploy to GitHub Pages

1. Create a free account at <https://github.com> and click **New repository** (e.g. `dental-clinic-website`).
   Choose **Public**.
2. Upload the **contents** of the `website` folder so that `index.html` is at the top level of the repository
   (not inside an extra folder): **Add file → Upload files**, drag everything in, then **Commit changes**.
   *(Keep the folder structure: `css/`, `js/`, `assets/`.)*
3. Open **Settings → Pages**. Under **Build and deployment**, set **Source: Deploy from a branch**,
   **Branch: `main`** and folder **`/ (root)`**, then **Save**.
4. After a minute or two the site is live at `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.
5. To update the site later, edit the files on GitHub (pencil icon) or upload new versions, and commit.
   Changes appear within a few minutes. (Your browser may show an old copy — refresh with Ctrl/Cmd + Shift + R.)

For a custom domain, use **Settings → Pages → Custom domain**.

---

## 6. Limitations and things to know

- **Config files are public.** Anyone can read them (and your banner image addresses). Keep secrets out.
- **Search engines and social previews read `index.html`, not the config.** After changing the business name,
  phone or address, also update `<title>`, the meta tags and the JSON-LD block in `index.html`.
- **Without JavaScript** the page still shows its content and the WhatsApp / call links work, but the picture
  settings (except the hero, which has a fallback), the banner and the appointment form need JavaScript.
- **Banner timing:** the banner is added once its image has loaded, so it never shows an empty or broken box.
  For `"top"`, `"hero-before"` and `"hero-after"` this means the page content below it moves down by the banner's
  height at that moment (typically a fraction of a second on a normal connection). `"floating"` and `"bottom-bar"` do not
  shift the page. Choose `"floating"` or `"bottom-bar"` if you want zero movement.
- **Dates use the visitor's clock** (see above).
- **Third-party services used by the original page** (unchanged): Google Fonts, Unsplash sample photos, Google Maps embed.
  The Unsplash photos are placeholders — replace them with real clinic photos in `index.html` when you have them.
- Images: use compressed JPG/WebP (ideally under ~300 KB for banners) so the page stays fast on mobile data.
- The enquiry form opens a pre-written WhatsApp message; nothing is stored or sent to a server by this website.
