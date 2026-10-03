import React, { useState } from 'react';
import '../css/header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <p>🚚 Free Express Shipping on Orders Over $50 | Use Code: <strong>SPRING20</strong></p>
      </div>

      {/* Main Navigation Bar */}
      <div className="main-nav-container">
        <div className="nav-left">
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            ☰
          </button>
          <a href="/" className="logo">
            Nexus<span className="logo-accent">Store</span>
          </a>
        </div>

        <nav className={`nav-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <a href="/" className="nav-link active">Home</a>
          <a href="/shop" className="nav-link">Shop</a>
          <a href="/categories" className="nav-link">Categories</a>
          <a href="/deals" className="nav-link">Deals</a>
          <a href="/about" className="nav-link">About</a>
        </nav>

        <div className="nav-right">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search products..." />
          </div>
          
          <button className="icon-btn" aria-label="Wishlist">
            ❤️
            <span className="badge-count">3</span>
          </button>

          <button className="icon-btn cart-btn" aria-label="Shopping Cart">
            🛒
            <span className="badge-count">2</span>
          </button>

          <button className="icon-btn user-profile" aria-label="User account">
            👤
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;