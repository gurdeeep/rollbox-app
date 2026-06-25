import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import FloatingCart from "./components/FloatingCart";

export const metadata = {
  title: "Taste N' RoLLs | Cafe & Food Ordering",
  description:
    "Order delicious rolls, burgers, pizza, momos, pasta and more from Taste N' RoLLs. Freshly made with premium ingredients. Eat Healthy. Be Healthy.",
  keywords: "Taste N RoLLs, cafe, rolls, burgers, pizza, food ordering, Sampla",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <Toast />
            <FloatingCart />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
