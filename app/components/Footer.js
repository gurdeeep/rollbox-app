export default function Footer() {
  return (
    <footer className="footer" style={{ marginTop: "2rem" }}>
      <div className="footer-inner">
        <div className="footer-bottom" style={{ borderTop: "none", paddingTop: 0 }}>
          © {new Date().getFullYear()} Roll Box — POS Counter System
        </div>
      </div>
    </footer>
  );
}
