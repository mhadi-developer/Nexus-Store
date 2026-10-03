import {useEffect , useState} from 'react';
import '../css/homepage.css';
import { Link } from 'react-router';

const HomePage = () => {

    const [products , setProducts] = useState([]);
    const [laoding , setLoading] = useState(false);

   async function fetchProducts(){
    try {
        setLoading(true);
        const response =  await fetch("http://localhost:8000/products",{
            method: "GET",
            headers:{
                "Content-Type":"application/json"
            }
        });

        const data = await response.json();
        if(data){
            setProducts(data);
            setLoading(false);
        }
        
    } catch (error) {
        console.log('Erorr------------------->', error);
        setLoading(false);
    }
   }
console.log(products);


  // Sample data for categories
  const categories = [
    { id: 1, name: 'Electronics', icon: '💻', count: '120+ Items' },
    { id: 2, name: 'Fashion & Apparel', icon: '🧥', count: '340+ Items' },
    { id: 3, name: 'Home & Living', icon: '🛋️', count: '95+ Items' },
    { id: 4, name: 'Fitness & Sports', icon: '⚽', count: '75+ Items' },
  ];




  useEffect(()=>{
    fetchProducts();
  }, [])

  return (
    <div className="homepage">
      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">⚡ New Season Arrivals</span>
          <h1 className="hero-title">Elevate Your Everyday Tech & Lifestyle</h1>
          <p className="hero-description">
            Discover premium quality gear, state-of-the-art electronics, and modern essentials crafted for performance and style.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary">Shop Now</button>
            <button className="btn btn-outline">Explore Collections</button>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800" 
            alt="E-commerce Hero Showcase" 
            className="hero-image"
          />
        </div>
      </section>

      {/* --- FEATURES STRIP --- */}
      <section className="features-strip">
        <div className="feature-item">
          <span className="feature-icon">🚚</span>
          <div>
            <h4>Free Global Shipping</h4>
            <p>On orders over $50</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔒</span>
          <div>
            <h4>Secure Payments</h4>
            <p>100% protected transactions</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔄</span>
          <div>
            <h4>Easy 30-Day Returns</h4>
            <p>Hassle-free money back guarantee</p>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">💬</span>
          <div>
            <h4>24/7 Dedicated Support</h4>
            <p>Always here to help you</p>
          </div>
        </div>
      </section>

      {/* --- CATEGORIES SECTION --- */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <a href="#categories" className="view-all">Browse All →</a>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card">
              <span className="category-icon">{cat.icon}</span>
              <h3>{cat.name}</h3>
              <p>{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURED PRODUCTS SECTION --- */}
      <section className="products-section">
        <div className="section-header">
          <div>
            <h2>Featured Products</h2>
            <p className="section-subtitle">Handpicked items tailored for your modern workspace and lifestyle.</p>
          </div>
          <a href="#products" className="view-all">View All Products →</a>
        </div>
       <div className="products-grid">
  {products.map((product) => (
    <div key={product.id} className="product-card">
      <div className="product-image-container">
        <span className={`product-badge ${product.category.toLowerCase().replace(' ', '-')}`}>
          {product.category}
        </span>
        <img src={product?.image} alt={product.name} className="product-image" />
        <button className="quick-add-btn" aria-label="Add to cart">+ Quick Add</button>
      </div>
      <div className="product-details">
        <div className="product-rating">
          ⭐ {product.quantity}
        </div>
        <h3 className="product-title">{product.name}</h3>
        <div className="product-pricing">
          <span className="current-price">${product.price}</span>
          {product.price && (
            <span className="original-price">${product.price}</span>
          )}
        </div>
        {/* View Details Link / Button */}
        <Link to={`/product/details/${product.id}`} className="view-details-link">
          View Details
        </Link>
      </div>
    </div>
  ))}
</div>
      </section>

      {/* --- PROMO BANNER SECTION --- */}
      <section className="promo-banner">
        <div className="promo-content">
          <span className="promo-tag">Limited Time Offer</span>
          <h2>Spring Flash Sale: Save Up to 40% Off</h2>
          <p>Upgrade your setup today with incredible discounts across all hardware and audio categories.</p>
          <button className="btn btn-light">Claim Discount</button>
        </div>
      </section>

      {/* --- NEWSLETTER SECTION --- */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <h2>Stay Ahead of the Curve</h2>
          <p>Subscribe to our newsletter to receive early access to new product drops, exclusive sales, and tech insights.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address..." required />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;