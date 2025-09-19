import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { envs } from "@/env";
import { inter } from "@/fonts";

const title = "Drawit - Dibuja Pixeles Online";

export const metadata: Metadata = {
  title,
  description:
    "Drawit es un clon mejorado de r/place donde puedes dibujar píxeles ilimitados mientras escuchas música en streaming. Participa en una experiencia creativa, social y relajada.",
  // keywords: [
  //   "drawit",
  //   "rplace",
  //   "r/place",
  //   "wplace",
  //   "canvas colaborativo",
  //   "dibujar pixeles online",
  //   "arte pixel",
  //   "pixel art",
  //   "radio chill",
  //   "juego multijugador creativo",
  // ],
  openGraph: {
    title: `${title} | Arte Pixel Colaborativo + Radio Chill`,
    description:
      "Crea pixel art en un lienzo infinito y colabora en tiempo real con otros usuarios. Inspirado en r/place y wplace, pero con música relajante y mejoras únicas.",
    url: envs.SITE_URL,
    siteName: "Drawit",
    images: [
      {
        url: `${envs.SITE_URL}/og.webp`,
        width: 1200,
        height: 630,
        alt: "Drawit - Pixel Art colaborativo online",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drawit - Dibuja Pixeles Online con Radio Chill",
    description:
      "Únete a Drawit y crea arte pixel colaborativo mientras escuchas música relajante. Una experiencia inspirada en r/place y wplace.",
    images: [`${envs.SITE_URL}/og.webp`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, user-scalable=no, maximum-scale=1"
        />
      </head>
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
