import React, { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { storage } from "../utils/storage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Plus, Edit3, Trash2, QrCode } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getLlamaChatCompletion } from "../utils/llama";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const panelLabel = isAdmin ? 'Admin' : 'Staff';
  const products = useMemo(() => storage.getProducts(), []);
  const orders = useMemo(() => storage.getOrders().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), []);
  const [revenue, setRevenue] = useState(() => storage.getRevenue());

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + (order.total ?? 0), 0),
    [orders],
  );
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.inventory <= 10).length;
  const activeProducts = products.filter((p) => p.status === "active").length;

  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const base = days.map((day) => ({ day, sales: 0, orders: 0 }));

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const index = date.getDay();
      base[index].sales += order.total ?? 0;
      base[index].orders += 1;
    });

    return base;
  }, [orders]);

  const refreshRevenue = () => setRevenue(storage.getRevenue());

  const handleResetDaily = () => {
    storage.resetDaily();
    refreshRevenue();
  };

  const handleResetWeekly = () => {
    storage.resetWeekly();
    refreshRevenue();
  };

  // staff management state
  const [staff, setStaff] = useState(() => storage.getUsers().filter(u => u.role === 'staff'));
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: '' });

  const refreshStaff = () => setStaff(storage.getUsers().filter(u => u.role === 'staff'));

  const handleSaveStaff = () => {
    if (!isAdmin) {
      alert("Only the Admin can create staff accounts.");
      return;
    }
    const { name, email, password } = staffForm;
    if (!name || !email || !password) return;
    const newStaff = {
      id: Date.now().toString(),
      name,
      email,
      role: 'staff',
      password,
    };
    storage.saveUser(newStaff);
    refreshStaff();
    setStaffDialogOpen(false);
    setStaffForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="space-y-8">
      {/* staff creation dialog */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>Enter the details for the new staff account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={staffForm.email}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={staffForm.password}
                onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveStaff}>Save</Button>
            <Button variant="outline" onClick={() => setStaffDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-6 py-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/90">Welcome to V &amp; G LecheFlan {panelLabel} Panel</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm font-semibold text-slate-500">Daily Revenue</h2>
          <p className="mt-4 text-3xl font-semibold">₱{revenue.daily.toFixed(2)}</p>
          <p className="mt-2 text-xs text-emerald-600">Today's earnings</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm font-semibold text-slate-500">Weekly Revenue</h2>
          <p className="mt-4 text-3xl font-semibold">₱{revenue.weekly.toFixed(2)}</p>
          <p className="mt-2 text-xs text-emerald-600">This week's earnings</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm font-semibold text-slate-500">Monthly Revenue</h2>
          <p className="mt-4 text-3xl font-semibold">₱{revenue.monthly.toFixed(2)}</p>
          <p className="mt-2 text-xs text-emerald-600">This month's earnings</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm font-semibold text-slate-500">Low Stock Alert</h2>
          <p className="mt-4 text-3xl font-semibold text-rose-600">{lowStock}</p>
          <p className="mt-2 text-xs text-slate-500">Items need restocking</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Weekly Sales</h2>
              <p className="mt-1 text-sm text-slate-500">Recent week overview</p>
            </div>
          </div>

          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="sales" fill="#F59E0B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold">Order Trends</h2>
              <p className="mt-1 text-sm text-slate-500">Track orders day-to-day</p>
            </div>
          </div>

          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        {orders.length === 0 ? (
          <div className="mt-6 text-sm text-slate-500">No orders yet</div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr>
                  <th className="py-2 pr-4 font-medium">Order ID</th>
                  <th className="py-2 pr-4 font-medium">Customer</th>
                  <th className="py-2 pr-4 font-medium">Total</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4 font-medium text-slate-800">{order.id}</td>
                    <td className="py-3 pr-4">{order.customerName || order.customerEmail || 'Unknown'}</td>
                    <td className="py-3 pr-4">
                      ₱{((order.total ?? order.items?.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0), 0)) ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 capitalize">
                      {(order.status || '').replace(/_/g, ' ') || 'Unknown'}
                    </td>
                    <td className="py-3">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && (
        <>
          {/* Staff management section */}
          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Staff Management</h2>
              <Button
                onClick={() => setStaffDialogOpen(true)}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Staff
              </Button>
            </div>
            {staff.length === 0 ? (
              <div className="mt-6 text-sm text-slate-500">No staff accounts</div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead>
                    <tr>
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((u) => (
                      <tr key={u.id} className="border-t border-slate-100">
                        <td className="py-3 pr-4 font-medium text-slate-800">{u.name}</td>
                        <td className="py-3 pr-4">{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Revenue Management section */}
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Revenue Management</h2>
          <div className="flex gap-2">
            <Button
              onClick={handleResetDaily}
              variant="outline"
              className="text-sm"
            >
              Reset Daily
            </Button>
            <Button
              onClick={handleResetWeekly}
              variant="outline"
              className="text-sm"
            >
              Reset Weekly
            </Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium text-slate-700">Daily Revenue</h3>
            <p className="mt-2 text-2xl font-bold text-green-600">₱{revenue.daily.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Resets daily at midnight</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium text-slate-700">Weekly Revenue</h3>
            <p className="mt-2 text-2xl font-bold text-blue-600">₱{revenue.weekly.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Resets every Sunday</p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium text-slate-700">Monthly Revenue</h3>
            <p className="mt-2 text-2xl font-bold text-purple-600">₱{revenue.monthly.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Accumulates monthly</p>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-500">
          Last reset: {new Date(revenue.lastReset).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

export function ProductManagement() {
  const [products, setProducts] = useState(() => storage.getProducts().filter((p) => p.type === 'product'));
  const [categories, setCategories] = useState(storage.getCategories());
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: categories[0]?.name ?? '',
    image: '',
    inventory: 0,
    status: 'active',
  });

  const refreshCategories = () => setCategories(storage.getCategories());

  const resolveCategoryId = (categoryName) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return '';

    const existing = storage.getCategories().find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing.id;

    const newCategory = {
      id: Date.now().toString(),
      name: trimmed,
      description: trimmed,
    };
    storage.saveCategory(newCategory);
    refreshCategories();
    return newCategory.id;
  };

  const refreshProducts = () => setProducts(storage.getProducts().filter((p) => p.type === 'product'));

  const openNewProduct = () => {
    setEditingProduct(null);
    setForm({
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      category: categories[0]?.name ?? '',
      image: '',
      inventory: 0,
      status: 'active',
    });
    setDialogOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingProduct(product);
    setForm({
      ...product,
      category: storage.getCategory(product.categoryId)?.name ?? '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleSave = () => {
    const categoryId = resolveCategoryId(form.category);

    storage.saveProduct({
      ...form,
      categoryId,
      price: Number(form.price),
      inventory: Number(form.inventory),
    });

    refreshProducts();
    closeDialog();
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this product?')) return;
    storage.deleteProduct(id);
    refreshProducts();
  };

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query),
    );
  }, [products, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your dessert products</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm focus:border-amber-300 focus:outline-none"
            />
          </div>
          <Button
            onClick={openNewProduct}
            className="flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
          >
            <Plus className="h-4 w-4" />
            Add Items
          </Button>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="h-44 w-full object-cover"
              />
              <div className="absolute left-4 top-4 flex gap-2">
                <Badge className="bg-white/90 text-slate-800" variant="outline">
                  {storage.getCategory(product.categoryId)?.name || 'Uncategorized'}
                </Badge>
                <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                  {product.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 p-5">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{product.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{product.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-amber-600">₱{product.price}</p>
                  <p className="text-xs text-slate-500">Stock: {product.inventory}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => openEditProduct(product)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs font-medium text-red-600 shadow-sm hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full rounded-2xl border bg-white p-8 text-center text-sm text-slate-500">
            No products found.
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the details of your product.'
                : 'Add a new product to the catalog.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Classic Leche Flan"
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Traditional Filipino leche flan with caramel sauce"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: Number(event.target.value) })
                  }
                  placeholder="250"
                />
              </div>
              <div className="grid gap-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={form.inventory}
                  onChange={(event) =>
                    setForm({ ...form, inventory: Number(event.target.value) })
                  }
                  placeholder="50"
                />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Input
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  placeholder="Leche Flan"
                />
              </div>

              <div className="grid gap-2">
                <Label>Status</Label>
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Image URL</Label>
              <Input
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={closeDialog}
              className="w-full sm:w-auto border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              className="w-full sm:w-auto rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
            >
              {editingProduct ? 'Save changes' : 'Add product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function OrderManagement() {
  const [orders, setOrders] = useState(() => storage.getOrders());
  const [updating, setUpdating] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const formatCurrency = (value) => `₱${Number(value ?? 0).toFixed(2)}`;

  const getOrderTotal = (order) =>
    Number(
      order?.total ??
        order?.items?.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0), 0) ??
        0,
    );

  const openOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setOrderDetailsOpen(true);
  };

  const closeOrderDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrderId(null);
  };

  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    to_ship: 'To Ship',
    out_for_delivery: 'Out for Delivery',
    received: 'Received',
    cancelled: 'Cancelled',
  };

  const statusFlow = ['pending', 'confirmed', 'to_ship', 'out_for_delivery', 'received'];

  const getNextStatus = (current) => {
    const index = statusFlow.indexOf(current);
    if (index === -1 || index === statusFlow.length - 1) return null;
    return statusFlow[index + 1];
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    setUpdating(orderId);
    storage.updateOrderStatus(orderId, nextStatus);
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)),
    );
    setUpdating(null);
  };

  const handleCancelOrder = async (orderId) => {
    setUpdating(orderId);
    storage.updateOrderStatus(orderId, 'cancelled');
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: 'cancelled' } : order)),
    );
    setUpdating(null);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="mt-2 text-slate-600">
          Update order status and track the progress of each order.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow">
          <p className="text-slate-600">No orders have been placed yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow">
          <table className="w-full text-left text-sm text-slate-600">
            <thead>
              <tr>
                <th className="py-3 pr-4 font-medium">Order</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const next = getNextStatus(order.status);
                const isFinal = order.status === 'received' || order.status === 'cancelled';
                return (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="py-4 pr-4 font-medium text-slate-900">
                      <button
                        type="button"
                        onClick={() => openOrderDetails(order.id)}
                        className="text-left font-medium text-amber-600 hover:text-amber-800"
                      >
                        {order.id}
                      </button>
                    </td>
                    <td className="py-4 pr-4">
                      {order.customerName || order.customerEmail || 'Unknown'}
                    </td>
                    <td className="py-4 pr-4">{formatCurrency(getOrderTotal(order))}</td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          size="sm"
                          onClick={() => openOrderDetails(order.id)}
                          className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
                        >
                          View
                        </Button>
                        {next && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, next)}
                            disabled={!!updating}
                            className="rounded-full bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
                          >
                            {updating === order.id ? 'Updating…' : `Move to ${statusLabels[next]}`}
                          </Button>
                        )}
                        {!isFinal && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={!!updating}
                            className="rounded-full border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={orderDetailsOpen} onOpenChange={(open) => (open ? setOrderDetailsOpen(true) : closeOrderDetails())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View and manage the selected order. Update its status, review items, or cancel the order.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Order ID</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Placed</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Customer</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedOrder.customerName || selectedOrder.customerEmail || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Total</p>
                  <p className="text-sm font-semibold text-amber-600">
                    {formatCurrency(getOrderTotal(selectedOrder))}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-700">Items</h3>
                <div className="mt-3 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between text-sm text-slate-700"
                    >
                      <div>
                        <div className="font-medium text-slate-900">{item.productName || 'Unknown item'}</div>
                        <div className="text-xs text-slate-500">
                          Qty: {item.quantity} × ₱{item.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-semibold text-slate-900">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Status</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getNextStatus(selectedOrder.status) && (
                    <Button
                      onClick={() => handleUpdateStatus(selectedOrder.id, getNextStatus(selectedOrder.status))}
                      disabled={!!updating}
                      className="rounded-full bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
                    >
                      {updating === selectedOrder.id
                        ? 'Updating…'
                        : `Move to ${statusLabels[getNextStatus(selectedOrder.status)]}`}
                    </Button>
                  )}
                  {selectedOrder.status !== 'received' && selectedOrder.status !== 'cancelled' && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      disabled={!!updating}
                      className="rounded-full border-red-200 bg-red-50 px-4 py-2 text-red-700 hover:bg-red-100"
                    >
                      Cancel order
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-500">
              Select an order to view details.
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={closeOrderDetails}
              className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function POSSystem() {
  const [products] = useState(() => storage.getProducts().filter((p) => p.type === 'product'));
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const addToCart = () => {
    if (!selectedProduct || quantity <= 0) return;
    const existing = cart.find(item => item.productId === selectedProduct.id);
    if (existing) {
      setCart(cart.map(item =>
        item.productId === selectedProduct.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        price: selectedProduct.price,
      }]);
    }
    setSelectedProduct(null);
    setQuantity(1);
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const placeOrder = () => {
    if (cart.length === 0) return;
    const newOrder = {
      id: Date.now().toString(),
      customerId: '',
      customerName: 'POS Customer',
      customerEmail: '',
      items: cart,
      total: getTotal(),
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      orderType: 'pos',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    storage.saveOrder(newOrder);
    // Update inventory
    cart.forEach(item => {
      const product = storage.getProduct(item.productId);
      if (product) {
        storage.updateInventory(item.productId, product.inventory - item.quantity);
      }
    });
    setCart([]);
    alert('Order placed successfully!');
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">Point of Sale (POS)</h1>
        <p className="mt-2 text-slate-600">
          Create orders directly for in-store purchases.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Add Product</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Select Product</label>
              <select
                value={selectedProduct?.id || ''}
                onChange={(e) => {
                  const product = products.find(p => p.id === e.target.value);
                  setSelectedProduct(product || null);
                }}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="">Choose a product...</option>
                {products.filter(p => p.status === 'active').map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₱{product.price} (Stock: {product.inventory})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <Button
              onClick={addToCart}
              disabled={!selectedProduct}
              className="w-full rounded-full bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
            >
              Add to Cart
            </Button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Current Order</h2>
          {cart.length === 0 ? (
            <p className="text-slate-500">No items in cart.</p>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-slate-500">Qty: {item.quantity} × ₱{item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">₱{(item.price * item.quantity).toFixed(2)}</p>
                    <Button
                      onClick={() => removeFromCart(item.productId)}
                      variant="outline"
                      className="rounded-full px-2 py-1 text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>₱{getTotal().toFixed(2)}</span>
                </div>
                <Button
                  onClick={placeOrder}
                  className="mt-4 w-full rounded-full bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InventoryManagement() {
  const [products, setProducts] = useState(storage.getProducts());
  const [editingInventory, setEditingInventory] = useState(null);
  const [newInventory, setNewInventory] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState(storage.getCategories());
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [productionProductId, setProductionProductId] = useState('');
  const [productionPrediction, setProductionPrediction] = useState('');
  const [predictingProduction, setPredictingProduction] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    quantity: 0,
    unit: 'pcs',
    itemNumber: '',
  });
  const [form, setForm] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    inventory: 0,
    status: 'active',
    type: 'product',
    unit: '',
    itemNumber: '',
  });

  const refreshProducts = () => setProducts(storage.getProducts());
  const refreshCategories = () => setCategories(storage.getCategories());

  const startEditInventory = (product) => {
    setEditingInventory(product.id);
    setNewInventory(product.inventory);
  };

  const saveInventory = (productId) => {
    storage.updateInventory(productId, newInventory);
    refreshProducts();
    setEditingInventory(null);
  };

  const cancelEdit = () => {
    setEditingInventory(null);
    setNewInventory(0);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setForm({
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      category: categories[0]?.name ?? '',
      image: '',
      inventory: 0,
      status: 'active',
      type: 'product',
      unit: '',
      itemNumber: '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const resolveCategoryId = (categoryName) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return '';
    const existing = storage.getCategories().find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) return existing.id;
    const newCategory = {
      id: Date.now().toString(),
      name: trimmed,
      description: trimmed,
    };
    storage.saveCategory(newCategory);
    refreshCategories();
    return newCategory.id;
  };

  const handleSave = () => {
    const categoryId = form.type === 'product' ? resolveCategoryId(form.category) : undefined;
    storage.saveProduct({
      ...form,
      categoryId,
      price: form.type === 'product' ? Number(form.price) : undefined,
      inventory: Number(form.inventory),
    });
    refreshProducts();
    closeDialog();
  };

  const handleAddInventoryItem = () => {
    const { name, quantity, unit, itemNumber } = inventoryForm;
    if (!name.trim()) return;

    storage.saveProduct({
      id: Date.now().toString(),
      name: name.trim(),
      description: name.trim(),
      inventory: Number(quantity),
      status: 'active',
      type: 'ingredient',
      unit: unit || 'pcs',
      itemNumber: itemNumber.trim(),
    });

    setInventoryForm({ name: '', quantity: 0, unit: 'pcs', itemNumber: '' });
    refreshProducts();
  };

  const predictProduction = async () => {
    const product = storage.getProduct(productionProductId);
    const ingredients = storage.getProducts().filter((p) => p.type === 'ingredient');
    if (!product) return;

    setPredictingProduction(true);
    setProductionPrediction('');

    const inventoryText = ingredients
      .map((i) => `- ${i.name}: ${i.inventory} ${i.unit || 'pcs'}`)
      .join('\n');

    const prompt = `You are an assistant that helps production managers estimate how many units of a product can be produced based on current ingredient stock.\n\nProduct: ${product.name}\n\nCurrent ingredient stock:\n${inventoryText}\n\nBased on a typical dessert recipe, roughly how many units of ${product.name} can be produced from the current ingredients? Provide a single number and a short reasoning.`;

    try {
      const response = await getLlamaChatCompletion(prompt);
      setProductionPrediction(response || 'No prediction returned.');
    } catch (err) {
      setProductionPrediction('Unable to get prediction; check API key or network.');
    }

    setPredictingProduction(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="mt-1 text-sm text-slate-600">Track and update inventory levels for your products</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Add to Inventory</h2>
          <p className="mt-1 text-sm text-slate-500">Add items like ingredients or products and track current stock.</p>

          <div className="mt-6 space-y-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={inventoryForm.name}
                onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })}
                placeholder="e.g. Sugar"
              />
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={inventoryForm.quantity}
                onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: Number(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Unit</Label>
              <select
                value={inventoryForm.unit}
                onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })}
                className="block w-full rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="cup">cup</option>
                <option value="liters">liters</option>
              </select>
            </div>

            <div>
              <Label>Item Number</Label>
              <Input
                value={inventoryForm.itemNumber}
                onChange={(e) => setInventoryForm({ ...inventoryForm, itemNumber: e.target.value })}
                placeholder="ING-001"
              />
            </div>

            <Button
              onClick={handleAddInventoryItem}
              className="w-full rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add to Inventory
            </Button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold">Current Inventory</h2>
          <p className="mt-1 text-sm text-slate-500">Adjust quantities and keep track of stock.</p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead>
                <tr>
                  <th className="py-3 pr-4 font-medium">Item no.</th>
                  <th className="py-3 pr-4 font-medium">Item Name</th>
                  <th className="py-3 pr-4 font-medium">Quantity</th>
                  <th className="py-3 pr-4 font-medium">Unit</th>
                  <th className="py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter((p) => p.type === 'ingredient')
                  .map((product) => (
                    <tr key={product.id} className="border-t border-slate-100">
                      <td className="py-4 pr-4 font-medium text-slate-900">{product.itemNumber || product.id}</td>
                      <td className="py-4 pr-4">{product.name}</td>
                      <td className="py-4 pr-4">
                        {editingInventory === product.id ? (
                          <input
                            type="number"
                            value={newInventory}
                            onChange={(e) => setNewInventory(Number(e.target.value))}
                            className="w-20 rounded border px-2 py-1"
                            min="0"
                          />
                        ) : (
                          product.inventory
                        )}
                      </td>
                      <td className="py-4 pr-4">{product.unit || 'pcs'}</td>
                      <td className="py-4">
                        {editingInventory === product.id ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => saveInventory(product.id)}
                              className="rounded-full bg-amber-500 px-3 py-1 text-xs text-white hover:bg-amber-600"
                            >
                              Save
                            </Button>
                            <Button
                              onClick={cancelEdit}
                              variant="outline"
                              className="rounded-full border-slate-200 px-3 py-1 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => startEditInventory(product)}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 hover:bg-slate-200"
                          >
                            Save
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Nutrition Calculator Section */}
      <div className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">AI Production Predictor</h2>
            <p className="mt-1 text-sm text-slate-500">
              Predict how many products can be made using current ingredient stock.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={productionProductId}
              onChange={(e) => setProductionProductId(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
            >
              <option value="">Select a product</option>
              {storage.getProducts()
                .filter((p) => p.type === 'product')
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
            <Button
              onClick={predictProduction}
              disabled={!productionProductId || predictingProduction}
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-600"
            >
              {predictingProduction ? 'Predicting…' : 'Predict Production'}
            </Button>
          </div>
        </div>

        {productionPrediction && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-800">Prediction</h3>
            <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
              {productionPrediction}
            </p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add {form.type === 'product' ? 'Product' : 'Ingredient'}</DialogTitle>
            <DialogDescription>
              Add a new {form.type} to the catalog.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
                className="block w-full rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="product">Product</option>
                <option value="ingredient">Ingredient</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder={form.type === 'product' ? "Classic Leche Flan" : "Sugar"}
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder={form.type === 'product' ? "Traditional Filipino leche flan with caramel sauce" : "White granulated sugar"}
              />
            </div>

            {form.type === 'product' && (
              <>
                <div className="grid gap-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    placeholder="250"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Category</Label>
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="block w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                    <option value="">New Category...</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label>Image URL</Label>
                  <Input
                    value={form.image}
                    onChange={(event) => setForm({ ...form, image: event.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {form.type === 'ingredient' && (
              <>
                <div className="grid gap-2">
                  <Label>Unit</Label>
                  <Input
                    value={form.unit}
                    onChange={(event) => setForm({ ...form, unit: event.target.value })}
                    placeholder="kg, liters, pieces"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Item Number</Label>
                  <Input
                    value={form.itemNumber}
                    onChange={(event) => setForm({ ...form, itemNumber: event.target.value })}
                    placeholder="ING-001"
                  />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label>Inventory</Label>
              <Input
                type="number"
                value={form.inventory}
                onChange={(event) => setForm({ ...form, inventory: event.target.value })}
                placeholder="50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={closeDialog}
              className="w-full sm:w-auto border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              className="w-full sm:w-auto rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-600"
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Nutrition Calculator Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Nutrition Calculator</DialogTitle>
            <DialogDescription>
              Select ingredients and calculate nutritional information using Llama AI.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Select Ingredients</Label>
              <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {products.filter(p => p.type === 'ingredient').map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`ingredient-${ingredient.id}`}
                      checked={selectedIngredients.some(si => si.id === ingredient.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIngredients([...selectedIngredients, { ...ingredient, quantity: 1 }]);
                        } else {
                          setSelectedIngredients(selectedIngredients.filter(si => si.id !== ingredient.id));
                        }
                      }}
                      className="rounded"
                    />
                    <label htmlFor={`ingredient-${ingredient.id}`} className="text-sm">
                      {ingredient.name} ({ingredient.inventory} {ingredient.unit})
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {selectedIngredients.length > 0 && (
              <div>
                <Label>Selected Ingredients & Quantities</Label>
                <div className="mt-2 space-y-2">
                  {selectedIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center space-x-2">
                      <span className="text-sm flex-1">{ingredient.name}</span>
                      <input
                        type="number"
                        value={ingredient.quantity}
                        onChange={(e) => {
                          const updated = selectedIngredients.map(si =>
                            si.id === ingredient.id
                              ? { ...si, quantity: Number(e.target.value) }
                              : si
                          );
                          setSelectedIngredients(updated);
                        }}
                        className="w-20 rounded border px-2 py-1 text-sm"
                        min="0.1"
                        step="0.1"
                      />
                      <span className="text-sm">{ingredient.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiResult && (
              <div className="rounded-lg bg-green-50 p-4">
                <h3 className="font-semibold text-green-800">AI Calculation Result</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>Product:</strong> {aiResult.productName}</p>
                  <p><strong>Estimated Calories:</strong> {aiResult.calories} kcal</p>
                  <p><strong>Ingredients:</strong> {aiResult.ingredients.join(', ')}</p>
                  <p><strong>Analysis:</strong> {aiResult.analysis}</p>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      // Save as new product
                      const newProduct = {
                        id: Date.now().toString(),
                        name: aiResult.productName,
                        description: `AI-generated recipe with ${aiResult.calories} calories. ${aiResult.analysis}`,
                        price: Math.round(aiResult.calories * 0.1), // Rough price calculation
                        categoryId: categories[0]?.id || '',
                        image: '',
                        inventory: 10, // Default inventory
                        status: 'active',
                        type: 'product',
                        purchaseCount: 0,
                      };
                      storage.saveProduct(newProduct);
                      refreshProducts();
                      alert('Recipe saved as new product!');
                      setAiDialogOpen(false);
                      setSelectedIngredients([]);
                      setAiResult(null);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Save as Recipe
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setAiDialogOpen(false);
                setSelectedIngredients([]);
                setAiResult(null);
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (selectedIngredients.length === 0) return;
                
                setCalculating(true);
                // Mock AI calculation - in real implementation, this would call Llama AI API
                setTimeout(() => {
                  const totalCalories = selectedIngredients.reduce((sum, ing) => {
                    // Mock calorie calculation based on ingredient type
                    const baseCalories = {
                      'sugar': 387,
                      'milk': 61,
                      'flour': 364,
                      'eggs': 155,
                      'cheese': 402,
                      'beef': 250,
                      'butter': 717,
                      'cream': 340
                    };
                    const caloriesPerUnit = baseCalories[ing.name.toLowerCase()] || 100;
                    return sum + (caloriesPerUnit * ing.quantity);
                  }, 0);

                  setAiResult({
                    productName: `Custom Recipe (${selectedIngredients.length} ingredients)`,
                    calories: Math.round(totalCalories),
                    ingredients: selectedIngredients.map(si => `${si.quantity} ${si.unit} ${si.name}`),
                    analysis: `Based on the selected ingredients, this recipe contains approximately ${Math.round(totalCalories)} calories. The calculation considers the nutritional density of each ingredient.`
                  });
                  setCalculating(false);
                }, 2000);
              }}
              disabled={selectedIngredients.length === 0 || calculating}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {calculating ? 'Calculating...' : 'Calculate with AI'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Reports() {
  const orders = useMemo(() => storage.getOrders(), []);
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total ?? 0), 0),
    [orders],
  );
  const totalOrders = orders.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const [period, setPeriod] = useState('Weekly');

  const weeklyData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const base = days.map((day) => ({ day, sales: 0 }));
    orders.forEach((order) => {
      const d = new Date(order.createdAt);
      base[d.getDay() === 0 ? 6 : d.getDay() - 1].sales += order.total ?? 0;
    });
    return base;
  }, [orders]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Reports</h1>
          <p className="mt-1 text-sm text-slate-600">View business performance metrics</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-sm rounded-md border border-slate-300 bg-white px-2 py-1"
        >
          <option>Weekly</option>
          <option>Monthly</option>
          <option>Yearly</option>
        </select>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow flex flex-col">
          <span className="text-xs font-semibold text-slate-500">Total Revenue</span>
          <span className="mt-2 text-2xl font-bold text-green-600">
            ₱{totalRevenue.toFixed(2)}
          </span>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow flex flex-col">
          <span className="text-xs font-semibold text-slate-500">Total Orders</span>
          <span className="mt-2 text-2xl font-bold text-blue-600">
            {totalOrders}
          </span>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow flex flex-col">
          <span className="text-xs font-semibold text-slate-500">Avg Order Value</span>
          <span className="mt-2 text-2xl font-bold text-purple-600">
            ₱{avgOrder.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="sales" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function QRScanner() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">QR Code Scanner</h1>
        <p className="mt-1 text-sm text-slate-600">
          Scan order QR codes for quick processing
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {/* scanner panel */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="font-semibold">Scan QR Code</h2>
          <div className="mt-4 h-40 w-full rounded-lg bg-slate-100 flex items-center justify-center">
            <QrCode className="h-16 w-16 text-slate-400" />
          </div>
          <div className="mt-4 flex">
            <input
              type="text"
              placeholder="ORD-123456 or QR-123456"
              className="flex-1 rounded-full bg-slate-100 px-4 py-2"
            />
            <button className="ml-2 rounded-full bg-yellow-400 px-6 py-2 font-semibold">
              Scan
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            * In production, this would use device camera to scan QR codes
          </p>
        </div>

        {/* order details panel */}
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="font-semibold">Order Details</h2>
          <div className="mt-4 flex flex-col items-center justify-center h-40 rounded-lg bg-slate-100">
            <QrCode className="h-16 w-16 text-slate-400" />
            <p className="mt-2 text-slate-500">
              Scan a QR code to view order details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
