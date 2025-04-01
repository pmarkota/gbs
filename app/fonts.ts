import localFont from "next/font/local";

// Load Hadriatic font variations
export const hadriaticRegular = localFont({
  src: [
    {
      path: "../public/fonts/hadriatic.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-hadriatic-regular",
  display: "swap",
});

export const hadriaticBold = localFont({
  src: [
    {
      path: "../public/fonts/hadriaticb.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-hadriatic-bold",
  display: "swap",
});

export const hadriaticItalic = localFont({
  src: [
    {
      path: "../public/fonts/hadriatici.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-hadriatic-italic",
  display: "swap",
});

export const hadriaticBoldItalic = localFont({
  src: [
    {
      path: "../public/fonts/hadriaticbi.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-hadriatic-bold-italic",
  display: "swap",
});

// You can also include the other font files like hadriaticsi.ttf, hadriaticsp.ttf, etc.
// as needed
