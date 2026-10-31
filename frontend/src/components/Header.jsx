import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { Camera, ChevronDown, LockKeyhole, LogOut, Trash2, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import '../css/header.css';
import { useCart } from '../context/CartContext.jsx';

const Header = () => {
  const {cart} = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, loading, signOut, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [removingProfileImage, setRemovingProfileImage] = useState(false);
  const [profileImageMessage, setProfileImageMessage] = useState("");
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() || user.userName : '';
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const profileImageUrl = user?.profileImageUrl && backendUrl
    ? new URL(user.profileImageUrl, backendUrl).toString()
    : null;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileImageMessage("");
    setUploadingProfileImage(true);
    try {
      const token = window.localStorage.getItem("access_token");
      if (!backendUrl) throw new Error("VITE_BACKEND_URL is not configured.");
      if (!token) throw new Error("Sign in again to upload a profile picture.");

      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/user/profile-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = result?.detail;
        const message = Array.isArray(detail)
          ? detail.map((item) => item.msg).filter(Boolean).join(" ")
          : detail;
        throw new Error(typeof message === "string" ? message : `Image upload failed (${response.status}).`);
      }

      await refreshUser();
      setProfileImageMessage("Profile picture updated.");
    } catch (error) {
      setProfileImageMessage(error instanceof Error ? error.message : "Unable to upload the profile picture.");
    } finally {
      setUploadingProfileImage(false);
      event.target.value = "";
    }
  };

  const handleRemoveProfileImage = async () => {
    setProfileImageMessage("");
    setRemovingProfileImage(true);
    try {
      const token = window.localStorage.getItem("access_token");
      if (!backendUrl) throw new Error("VITE_BACKEND_URL is not configured.");
      if (!token) throw new Error("Sign in again to remove your profile picture.");

      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/user/profile-image`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const detail = result?.detail;
        const message = Array.isArray(detail)
          ? detail.map((item) => item.msg).filter(Boolean).join(" ")
          : detail;
        throw new Error(typeof message === "string" ? message : `Image removal failed (${response.status}).`);
      }

      await refreshUser();
      setProfileImageMessage("Profile picture removed.");
    } catch (error) {
      setProfileImageMessage(error instanceof Error ? error.message : "Unable to remove the profile picture.");
    } finally {
      setRemovingProfileImage(false);
    }
  };

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
            <span className="badge-count">{cart?.length>0 ? cart?.length : 0}</span>
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
                <span className="profile-avatar" aria-hidden="true">
                  {profileImageUrl
                    ? <img src={profileImageUrl} alt="" />
                    : initials || <UserRound size={20} />}
                </span>
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
                  <Link
                    to="/change-password"
                    className="profile-menu-link"
                    role="menuitem"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <LockKeyhole size={17} /> Change password
                  </Link>
                  <input
                    ref={fileInputRef}
                    className="profile-image-input"
                    type="file"
                    accept="image/*"
                    aria-label="Choose an optional profile picture"
                    onChange={handleProfileImageChange}
                  />
                  <button
                    type="button"
                    className="profile-menu-upload"
                    role="menuitem"
                    disabled={uploadingProfileImage || removingProfileImage}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={17} />
                    {uploadingProfileImage
                      ? "Uploading..."
                      : removingProfileImage
                        ? "Removing..."
                      : profileImageUrl ? "Change profile picture" : "Add profile picture (optional)"}
                  </button>
                  {profileImageUrl && (
                    <button
                      type="button"
                      className="profile-menu-remove"
                      role="menuitem"
                      disabled={uploadingProfileImage || removingProfileImage}
                      onClick={handleRemoveProfileImage}
                    >
                      <Trash2 size={17} />
                      {removingProfileImage ? "Removing..." : "Remove profile picture"}
                    </button>
                  )}
                  {profileImageMessage && <p className="profile-image-message" role="status">{profileImageMessage}</p>}
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
