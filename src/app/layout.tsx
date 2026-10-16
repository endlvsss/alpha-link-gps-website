import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Alpha Link GPS · Rastreo GPS y anti-robo vehicular",
    template: "%s · Alpha Link GPS",
  },
  description:
    "Ubicación en vivo, alertas y corte de suministro a distancia para tu vehículo. Instalación a domicilio en la Región Metropolitana. Un servicio de Alpha Tecnología.",
  applicationName: "Alpha Link GPS",
  // Precios y condiciones aún son provisorios: no indexar hasta aprobarlos.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0f1a21",
  // Pantalla completa en celulares con notch (el contenido se separa con env(safe-area-inset-*))
  // y el teclado reduce el área visible en Android, como en iOS.
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

// El tema oscuro es el principal. Si la persona eligió el claro, se aplica antes
// del primer pintado (ver guía "Preventing Flash").
// También marca <html class="js"> para las entradas animadas (sin script, todo visible).
const themeScript = `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("alg-theme-v2");if(t==="dark"||t==="light")d.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CL"
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh bg-bg text-ink">{children}</body>
    </html>
  );
}
