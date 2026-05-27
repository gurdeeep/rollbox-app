import "./globals.css";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";

export const metadata = {
  title: "Roll Box | Cafe & Food Ordering",
  description:
    "Order delicious rolls, burgers, pizza, momos, pasta and more from Roll Box. Freshly made with premium ingredients. Eat Healthy. Be Healthy.",
  keywords: "Roll Box, cafe, rolls, burgers, pizza, food ordering, delivery",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
