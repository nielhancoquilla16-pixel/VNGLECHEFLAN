import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import {
  Root,
  Home,
  Shop,
  Cart,
  Checkout,
  OrderTracking,
  Login,
  Contact,
  About,
  AdminDashboard,
  ProductManagement,
  OrderManagement,
  POSSystem,
  InventoryManagement,
  Reports,
  QRScanner,
  NotFound,
} from "./pages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },
      { path: "shop", element: <Shop /> },
      { path: "cart", element: <Cart /> },
      { path: "checkout", element: <Checkout /> },
      { path: "order-tracking", element: <OrderTracking /> },
      { path: "login", element: <Login /> },
      { path: "contact", element: <Contact /> },
      { path: "about", element: <About /> },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "products", element: <ProductManagement /> },
          { path: "orders", element: <OrderManagement /> },
          { path: "pos", element: <POSSystem /> },
          { path: "inventory", element: <InventoryManagement /> },
          { path: "reports", element: <Reports /> },
          { path: "qr-scanner", element: <QRScanner /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);