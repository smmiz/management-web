// components/Navbar.js
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-logo">
        AGENCIA
      </Link>
      <div className="navbar-links">
        <Link href="/">Modelos</Link>
        <Link href="/about">Sobre Nosotros</Link> {/* Página de ejemplo */}
        <Link href="/contact">Contacto</Link> {/* Página de ejemplo */}
      </div>
    </nav>
  );
};

export default Navbar;
