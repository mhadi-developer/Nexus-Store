import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, X, Package, ImagePlus } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useToast } from "../components/ToastProvider.jsx";

const money = (amount) => `$${Number(amount).toFixed(2)}`;
const API_URL = import.meta.env.VITE_BACKEND_URL;
const normalizeProduct = (product) => ({
  ...product,
  id: product.product_id ?? product.id,
  name: product.product_title ?? product.name,
  image: product.product_img ?? product.image,
  price: product.product_price ?? product.price,
  rating: product.product_rating ?? product.rating,
  category: product.product_category ?? product.category,
  category_id: product.product_category_id ?? product.category_id,
  in_stock: product.product_in_stock ?? product.in_stock,
  quantity: product.product_quantity ?? product.quantity,
});

async function addProductApi(product) {
  const response = await fetch(`${API_URL}/create/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Could not add product.");
  return data;
}

async function updateProductApi(productId, product) {
  const response = await fetch(`${API_URL}/update/product/${productId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Could not update product.");
  return data;
}

const createEmptyProduct = () => ({ name: "", category: "", category_id: "", price: "", quantity: "", rating: "", image: "" });

function ProductFormFields({ form, setForm, categories, categoriesLoading }) {
  return <>
    <label className="product-image-upload"><ImagePlus size={21} /><span><strong>Product image</strong><small>Add an image URL for the catalog</small></span><span className="upload-optional">Optional</span></label>
    <label className="product-field">Image URL<input type="url" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="https://example.com/product-image.jpg" /></label>
    {form.image && <div className="product-image-preview"><img src={form.image} alt="Product preview" /><span>Image preview</span></div>}
    <label className="product-field">Product name<input required autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Aero Wireless Earbuds" /></label>
    <div className="product-field-row">
      <label className="product-field">Rating<input min="0" max="5" step="0.1" type="number" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} placeholder="0.0" /></label>
      <label className="product-field">Category<select required value={form.category_id} disabled={categoriesLoading || categories.length === 0} onChange={(event) => {
        const selected = categories.find((category) => String(category.category_id) === event.target.value);
        setForm({ ...form, category_id: event.target.value, category: selected?.category_name ?? "" });
      }}><option value="">{categoriesLoading ? "Loading categories…" : "Select a category"}</option>{categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.category_name}</option>)}</select></label>
    </div>
    <div className="product-field-row">
      <label className="product-field">Price ($)<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="0.00" /></label>
      <label className="product-field">Quantity<input required min="0" step="1" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="0" /></label>
    </div>
  </>;
}

function ProductModalShell({ title, children, onClose }) {
  return <div className="product-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="product-modal nx-glass" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
      <div className="product-modal-head"><div><span className="products-eyebrow">PRODUCT DETAILS</span><h2 id="product-modal-title">{title}</h2></div><button type="button" className="product-close" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
      {children}
    </section>
  </div>;
}

function AddProductModal({ onClose, onAdd, saving, error, categories, categoriesLoading }) {
  const [form, setForm] = useState(createEmptyProduct);
  return <ProductModalShell title="Add a product" onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); onAdd(form); }}>
      <ProductFormFields form={form} setForm={setForm} categories={categories} categoriesLoading={categoriesLoading} />
      {error && <p className="product-form-error" role="alert">{error}</p>}
      <div className="product-modal-actions"><button className="product-cancel" type="button" onClick={onClose}>Cancel</button><button className="products-primary" type="submit" disabled={saving}>{saving ? "Adding…" : "Add product"}</button></div>
    </form>
  </ProductModalShell>;
}

function EditProductModal({ product, onClose, onUpdate, saving, error, categories, categoriesLoading }) {
  const [form, setForm] = useState({ name: product.name, category: product.category, category_id: String(product.category_id ?? categories.find((item) => item.category_name === product.category)?.category_id ?? ""), price: product.price, quantity: product.quantity, rating: product.rating ?? 0, image: product.image || "" });
  return <ProductModalShell title="Edit product" onClose={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); onUpdate(product.id, form); }}>
      <ProductFormFields form={form} setForm={setForm} categories={categories} categoriesLoading={categoriesLoading} />
      {error && <p className="product-form-error" role="alert">{error}</p>}
      <div className="product-modal-actions"><button className="product-cancel" type="button" onClick={onClose}>Cancel</button><button className="products-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
    </form>
  </ProductModalShell>;
}

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading , setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All products");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "All products" || (filter === "Low stock" ? product.in_stock && product.quantity <= 10 : !product.in_stock);
    return matchesQuery && matchesFilter;
  }), [products, query, filter]);



async  function getProducts(){
     try{ 
      
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/products`,{
        method: "GET",
        headers:{
          "Content-Type":"application/json"
        }
      });

      if(response.ok){
           const data = await response.json();

     setProducts(data.map(normalizeProduct));
      setLoading(false);
      }
     
        
     }catch(e){
      console.log(e)
     }finally{
      setLoading(false);
     }
  }
  async function handleAddProduct(form) {
    setSaving(true);
    setActionError("");
    const payload = { ...form, category_id: Number(form.category_id), price: Number(form.price), quantity: Number(form.quantity), rating: Number(form.rating) || 0, in_stock: Number(form.quantity) > 0 };
    try {

      const createdProduct = await addProductApi(payload);
      setProducts((items) => [...items, normalizeProduct(createdProduct)]);
      toast("New product added successfully", "success");
      setModal(null);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateProduct(productId, form) {
    setSaving(true);
    setActionError("");
    const payload = { ...form, category_id: Number(form.category_id), price: Number(form.price), quantity: Number(form.quantity), rating: Number(form.rating) || 0, in_stock: Number(form.quantity) > 0 };
    try {
      const updatedProduct = await updateProductApi(productId, payload);
      setProducts((items) => items.map((item) => item.id === productId ? normalizeProduct(updatedProduct) : item));
      toast("Product changes saved", "success");
      setModal(null);
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSaving(false);
    }
  }

  function deleteProduct(product) {
    if (window.confirm(`Delete ${product.name}?`)) {
      setProducts((items) => items.filter((item) => item.id !== product.id));
      toast(`${product.name} removed from the catalog`, "info");
    }
  }


  useEffect(()=>{
    getProducts()
    fetch(`${API_URL}/categories`).then(async (response) => {
      if (!response.ok) throw new Error("Could not load categories.");
      setCategories(await response.json());
    }).catch((error) => setActionError(error.message)).finally(() => setCategoriesLoading(false));
  },[])

  return (
    <div className="nx-shell">
      <Header active="/admin/products" notifications={3} initials="NX" />
      <main className="nx-main">
        <div className="nx-page-head">
          <div><span className="products-eyebrow">CATALOG</span><h1>Products</h1><p>Manage your catalog, pricing and inventory.</p></div>
          <button className="products-primary" type="button" onClick={() => { setActionError(""); setModal("add"); }}><Plus size={17} /> Add product</button>
        </div>

        <div className="products-stats">
          <section className="nx-glass product-stat"><span className="product-stat-icon purple"><Package size={19} /></span><div><span>Total products</span><strong>{products.length}</strong></div></section>
          <section className="nx-glass product-stat"><span className="product-stat-icon teal">↗</span><div><span>In stock</span><strong>{products.filter((p) => p.in_stock).length}</strong></div></section>
          <section className="nx-glass product-stat"><span className="product-stat-icon amber">!</span><div><span>Needs attention</span><strong>{products.filter((p) => !p.in_stock || p.quantity <= 10).length}</strong></div></section>
        </div>

        <section className="nx-glass products-panel">
          <div className="products-toolbar">
            <div><h2 className="nx-card-title">All products <span className="product-count">{filtered.length}</span></h2><p className="nx-card-sub">Your product inventory in one place</p></div>
            <div className="products-controls">
              <label className="products-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." aria-label="Search products" /></label>
              <select className="products-select" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter products"><option>All products</option><option>Low stock</option><option>Out of stock</option></select>
            </div>
          </div>
          <div className="nx-table-wrap">
            <table className="nx-table products-table">
              <thead><tr><th>Image</th><th>Product</th><th>Quantity</th><th>Category</th><th>Price</th><th>Rating</th><th>Availability</th><th><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>{filtered.map((product) => <tr key={product.id}>
                <td><span className="product-thumb" style={{ "--product-color": "#19d3c5" }}>{product.image ? <img src={product.image} alt={`${product.name}`} /> : <ImagePlus size={16} aria-hidden="true" />}</span></td>
                <td><strong>{product.name}</strong></td>
                <td className="product-quantity">{product.quantity}</td><td>{product.category}</td><td className="product-price">{money(product.price)}</td><td>{Number(product.rating || 0).toFixed(1)} <span className="product-rating-star">&#9733;</span></td><td><span className={`product-status ${product.in_stock ? "active" : "out-of-stock"}`}><i />{product.in_stock ? "In stock" : "Out of stock"}</span></td>
                <td><div className="product-actions"><button type="button" onClick={() => { setActionError(""); setModal({ type: "edit", product }); }} aria-label={`Edit ${product?.name}`} title="Edit product"><Pencil size={15} /></button><button type="button" className="delete" onClick={() => deleteProduct(product)} aria-label={`Delete ${product.name}`} title="Delete product"><Trash2 size={15} /></button></div></td>
              </tr>)}</tbody>
            </table>
            {loading ? <div className="products-empty"><Package size={25} /><strong>Loading products…</strong></div> : filtered.length === 0 && <div className="products-empty"><Package size={25} /><strong>No products found</strong><span>Try another search or filter.</span></div>}
          </div>
          <div className="products-foot">Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products</div>
        </section>
      </main>
      <Footer />

      {modal === "add" && <AddProductModal onClose={() => setModal(null)} onAdd={handleAddProduct} saving={saving} error={actionError} categories={categories} categoriesLoading={categoriesLoading} />}
      {modal?.type === "edit" && <EditProductModal product={modal.product} onClose={() => setModal(null)} onUpdate={handleUpdateProduct} saving={saving} error={actionError} categories={categories} categoriesLoading={categoriesLoading} />}
    </div>
  );
}
