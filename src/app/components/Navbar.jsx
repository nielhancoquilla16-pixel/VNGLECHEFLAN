import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { ShoppingCart, Grid, User, LogOut, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated, isStaff, isAdmin } = useAuth();
  const panelLabel = isAdmin ? 'Admin Panel' : 'Staff Panel';
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Close mobile menu on navigation changes
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isAdminRoute = location.pathname.startsWith('/admin');

  // don't render the site navbar while inside the admin panel
  if (isAdminRoute) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {isAdminRoute ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm"
            >
              Admin Dashboard
            </Link>
          ) : (
            // plain div instead of Link so logo is not clickable
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="V &amp; G LecheFlan"
                className="h-14 w-14 rounded-full border border-white/50 bg-white/70 object-cover shadow"
              />
            </div>
          )}
        </div>

        <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
          <Link
            to="/"
            className={`text-sm font-medium ${isActive('/') ? 'text-[#131414] underline underline-offset-4' : 'text-slate-800 hover:text-[#131414]'}`}
          >
            Home
          </Link>
          <Link
            to="/shop"
            className={`text-sm font-medium ${isActive('/shop') ? 'text-[#131414] underline underline-offset-4' : 'text-slate-800 hover:text-[#131414]'}`}
          >
            Products
          </Link>

          <Link
            to="/cart"
            className={`relative inline-flex items-center justify-center rounded-full border border-white/40 bg-white/60 p-3 text-slate-800 shadow-sm transition hover:bg-white ${
              isActive('/cart') ? 'ring-2 ring-amber-500' : ''
            }`}
            aria-label="View cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                {getCartCount()}
              </span>
            )}
          </Link>

          <Link
            to="/order-tracking"
            className={`text-sm font-medium ${isActive('/order-tracking') ? 'text-[#131414] underline underline-offset-4' : 'text-slate-800 hover:text-[#131414]'}`}
          >
            Orders
          </Link>

          <Link
            to="/contact"
            className={`text-sm font-medium ${isActive('/contact') ? 'text-[#131414] underline underline-offset-4' : 'text-slate-800 hover:text-[#131414]'}`}
          >
            Contact
          </Link>
          <Link
            to="/about"
            className={`text-sm font-medium ${isActive('/about') ? 'text-[#131414] underline underline-offset-4' : 'text-slate-800 hover:text-[#131414]'}`}
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-800 shadow hover:bg-white md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            isStaff ? (
              // show admin panel toggle or user info for staff/admin
              isAdminRoute ? (
                <div className="hidden items-center gap-2 rounded-full bg-white/80 px-3 py-2 shadow-sm md:flex">
                  <User className="h-4 w-4 text-slate-800" />
                  <span className="text-sm font-medium text-slate-800">{user?.email ?? 'Admin User'}</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600"
                    aria-label="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate('/admin')}
                  className="hidden rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#131414] shadow hover:bg-white inline-flex md:flex"
                >
                  {panelLabel}
                </Button>
              )
            ) : (
              // authenticated customer
              <div className="hidden items-center gap-2 md:flex">
                <span className="text-sm font-medium text-white">Hi, {user?.name}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#131414] shadow hover:bg-white inline-flex md:flex"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden">
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-lg font-semibold text-slate-900">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 px-4 pb-6">
              <Link
                to="/"
                className={`rounded-xl px-4 py-3 text-sm font-medium ${isActive('/') ? 'bg-amber-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className={`rounded-xl px-4 py-3 text-sm font-medium ${isActive('/shop') ? 'bg-amber-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Products
              </Link>
              <Link
                to="/cart"
                className={`rounded-xl px-4 py-3 text-sm font-medium ${isActive('/cart') ? 'bg-amber-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Cart
              </Link>
              <Link
                to="/order-tracking"
                className={`rounded-xl px-4 py-3 text-sm font-medium ${isActive('/order-tracking') ? 'bg-amber-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Orders
              </Link>
              {isStaff && (
                <Link
                  to="/admin"
                  className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  {panelLabel}
                </Link>
              )}
              <Link
                to="/contact"
                className={`rounded-xl px-4 py-3 text-sm font-medium ${isActive('/contact') ? 'bg-amber-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Contact
              </Link>
              <Link
                to="/about"
                className={`rounded-xl px-4 py-3 text-sm font-medium ${isActive('/about') ? 'bg-amber-100 text-slate-900' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                About
              </Link>

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 rounded-xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="mt-4 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
