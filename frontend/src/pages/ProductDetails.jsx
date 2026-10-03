import React, {useState , useEffect} from 'react';
import '../css/product-details-page.css';
import {useParams} from "react-router"; 
import Loader from '../components/Loader';

const ProductDetail = () => {
 const {id} = useParams();
 const [product , setProduct] = useState(null);
 const [loading , setLoading] = useState(false);

 async function fetchProductDetails(){
    try{
    setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/product/details/${id}`,{
        method:"GET",
        headers:{
            "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if(data){
        setProduct(data);
        setLoading(false);
      }
    }catch(e){
        console.log('Error fetching product details:', e);
        setLoading(false);
    }   
 }

 useEffect(()=>{
    fetchProductDetails()
 },[])


if (loading) {
    return <Loader fullScreen={true} text="Fetching Product data....." />;
  }

  return (
    <div className="product-detail-page">
      <nav className="breadcrumb">
        <a href="/">Home</a> / <a href="/shop">Shop</a> / <a href="/category">{product?.category}</a> / <span>{product?.name}</span>
      </nav>

      <div className="product-detail-container">
        <div className="product-gallery">
          <div className="main-image-wrapper">
            <span className={`stock-badge ${product?.in_stock ? 'in-stock' : 'out-of-stock'}`}>
              {product?.in_stock ? `${product?.quantity} Units Available` : 'Sold Out'}
            </span>
            <img src={product?.image} alt={product?.name} className="main-product-image" />
          </div>
        </div>

        <div className="product-info-column">
          <span className="product-category-tag">{product?.category}</span>
          <h1 className="product-name">{product?.name}</h1>

          <div className="rating-review-row">
            <span className="stars">⭐ {product?.rating}</span>
            <span className="review-count">(124 Customer Reviews)</span>
          </div>

          <div className="product-price-row">
            <span className="current-price">${product?.price?.toFixed(2)}</span>
            <span className="tax-note">Inclusive of all taxes</span>
          </div>

          <p className="product-short-desc">
            Engineered for high-end performance, the {product?.name} offers premium build quality, ergonomic precision, and long-lasting durability for daily professional use.
          </p>

          <hr className="divider" />

          {product?.in_stock ? (
            <div className="purchase-controls">
              <div className="quantity-selector">
                <button aria-label="Decrease quantity">-</button>
                <span>1</span>
                <button aria-label="Increase quantity">+</button>
              </div>
              <button className="btn btn-primary add-to-cart-btn">
                Add to Cart • ${product?.price.toFixed(2)}
              </button>
            </div>
          ) : (
            <div className="sold-out-alert">
              <p>⚠️ This item is currently out of stock. Check back later or add it to your wishlist.</p>
              <button className="btn btn-outline">Add to Wishlist</button>
            </div>
          )}

          <div className="product-meta-list">
            <div className="meta-item">
              <span>🚚 Free Shipping:</span> Orders over $50 qualify for expedited delivery.
            </div>
            <div className="meta-item">
              <span>🔄 Warranty:</span> 1-Year manufacturer replacement guarantee.
            </div>
          </div>
        </div>
      </div>

      <div className="product-tabs-section">
        <div className="tabs-header">
          <button className="tab-btn active">Description</button>
          <button className="tab-btn">Specifications</button>
          <button className="tab-btn">Reviews (124)</button>
        </div>

        <div className="tab-content">
          <div className="tab-pane">
            <h3>Immersive Quality & Ergonomic Design</h3>
            <p>
              Designed specifically for users who demand excellence, the {product?.name} integrates seamlessly into any hardware ecosystem. Built with sustainable premium materials and rigorously tested for maximum reliability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;