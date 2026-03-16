import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Grid, Box, ShoppingCart, CreditCard, ClipboardList, BarChart2, QrCode, ArrowLeftRight, Home, LogOut } from 'lucide-react';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: Grid },
  { to: '/admin/products', label: 'Products', icon: Box },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/pos', label: 'POS System', icon: CreditCard },
  { to: '/admin/inventory', label: 'Inventory', icon: ClipboardList },
  { to: '/admin/reports', label: 'Reports', icon: BarChart2 },
  { to: '/admin/qr-scanner', label: 'QR Scanner', icon: QrCode },
];

const staffNavItems = [
  { to: '/admin', label: 'Dashboard', icon: Grid },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/pos', label: 'POS System', icon: CreditCard },
  { to: '/admin/inventory', label: 'Inventory', icon: ClipboardList },
  { to: '/admin/qr-scanner', label: 'QR Scanner', icon: QrCode },
];

export function AdminLayout() {
  const { user, logout, isStaff, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = isAdmin ? adminNavItems : staffNavItems;

  // Staff users should not access admin-only pages (e.g., product management or reports)
  if (!isAdmin && isStaff) {
    const forbiddenPaths = ['/admin/products', '/admin/reports'];
    if (forbiddenPaths.some((path) => location.pathname.startsWith(path))) {
      return <Navigate to="/admin" replace />;
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-6xl p-10">
          <Navigate to="/login" replace state={{ from: location }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen grid-cols-1 gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-0 h-screen border-r border-slate-200 bg-white">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 border-b border-slate-200 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-6 py-6">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="V &amp; G LecheFlan"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-base font-semibold text-white">
                      {isAdmin ? 'Admin Panel' : 'Staff Panel'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-200 px-6 py-5">
                <div className="text-sm font-semibold text-slate-900">{user?.name ?? 'Admin User'}</div>
                <div className="text-xs text-slate-500">{user?.role ?? 'admin'}</div>
              </div>

              <nav className="flex flex-col space-y-1 px-2 py-4">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `group flex w-full items-center gap-3 px-4 py-2 text-sm font-medium transition rounded-full ${
                        isActive
                          ? 'bg-amber-50 text-amber-700'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex w-full items-center gap-3 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <Home className="h-5 w-5" />
                Back to Store
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 rounded-full"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="min-h-screen bg-slate-100 w-full">
          {/* content fills available width and removes extra padding */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
