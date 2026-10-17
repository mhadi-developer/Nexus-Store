import React, { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import '../css/header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.userName : '';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const handleSignOut = () => {
    signOut();
    setIsProfileMenuOpen(false);
  };

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

          <Link to="/cart" className="icon-btn cart-btn" aria-label="Shopping Cart">
            🛒
            <span className="badge-count">2</span>
          </Link>

          {user ? (
            <div className="profile-area">
              <button
                type="button"
                className="profile-trigger"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsProfileMenuOpen((open) => !open)}
              >
                <span className="profile-avatar" aria-hidden="true">{initials || <UserRound size={20} />}</span>
                <span className="profile-copy">
                  <strong>{displayName || user.userName}</strong>
                  <small>@{user.userName}</small>
                </span>
                <ChevronDown className={`profile-chevron ${isProfileMenuOpen ? 'is-open' : ''}`} size={17} />
              </button>
              {isProfileMenuOpen && (
                <div className="profile-menu" role="menu">
                  <div className="profile-menu-details">
                    <strong>{displayName || user.userName}</strong>
                    <span>{user.email}</span>
                  </div>
                  <button type="button" className="profile-menu-signout" role="menuitem" onClick={handleSignOut}>
                    <LogOut size={17} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={`profile-signin ${loading ? 'is-loading' : ''}`} aria-label="Sign in">
              <span className="profile-avatar" aria-hidden="true"><UserRound size={20} /></span>
              <span className="profile-copy">
                <strong>{loading ? 'Loading profile' : 'Sign in'}</strong>
                <small>{loading ? 'Please wait…' : 'Welcome back'}</small>
              </span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
