import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search, ShoppingBag } from 'lucide-react';
import InlineLoader from '../components/InlineLoader.jsx';
import '../css/shop-page.css';

function normalizeProduct(product) {
  return {
    ...product,
    id: product.id ?? product.product_id,
    name: product.name ?? product.product_title ?? 'Product',
    image: product.image ?? product.product_img ?? '',
    price: Number(product.price ?? product.product_price ?? 0),
    rating: product.rating ?? product.product_rating ?? 0,
    category: product.category ?? product.product_category ?? 'Other',
  };
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pageSize = 12;

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError('');
        const params = new URLSearchParams({ skip: String(skip), limit: String(pageSize) });
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products/all?${params}`, {
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Could not load products. Please try again.');
        const data = await response.json();
        setProducts(Array.isArray(data.products) ? data.products.map(normalizeProduct) : []);
        setTotal(Number(data.total) || 0);
        setHasMore(Boolean(data.has_more));
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setError(loadError.message || 'Could not load products.');
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [skip]);

  useEffect(() => {
    setSkip(0);
  }, [query, category]);

  const categories = useMemo(
    () => ['All', ...new Set(products.map((product) => product.category).filter(Boolean))],
    [products],
  );

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const matchesQuery = !normalizedQuery || `${product.name} ${product.category}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  if (loading) return <main className="shop-page"><InlineLoader text="Loading products..." /></main>;

  return (
    <main className="shop-page">
      <section className="shop-intro">
        <span className="shop-kicker">THE NEXUS COLLECTION</span>
        <h1>Find your next favorite</h1>
        <p>Explore our complete collection of gear, essentials, and everyday upgrades.</p>
      </section>

      <section className="shop-catalog" aria-label="Product catalog">
        <div className="shop-toolbar">
          <div className="shop-result-count" aria-live="polite">
            {visibleProducts.length} shown · {total} total
          </div>
          <label className="shop-search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search products</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." />
          </label>
        </div>

        <div className="shop-category-list" aria-label="Filter by category">
          {categories.map((item) => (
            <button
              className={`shop-category-chip ${category === item ? 'active' : ''}`}
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {error ? (
          <div className="shop-message" role="alert">{error}</div>
        ) : visibleProducts.length === 0 ? (
          <div className="shop-message">
            <ShoppingBag size={30} aria-hidden="true" />
            <h2>{products.length ? 'No matching products' : 'No products available yet'}</h2>
            <p>{products.length ? 'Try a different search or category.' : 'Please check back soon.'}</p>
          </div>
        ) : (
          <div className="shop-products-grid">
            {visibleProducts.map((product, index) => (
              <article className="shop-product-card" key={product.id ?? `${product.name}-${index}`}>
                <Link className="shop-product-image-wrap" to={`/product/details/${product.id}`} aria-label={`View ${product.name}`}>
                  {product.image ? <img src={product.image} alt={product.name} loading="lazy" decoding="async" /> : <ShoppingBag size={42} aria-hidden="true" />}
                  <span className="shop-product-category">{product.category}</span>
                </Link>
                <div className="shop-product-info">
                  <p className="shop-product-rating" aria-label={`Rating ${product.rating} out of 5`}>★ {product.rating}</p>
                  <h2>{product.name}</h2>
                  <div className="shop-product-footer">
                    <strong>${product.price.toFixed(2)}</strong>
                    <Link to={`/product/details/${product.id}`}>View details <span aria-hidden="true">→</span></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!error && total > 0 && (
          <nav className="shop-pagination" aria-label="Product pages">
            <button type="button" onClick={() => setSkip((current) => Math.max(0, current - pageSize))} disabled={skip === 0 || loading}>
              Previous
            </button>
            <span>Page {Math.floor(skip / pageSize) + 1} of {Math.max(1, Math.ceil(total / pageSize))}</span>
            <button type="button" onClick={() => setSkip((current) => current + pageSize)} disabled={!hasMore || loading}>
              Next
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
