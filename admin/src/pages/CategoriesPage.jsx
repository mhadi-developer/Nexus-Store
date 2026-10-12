import { useEffect, useMemo, useState } from "react";
import { FolderTree, Search, Plus, Pencil, Trash2, X, Package } from "lucide-react";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { useToast } from "../components/ToastProvider.jsx";

const API_URL = import.meta.env.VITE_BACKEND_URL;

async function readApiResponse(response, fallbackMessage) {
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || fallbackMessage);
  return data;
}

async function createCategoryApi(category) {
  const response = await fetch(`${API_URL}/create/category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category_name: category.category_name, category_image: category.category_image }),
  });
  const data = await readApiResponse(response, "Could not add category.");
  return {
    ...data,
  };
}

async function updateCategoryApi(category, values) {
  const response = await fetch(`${API_URL}/update/category/${category.category_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category_name: values.category_name, category_image: values.category_image }),
  });
  const data = await readApiResponse(response, "Could not update category.");
  return {
    ...category,
    ...data,
  };
}

async function deleteCategoryApi(category) {
  const response = await fetch(`${API_URL}/delete/category/${category.category_id}`, { method: "DELETE" });
  await readApiResponse(response, "Could not delete category.");
}

function CategoryModal({ category, onClose, onSave, saving, error }) {
  const [name, setName] = useState(category?.category_name ?? "");
  const [image, setImage] = useState(category?.category_image ?? "");
  const editing = Boolean(category);

  return <div className="product-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="product-modal nx-glass" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
      <div className="product-modal-head"><div><span className="products-eyebrow">CATALOG ORGANIZATION</span><h2 id="category-modal-title">{editing ? "Edit category" : "Add a category"}</h2></div><button type="button" className="product-close" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div>
      <form onSubmit={(event) => { event.preventDefault(); onSave({ category_name: name.trim(), category_image: image.trim() }); }}>
        <label className="product-field">Category name<input required autoFocus maxLength={50} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Home & Living" /></label>
        <label className="product-field">Image URL<input required type="url" maxLength={500} value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://example.com/category-image.jpg" /></label>
        {image && <div className="category-image-preview"><img src={image} alt="Category preview" onError={(event) => { event.currentTarget.dataset.failed = "true"; }} onLoad={(event) => { delete event.currentTarget.dataset.failed; }} /><span>Preview</span></div>}
        {error && <p className="product-form-error" role="alert">{error}</p>}
        <div className="product-modal-actions"><button className="product-cancel" type="button" onClick={onClose}>Cancel</button><button className="products-primary" type="submit" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : "Add category"}</button></div>
      </form>
    </section>
  </div>;
}

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch(`${API_URL}/categories`),
          fetch(`${API_URL}/products`),
        ]);
        if (!categoryResponse.ok) throw new Error("Could not load categories.");
        const fetchedCategories = await categoryResponse.json();
        const fetchedProducts = productResponse.ok ? await productResponse.json() : [];
        if (!active) return;
        setCategories(fetchedCategories);
        setProducts(fetchedProducts);
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || "Could not load categories.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => categories.filter((category) => category.category_name.toLowerCase().includes(query.toLowerCase())), [categories, query]);
  const productCount = (categoryName) => products.filter((product) => product.category === categoryName).length;

  async function saveCategory(values) {
    setSaving(true);
    setError("");
    const duplicate = categories.some((item) => item.category_name.toLowerCase() === values.category_name.toLowerCase() && item.category_id !== modal?.category?.category_id);
    if (duplicate) {
      setError("A category with this name already exists.");
      setSaving(false);
      return;
    }
    if (modal?.category) {
      try {
        const updatedCategory = await updateCategoryApi(modal.category, values);
        setCategories((items) => items.map((item) => item.category_id === modal.category.category_id ? updatedCategory : item));
        toast("Category changes saved", "success");
      } catch (requestError) {
        setError(requestError.message || "Could not update category.");
        setSaving(false);
        return;
      }
    } else {
      try {
        const createdCategory = await createCategoryApi(values);
        setCategories((items) => [...items, createdCategory]);
        toast("Category added successfully", "success");
      } catch (requestError) {
        setError(requestError.message || "Could not add category.");
        setSaving(false);
        return;
      }
    }
    setModal(null);
    setSaving(false);
  }

  async function deleteCategory(category) {
    if (window.confirm(`Delete the “${category.category_name}” category?`)) {
      try {
        await deleteCategoryApi(category);
        setCategories((items) => items.filter((item) => item.category_id !== category.category_id));
        toast("Category deleted", "info");
      } catch (requestError) {
        toast(requestError.message || "Could not delete category.", "error");
      }
    }
  }

  return <div className="nx-shell">
    <Header active="/admin/categories" notifications={3} initials="NX" />
    <main className="nx-main">
      <div className="nx-page-head">
        <div><span className="products-eyebrow">CATALOG</span><h1>Categories</h1><p>Organize products into clear, easy-to-browse collections.</p></div>
        <button className="products-primary" type="button" onClick={() => { setError(""); setModal({ type: "add" }); }}><Plus size={17} /> Add category</button>
      </div>

      <div className="products-stats">
        <section className="nx-glass product-stat"><span className="product-stat-icon purple"><FolderTree size={19} /></span><div><span>Total categories</span><strong>{categories.length}</strong></div></section>
        <section className="nx-glass product-stat"><span className="product-stat-icon teal"><Package size={19} /></span><div><span>Products organized</span><strong>{products.length}</strong></div></section>
        <section className="nx-glass product-stat"><span className="product-stat-icon amber">!</span><div><span>Uncategorized products</span><strong>{products.filter((product) => !categories.some((category) => category.category_name === product.category)).length}</strong></div></section>
      </div>

      <section className="nx-glass products-panel">
        <div className="products-toolbar">
          <div><h2 className="nx-card-title">All categories <span className="product-count">{filtered.length}</span></h2><p className="nx-card-sub">Add categories to your catalog and keep products organized.</p></div>
          <div className="products-controls"><label className="products-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories..." aria-label="Search categories" /></label></div>
        </div>
        <div className="nx-table-wrap">
          <table className="nx-table products-table category-table">
            <thead><tr><th>Category</th><th>Products</th><th>Share of catalog</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{filtered.map((category) => {
              const count = productCount(category.category_name);
              const share = products.length ? Math.round((count / products.length) * 100) : 0;
              return <tr key={category.category_id}><td><span className="category-name"><span className="category-icon">
                <img src={category.category_image} alt={`${category.category_name} category`} onError={(event) => { event.currentTarget.hidden = true; }} />
                </span><span><strong>{category.category_name}</strong><small>Category ID {category.category_id}</small></span></span></td><td><span className="category-product-count">{count} {count === 1 ? "product" : "products"}</span></td><td><div className="category-share"><span><i style={{ width: `${share}%` }} /></span><small>{share}%</small></div></td><td><div className="product-actions"><button type="button" onClick={() => { setError(""); setModal({ type: "edit", category }); }} aria-label={`Edit ${category.category_name}`} title="Edit category"><Pencil size={15} /></button><button type="button" className="delete" onClick={() => deleteCategory(category)} aria-label={`Delete ${category.category_name}`} title="Delete category"><Trash2 size={15} /></button></div></td></tr>;
            })}</tbody>
          </table>
          {loading ? <div className="products-empty"><FolderTree size={25} /><strong>Loading categories…</strong></div> : filtered.length === 0 && <div className="products-empty"><FolderTree size={25} /><strong>{error || "No categories found"}</strong><span>Try another search or add a category.</span></div>}
        </div>
        <div className="products-foot">Showing <strong>{filtered.length}</strong> of <strong>{categories.length}</strong> categories <span className="category-foot-note">New categories are saved to the catalog.</span></div>
      </section>
    </main>
    <Footer />
    {modal && <CategoryModal category={modal.category} onClose={() => setModal(null)} onSave={saveCategory} saving={saving} error={error} />}
  </div>;
}
