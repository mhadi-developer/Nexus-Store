import { useEffect, useState } from 'react';
import { ArrowDown, Layers3 } from 'lucide-react';
import { Link } from 'react-router';
import InlineLoader from '../components/InlineLoader.jsx';
import '../css/categories-page.css';

function normalizeProduct(product) {
  return {
    ...product,
    id: product.id ?? product.product_id,
    name: product.name ?? product.product_title ?? 'Product',
    image: product.image ?? product.product_img ?? '',
    price: Number(product.price ?? product.product_price ?? 0),
    rating: product.rating ?? product.product_rating ?? 0,
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/categories`, {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Could not load categories. Please try again.');
        const data = await response.json();
        const availableCategories = Array.isArray(data) ? data : [];
        setCategories(availableCategories);
        setSelectedCategory(availableCategories[0] ?? null);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') setError(loadError.message || 'Could not load categories.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCategories();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      return undefined;
    }

    const controller = new AbortController();
    setProductsLoading(true);
    setProductsError('');

    async function loadCategoryProducts() {
      try {
        const params = new URLSearchParams({ category_id: String(selectedCategory.category_id) });
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products?${params}`, {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Could not load products for this category. Please try again.');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data.map(normalizeProduct) : []);
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setProductsError(loadError.message || 'Could not load products for this category.');
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) setProductsLoading(false);
      }
    }

    loadCategoryProducts();
    return () => controller.abort();
  }, [selectedCategory]);

  if (loading) return <main className="categories-page"><InlineLoader text="Loading categories..." /></main>;

  return (
    <main className="categories-page">
      <section className="categories-intro">
        <span className="categories-kicker">BROWSE THE COLLECTION</span>
        <h1>Shop by category</h1>
        <p>Choose a category to explore the products in our collection.</p>
        {categories.length > 0 && (
          <a className="categories-jump-link" href="#category-products">
            Explore categories <ArrowDown size={16} aria-hidden="true" />
          </a>
        )}
      </section>

      <section className="categories-browser" aria-label="Categories">
        <div className="categories-browser-heading">
          <div>
            <h2>All categories</h2>
            <p>Select one to see its products below.</p>
          </div>
          {!error && <span>{categories.length} {categories.length === 1 ? 'category' : 'categories'}</span>}
        </div>

        {error ? (
          <div className="categories-empty-state" role="alert">{error}</div>
        ) : categories.length === 0 ? (
          <div className="categories-empty-state">
            <Layers3 size={30} aria-hidden="true" />
            <h3>No categories yet</h3>
                  <p>Categories will appear here when they’re available.</p>
          </div>
        ) : (
          <div className="categories-page-grid">
            {categories.map((category) => {
              const isSelected = selectedCategory?.category_id === category.category_id;
              return (
                <button
                  className={`categories-page-card ${isSelected ? 'selected' : ''}`}
                  key={category.category_id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.category_image ? (
                    <img className="categories-page-image" src={category.category_image} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <span className="categories-page-image categories-page-image-placeholder" aria-hidden="true">
                      <Layers3 size={32} />
                    </span>
                  )}
                  <span className="categories-page-name">{category.category_name}</span>
                  <span className="categories-page-action">View products <span aria-hidden="true">→</span></span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="category-products-placeholder" id="category-products" aria-live="polite">
        <div className="category-products-heading">
          <div>
            <span className="categories-kicker">CATEGORY COLLECTION</span>
            <h2>{selectedCategory ? `Products in ${selectedCategory.category_name}` : 'Category products'}</h2>
          </div>
          {selectedCategory && <span className="category-products-name">{selectedCategory.category_name}</span>}
        </div>
        {productsLoading ? (
          <InlineLoader text={`Loading products in ${selectedCategory?.category_name ?? 'this category'}...`} />
        ) : productsError ? (
          <div className="category-products-empty" role="alert">{productsError}</div>
        ) : products.length === 0 ? (
          <div className="category-products-empty">
            <Layers3 size={30} aria-hidden="true" />
            <p>No products found in this category yet.</p>
          </div>
        ) : (
          <div className="category-products-grid">
            {products.map((product, index) => (
              <article className="category-product-card" key={product.id ?? `${product.name}-${index}`}>
                <Link className="category-product-image" to={`/product/details/${product.id}`} aria-label={`View ${product.name}`}>
                  {product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" /> : <Layers3 size={36} aria-hidden="true" />}
                </Link>
                <div className="category-product-info">
                  <p className="category-product-rating" aria-label={`Rating ${product.rating} out of 5`}>★ {product.rating}</p>
                  <h3>{product.name}</h3>
                  <div className="category-product-footer">
                    <strong>${product.price.toFixed(2)}</strong>
                    <Link to={`/product/details/${product.id}`}>View details →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
