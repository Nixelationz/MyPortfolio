import "./globals.css";

export const metadata = {
  title: "WTP — What’s That Phrase?",
  description:
    "Describe the word or phrase you can’t remember and WTP will suggest the best match.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
