import {useEffect , useState} from 'react';
import '../css/homepage.css';
import { Link } from 'react-router';
import InlineLoader from '../components/InlineLoader.jsx';
import { useCart } from '../context/CartContext.jsx';

const ShopNowButton = ({ to }) => <Link to={to} className="btn btn-primary">Shop Now</Link>;
const ExploreCollectionButton = ({ to }) => <Link to={to} className="btn btn-outline">Explore Collection</Link>;


const normalizeProduct = (product) => ({
  ...product,
  product_id: product.product_id ?? product.id,
  product_title: product.product_title ?? product.name,
  product_img: product.product_img ?? product.image,
  product_price: product.product_price ?? product.price,
  product_rating: product.product_rating ?? product.rating,
  product_category: product.product_category ?? product.category,
  product_quantity: product.product_quantity ?? product.quantity,
  product_in_stock: product.product_in_stock ?? product.in_stock,
  product_category_id: product.product_category_id ?? product.category_id,
});

const HomePage = () => {

    const [products , setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categories , setCategories] = useState([]);
    const {cart , addToCart} = useCart()
  
   async function fetchProducts(){
    try {
        setProductsLoading(true);
        const limit = 8;
        const offset = 0

        const response =  await fetch(`${import.meta.env.VITE_BACKEND_URL}/products?limit=${limit}&offset=${offset}`,{
            method: "GET",
            headers:{
                "Content-Type":"application/json"
            }
        });

        if (!response.ok) throw new Error('Could not load products');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data.map(normalizeProduct) : []);
        
    } catch (error) {
        console.log('Erorr------------------->', error);
    } finally {
        setProductsLoading(false);
    }
   }
// fetch categoires 

async function fetchCategoires(){
  try{
     setCategoriesLoading(true);
     const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/categories`,
    { method:"GET",
      headers:{
      "Content-Type": "application/json"
      }
     });

     if (response.ok){
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
     }
  }catch(e){
     console.log('Error fetching categories:', e);
  } finally{
    setCategoriesLoading(false);
  }
}


  // Sample data for categories
  // const categories = [
  //   { id: 1, name: 'Electronics', icon: '💻', count: '120+ Items' },
  //   { id: 2, name: 'Fashion & Apparel', icon: '🧥', count: '340+ Items' },
  //   { id: 3, name: 'Home & Living', icon: '🛋️', count: '95+ Items' },
  //   { id: 4, name: 'Fitness & Sports', icon: '⚽', count: '75+ Items' },
  // ];




  useEffect(()=>{
    fetchProducts();
    fetchCategoires();
  }, [])


  return (
    <div className="homepage">
      {(categoriesLoading || productsLoading) && (
        <InlineLoader
          className="home-loading-indicator"
          text="Loading categories and products..."
        />
      )}
      {/* --- HERO SECTION --- */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">⚡ New Season Arrivals</span>
          <h1 className="hero-title">Elevate Your Everyday Tech & Lifestyle</h1>
          <p className="hero-description">
            Discover premium quality gear, state-of-the-art electronics, and modern essentials crafted for performance and style.
          </p>
          <div className="hero-actions">
            <ShopNowButton to="/shop" />
            <ExploreCollectionButton to={"/categories"}/>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img
            src="/e-commerce-hero-img.avif"
            alt="E-commerce Hero Showcase" 
            className="hero-image"
            fetchPriority="high"
            decoding="async"
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
          <Link to="/categories" className="view-all">Browse All →</Link>
        </div>
        <div className="categories-grid">
          {categoriesLoading ? <InlineLoader text="Loading categories..." /> : categories.map((cat) => (
            <div key={cat.category_id} className="category-card">
              <span className="category-icon">
                <img src={cat.category_image} alt="" loading="lazy" decoding="async" />
                </span>
              <h3>{cat.category_name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURED PRODUCTS SECTION --- */}
      <section className="products-section" id='feature-products'>
        <div className="section-header">
          <div>
            <h2>Featured Products</h2>
            <p className="section-subtitle">Handpicked items tailored for your modern workspace and lifestyle.</p>
          </div>
          <Link to="/shop" className="view-all">View All Products →</Link>
        </div>
       <div className="products-grid">
  {productsLoading ? <InlineLoader text="Loading products..." /> : products.map((product) => (
    <div key={product.product_id} className="product-card">
      <div className="product-image-container">
        <span className={`product-badge ${product.product_category.toLowerCase().replace(' ', '-')}`}>
          {product.product_category}
        </span>
        <img src={product?.product_img} alt={product.product_title} className="product-image" loading="lazy" decoding="async" />

        {
         cart.length > 0 && cart.find((item)=> item.product_id == product.product_id) ?  <button className="quick-add-btn"  disabled={true} aria-label="Add to cart" > Already Added</button>:  <button className="quick-add-btn" aria-label="Add to cart" onClick={()=>addToCart(product)}>+ Quick Add</button>
        }
      </div>
      <div className="product-details">
        <div className="product-rating">
          ⭐ {product.product_rating}
        </div>
        <h3 className="product-title">{product.product_title}</h3>
        <div className="product-pricing">
          <span className="current-price">${product.product_price}</span>
          {product.product_price && (
            <span className="original-price">${product.product_price}</span>
          )}
        </div>
        {/* View Details Link / Button */}
        <Link to={`/product/details/${product.product_id}`} className="view-details-link">
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
