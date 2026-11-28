/* ------------------------------------------------------------------
   OUR WORK  -  edit this list to change what the carousel shows.

   TO ADD A SITE: copy one block below, paste it at the TOP of the list,
   and fill in the fields. Save, and the page updates on its own.

   Fields
     name         Project name (required)
     url          Live site address. Adds a "Visit live site" link, and a
                  screenshot is generated automatically from it.
     image        Screenshot of the site, e.g. "images/work/smith.jpg".
                  Put the file in the images/work folder. Best: 2880 x 1800
                  (a 1440 x 900 screen at 2x) so it stays sharp on retina.
                  If you leave it out, a lower-quality screenshot is
                  generated automatically from "url".
     display      OPTIONAL. Text shown in the fake browser address bar.
                  Defaults to the domain from "url".
     description  One or two short sentences.
     tags         Short labels, e.g. ["Local business", "Booking"]
     accent       The glow / progress color for this slide, e.g. "#2563eb"

   EXAMPLE (remove the // to use it)

   {
     name: "Smith Plumbing",
     url: "https://smithplumbing.com",
     image: "images/work/smith-plumbing.jpg",
     description: "A fast, mobile-first site that turned searches into booked calls.",
     tags: ["Local business", "Lead generation", "Custom build"],
     accent: "#2563eb"
   },
------------------------------------------------------------------ */

window.PROJECTS = [

  /* ---- ADD YOUR REAL PROJECTS HERE (top of the list) ---- */

  {
    name: "Indian Peach Catering",
    url: "https://indian-peach.vercel.app/",
    image: "images/work/indian-peach.jpg",
    description: "A warm, photo-led home for a Bay Area catering company serving West Marin since 1989, built to turn event dreams into inquiries.",
    tags: ["Catering", "Custom design", "Event inquiry form"],
    accent: "#f08a5d"
  },
  {
    name: "Indian Peach: Gallery",
    url: "https://indian-peach.vercel.app/gallery",
    image: "images/work/indian-peach-gallery.jpg",
    description: "A full-bleed food gallery that lets the dishes sell the experience.",
    tags: ["Photo gallery", "Visual storytelling"],
    accent: "#f08a5d"
  },
  {
    name: "Indian Peach: About",
    url: "https://indian-peach.vercel.app/about",
    image: "images/work/indian-peach-about.jpg",
    description: "The story behind the food, told with the same care as the menu.",
    tags: ["Brand story", "Local, organic, sustainable"],
    accent: "#f08a5d"
  }

];
