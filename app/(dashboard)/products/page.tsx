'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { LoadingPage, EmptyState } from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import { useToast } from '@/components/Toast';
import { Search, Package, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  grade: string;
  availability: boolean;
  images: string[];
  createdAt?: { _seconds: number };
}

export default function ProductsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      if (gradeFilter) params.set('grade', gradeFilter);

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, categoryFilter, gradeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/products/${deleteTarget.id}`, { method: 'DELETE' });
      showToast('Product deleted successfully');
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  return (
    <>
      <Header
        title="Products"
        subtitle={`${products.length} items`}
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Products' }]}
      />

      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Products</h1>
            <p className="page-header-subtitle">Manage your inventory of scrap parts</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => router.push('/products/new')}>
              + Add Product
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="data-table-wrapper">
          {/* Toolbar */}
          <div className="table-toolbar">
            <form className="table-search" onSubmit={handleSearch}>
              <Search size={16} className="table-search-icon" />
              <input
                type="text"
                placeholder="Search products by name, SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="product-search"
              />
            </form>
            <div className="table-filters">
              <select
                className="form-select"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                style={{ minWidth: '140px', minHeight: '36px', fontSize: '13px' }}
                id="category-filter"
              >
                <option value="">All Categories</option>
                <option value="Engines">Engines</option>
                <option value="Tires">Tires</option>
                <option value="Lights">Lights</option>
                <option value="Interior">Interior</option>
                <option value="Transmission">Transmission</option>
                <option value="Gearbox">Gearbox</option>
              </select>
              <select
                className="form-select"
                value={gradeFilter}
                onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}
                style={{ minWidth: '120px', minHeight: '36px', fontSize: '13px' }}
                id="grade-filter"
              >
                <option value="">All Grades</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
          </div>

          {loading ? (
            <LoadingPage />
          ) : products.length === 0 ? (
            <EmptyState
              icon={<Package size={36} color="var(--text-tertiary)" />}
              title="No products found"
              text="Start by adding your first scrap part to the inventory."
              action={
                <button className="btn btn-primary" onClick={() => router.push('/products/new')}>
                  + Add Product
                </button>
              }
            />
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Grade</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/products/${product.id}`)}>
                      <td>
                        <div className="table-product-cell">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="table-product-img" />
                          ) : (
                            <div className="table-product-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={18} color="var(--text-tertiary)" />
                            </div>
                          )}
                          <div>
                            <div className="table-product-name">{product.name || 'Untitled'}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-mono" style={{ color: 'var(--text-secondary)' }}>{product.sku || '—'}</span></td>
                      <td><span className="badge badge-primary">{product.category || 'Uncategorized'}</span></td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(product.price || 0)}</td>
                      <td><StatusBadge status={product.grade || 'B'} type="grade" /></td>
                      <td>
                        <span className={`badge ${product.availability !== false ? 'badge-delivered' : 'badge-cancelled'}`}>
                          {product.availability !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => router.push(`/products/${product.id}`)}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteTarget(product)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="table-pagination">
                <span>Page {page} of {totalPages}</span>
                <div className="table-pagination-controls">
                  <button className="table-pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={14} /></button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`table-pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                  <button className="table-pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={14} /></button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Product"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete Product</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget?.name}</strong>?
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}
