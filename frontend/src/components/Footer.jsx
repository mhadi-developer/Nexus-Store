import React from 'react';
import '../css/footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-col brand-col">
          <a href="/" className="logo">
            Nexus<span className="logo-accent">Store</span>
          </a>
          <p className="footer-bio">
            Your destination for premium quality tech hardware, modern lifestyle goods, and seamless shopping experiences.
          </p>
          <div className="social-icons">
            <a href="#facebook" aria-label="Facebook">🌐</a>
            <a href="#twitter" aria-label="Twitter">🐦</a>
            <a href="#instagram" aria-label="Instagram">📷</a>
            <a href="#linkedin" aria-label="LinkedIn">💼</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Navigation</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/shop">Shop All</a></li>
            <li><a href="/categories">Categories</a></li>
            <li><a href="/deals">Flash Sales</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Service</h4>
          <ul>
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/track">Track Order</a></li>
            <li><a href="/returns">Returns & Exchanges</a></li>
            <li><a href="/faqs">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Legal & Security</h4>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
            <li><a href="/security">Security Guarantee</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} NexusStore Inc. All rights reserved.</p>
        <div className="payment-methods">
          <span>💳 Visa</span>
          <span>💳 Mastercard</span>
          <span>💳 Apple Pay</span>
          <span>💳 PayPal</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;