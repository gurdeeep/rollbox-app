export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-content">
          <div className="footer-brand">
            🥡 Taste N' RoLLs
          </div>
          <div className="footer-tagline">
            Eat Healthy. Be Healthy. 🙏
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Taste N' RoLLs — Made with ❤️
        </div>
      </div>
    </footer>
  );
}
