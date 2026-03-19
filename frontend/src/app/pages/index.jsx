import React, { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { OfflineIndicator } from "../components/OfflineIndicator";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { storage } from "../utils/storage";
import { getLlamaChatCompletion } from "../utils/llama";

export function Root() {
  const location = useLocation();
  // pages that should avoid the centered container (full-screen layout)
  const fullWidthPaths = ["/", "/shop", "/contact", "/about", "/admin"];
  const isFullWidth = fullWidthPaths.some((p) =>
    location.pathname === p || location.pathname.startsWith(`${p}/`)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <OfflineIndicator />
      <Navbar />

      {/* outer wrapper no max width; inner div constrains pages that need it */}
      <main className="w-full flex-1">
        {isFullWidth ? (
          <Outlet />
        ) : (
          <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <Outlet />
          </div>
        )}
      </main>

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="V &amp; G logo" className="h-6 w-auto" />
        © {new Date().getFullYear()} V &amp; G Leche Flan
      </footer>
    </div>
  );
}

// Home page helpers

const SHOP_LAT = 14.455377;
const SHOP_LON = 120.974627;
const MAP_DELTA = 0.0004;

function buildOsmUrls() {
  const osmUrl = `https://www.openstreetmap.org/?mlat=${SHOP_LAT}&mlon=${SHOP_LON}#map=17/${SHOP_LAT}/${SHOP_LON}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?mlat=${SHOP_LAT}&mlon=${SHOP_LON}&zoom=17&layer=mapnik&marker=${SHOP_LAT}%2C${SHOP_LON}`;
  return { osmUrl, osmEmbedUrl };
}

function HeroSection({ heroImage, onOrder, onLearn }) {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-amber-200 via-yellow-100 to-rose-200 shadow-[inset_0_3px_20px_rgba(0,0,0,0.05)]">
      <div className="grid gap-10 px-8 py-20 md:grid-cols-2 md:px-16 mx-auto max-w-7xl">
        <div className="flex flex-col justify-center gap-6 z-10">
          <div className="inline-flex self-start items-center gap-2 rounded-full bg-amber-50/90 px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm border border-amber-100/50">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#E21A1A]" />
            Fresh desserts, delivered daily
          </div>

          <h1 className="text-[3.5rem] leading-[1.1] font-extrabold tracking-tight text-slate-900 sm:text-7xl mt-2">
            Welcome to <span className="text-[#E21A1A]">V &amp; G</span>
          </h1>
          <p className="max-w-xl text-lg text-slate-700/90 leading-relaxed font-medium pr-10">
            Leche Flan - Pambansang Dessert. Experience the authentic taste of premium leche flan,
            crafted with love and tradition. Our secret family recipe delivers a creamy, rich dessert
            that melts in your mouth.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row mt-4">
            <Button
              onClick={onOrder}
              className="min-w-[140px] px-8 py-6 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-bold tracking-wide shadow-lg hover:shadow-amber-500/30 transition-all text-sm"
            >
              Order Now
            </Button>
            <Button
              onClick={onLearn}
              className="min-w-[140px] px-8 py-6 rounded-full bg-white text-slate-900 hover:bg-slate-50 font-bold tracking-wide shadow-md transition-all text-sm border border-white/40"
            >
              Learn More About Us
            </Button>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-end">
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-rose-50/90 shadow-2xl ring-1 ring-white/40">
            <img src={heroImage} alt="Leche Flan" className="h-[320px] w-full object-cover scale-[1.02]" />
            <div className="p-8 pb-10">
              <h2 className="text-2xl font-bold text-slate-900">Delicious Leche Flan</h2>
              <p className="mt-3 text-sm text-slate-600/90 leading-relaxed font-medium">
                Sweet, creamy, and caramelized to perfection—made fresh daily.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-amber-200/80 px-4 py-1.5 text-xs font-bold text-amber-900">
                  Best Seller
                </span>
                <span className="rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold text-slate-700 border border-slate-200/50 shadow-sm">
                  Fresh Daily
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeBestSellers({ onShop }) {
  const bestSellers = storage.getBestSellers(5);

  return (
    <div className="mx-auto mt-12 max-w-6xl px-4 md:px-12">
      <div className="relative -mt-12 rounded-3xl bg-white/90 p-8 shadow-xl backdrop-blur">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">Best Sellers</h2>
          <p className="mt-2 text-sm text-slate-600">Our most popular items, loved by customers</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bestSellers.map((product, index) => (
            <Card
              key={product.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-3 left-3 z-10">
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                  #{index + 1} Best Seller
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <div className="space-y-3">
                  <div className="aspect-square overflow-hidden rounded-lg bg-slate-100 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-square overflow-hidden rounded-md bg-slate-100">
                      <img
                        src={product.image.replace("w=400", "w=200")}
                        alt={`${product.name} view 1`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="aspect-square overflow-hidden rounded-md bg-slate-100">
                      <img
                        src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200"
                        alt={`${product.name} view 2`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="aspect-square overflow-hidden rounded-md bg-slate-100">
                      <img
                        src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=200"
                        alt={`${product.name} view 3`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900 mb-2">{product.name}</CardTitle>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-amber-600">₱{product.price.toFixed(2)}</span>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {product.purchaseCount || 0} sold
                  </Badge>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button onClick={onShop} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  View in Shop
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {bestSellers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No best sellers yet. Start shopping to see popular items!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VisitShopSection() {
  const { osmUrl, osmEmbedUrl } = useMemo(() => buildOsmUrls(), []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-12">
      <div className="rounded-3xl bg-white/70 shadow-lg border border-white/40 px-6 py-10">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Visit Our Shop</h2>
          <p className="mt-2 text-sm text-slate-600">Find us on the map and get directions to our storefront.</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_1.9fr] items-stretch">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-slate-50/80 p-4 text-center max-w-[340px] mx-auto">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-500 text-white text-xl">
              📍
            </span>
            <p className="text-sm font-semibold text-slate-900">Map Location</p>
            <p className="text-xs text-slate-500">OpenStreetView</p>
            <a
              href={osmUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-600"
            >
              Open in OpenStreetView
            </a>
          </div>

          <div className="flex h-full min-h-[420px] flex-col rounded-2xl overflow-hidden border border-white/50 bg-white/60 shadow-sm">
            <div className="relative flex-1">
              <iframe
                title="Shop location map"
                src={osmEmbedUrl}
                className="absolute inset-0 h-full w-full"
                style={{ border: 0 }}
                allowFullScreen
              />
            </div>
            <div className="p-3 text-xs text-slate-600">
              <a href={osmUrl} target="_blank" rel="noreferrer" className="font-medium text-slate-900 hover:underline">
                View on OpenStreetMap
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VideoSection({ onOrder }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900">Experience V &amp; G Leche Flan</h2>
        <p className="mt-2 text-sm text-slate-600">
          Watch our story and see why our desserts are loved by families across the Philippines
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
            <video
              className="w-full h-auto"
              controls
              poster="https://eu-central.storage.cloudconvert.com/tasks/71509c68-dee2-4487-ab0f-7216ad798d16/adpic.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=cloudconvert-production%2F20260318%2Ffra%2Fs3%2Faws4_request&X-Amz-Date=20260318T155138Z&X-Amz-Expires=86400&X-Amz-Signature=21d5fc1a65a450928e8fe136c3669d90b5e599f182a8a72212835d4bec0fdfd7&X-Amz-SignedHeaders=host&response-content-disposition=inline%3B%20filename%3D%22adpic.webp%22&response-content-type=image%2Fwebp&x-id=GetObject"
              preload="metadata"
            >
              <source src={`${import.meta.env.BASE_URL}videos/promo.mp4`} type="video/mp4" />
            </video>
          </div>
          <div className="text-center max-w-xl">
            <h3 className="text-lg font-semibold text-slate-900">Advertise Video</h3>
            <p className="text-sm text-slate-600 mt-1">
              You want to know more about our leche flan? Watch this video to see how we make our delicious desserts and why customers love us!
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-100 shadow-lg">
            <video
              className="w-full h-auto"
              controls
              poster="https://eu-central.storage.cloudconvert.com/tasks/f053fd6e-d3c4-4832-8849-477ee4509c17/Screenshot%202026-03-18%20235244.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=cloudconvert-production%2F20260318%2Ffra%2Fs3%2Faws4_request&X-Amz-Date=20260318T155313Z&X-Amz-Expires=86400&X-Amz-Signature=9fc8fba8214369504bd5c4a0f7f1499875b7fbb0400a0a6ffee7fc4f47a36690&X-Amz-SignedHeaders=host&response-content-disposition=inline%3B%20filename%3D%22Screenshot%202026-03-18%20235244.webp%22&response-content-type=image%2Fwebp&x-id=GetObject"
              preload="metadata"
            >
              <source src={`${import.meta.env.BASE_URL}videos/advertise.mp4`} type="video/mp4" />
            </video>
          </div>
          <div className="text-center max-w-xl">
            <h3 className="text-lg font-semibold text-slate-900">Advertise Video</h3>
            <p className="text-sm text-slate-600 mt-1">
              Watch this video to see how we make our delicious desserts and why customers love us! 
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Home() {
  const navigate = useNavigate();
  const products = storage.getProducts();
  const heroImage = products.length ? products[0].image : '';

  return (
    <section className="space-y-10 w-full">
      <HeroSection heroImage={heroImage} onOrder={() => navigate('/shop')} onLearn={() => navigate('/about')} />
      <HomeBestSellers onShop={() => navigate('/shop')} />
      <VisitShopSection />
      <VideoSection onOrder={() => navigate('/shop')} />
    </section>
  );
}

export function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCalories, setShowCalories] = useState(false);
  const [calorieEstimate, setCalorieEstimate] = useState(null);

  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const categories = useMemo(() => {
    return [{ id: "all", name: "All Categories" }, ...storage.getCategories()];
  }, []);

  useEffect(() => {
    setProducts(storage.getProducts().filter((p) => p.type === 'product'));
  }, []);

  const estimateCalories = (product) => {
    if (!product) return null;
    const base = {
      'classic leche flan': 350,
      'ube leche flan': 380,
      'chocolate cake': 450,
      'mango float': 320,
      'cheese cupcakes': 400,
      'buko pandan': 330,
    };
    const nameKey = product.name.toLowerCase();
    const baseCalories = base[nameKey] || 250;
    return Math.round(baseCalories);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory = category === "all" || product.categoryId === category;
        const query = search.trim().toLowerCase();
        const matchesSearch =
          query === "" ||
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, search, category]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setProducts(storage.getProducts());
    setSelectedProduct(product);
    setShowCalories(false);
    setCalorieEstimate(null);
  };

  const openAiDialog = (product) => {
    setSelectedProduct(product);
    setAiDialogOpen(true);
    setAiQuestion(`Tell me about ${product.name}, its ingredients, taste, and any nutritional info.`);
    setAiAnswer('');
  };

  const askAi = async () => {
    if (!selectedProduct) return;
    setAiLoading(true);

    try {
      const prompt = `You are an assistant for a Filipino dessert shop. A customer asked: "${aiQuestion}". Respond in a friendly, informative way, mentioning the product name "${selectedProduct.name}" and its key qualities.`;
      const response = await getLlamaChatCompletion(prompt);
      setAiAnswer(response);
    } catch (err) {
      setAiAnswer(
        `Sorry, I couldn't reach the AI right now. Here is a quick estimate instead: ${estimateCalories(
          selectedProduct,
        )} kcal`
      );
    } finally {
      setAiLoading(false);
    }
  };

  const recommendedProduct = useMemo(() => {
    if (filteredProducts.length === 0) return null;
    return filteredProducts[0];
  }, [filteredProducts]);

  return (
    <section className="space-y-8">
      <header className="rounded-3xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-6 py-10 shadow-lg">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Our Products
          </h1>
          <p className="mt-2 max-w-2xl text-base text-slate-700">
            Browse our delicious selection of Filipino desserts.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-700">
                Search Products
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span className="text-slate-400">🔍</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-700">
                Filter by Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="flex flex-col group transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                onMouseEnter={() => {
                  setSelectedProduct(product);
                  setShowCalories(false);
                }}
              >
                <div className="relative overflow-hidden rounded-t-xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800">
                    {storage.getCategory(product.categoryId)?.name ?? "Unknown"}
                  </span>
                </div>

                <CardContent className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {product.description}
                  </CardDescription>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-slate-900">₱{product.price}</div>
                      <div className="text-xs text-slate-500">
                        Stock: {product.inventory}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openAiDialog(product)}
                        variant="outline"
                        className="rounded-full px-3 py-1 text-xs"
                      >
                        Ask AI
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span>+</span>
                          Add to Cart
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full rounded-2xl bg-white p-10 text-center shadow">
                <h2 className="text-xl font-semibold text-slate-900">No products found</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Try a different search term or category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ask AI about {selectedProduct?.name ?? 'a product'}</DialogTitle>
            <DialogDescription>
              Type a question and the AI will answer based on the product and its ingredients.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <textarea
              rows={4}
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-amber-300"
            />

            {aiAnswer && (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                {aiAnswer}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={askAi} disabled={aiLoading || !aiQuestion.trim()}>
              {aiLoading ? 'Thinking…' : 'Ask'}
            </Button>
            <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function Cart() {
  const { cart, getCartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState([]);

  const cartItems = useMemo(() => {
    return cart
      .map((item) => {
        const product = storage.getProduct(item.productId);
        if (!product) return null;
        return { ...item, product };
      })
      .filter(Boolean);
  }, [cart]);

  useEffect(() => {
    // Keep selected items in sync when cart changes
    const currentIds = cart.map((item) => item.productId);
    setSelectedItems((prev) => {
      const next = Array.from(new Set([...prev, ...currentIds]));
      return next.filter((id) => currentIds.includes(id));
    });
  }, [cart]);

  const toggleSelect = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const allSelected = selectedItems.length > 0 && selectedItems.length === cartItems.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.productId));
    }
  };

  const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.productId));
  const selectedSubtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 50;
  const total = selectedSubtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">
          Add items from the shop to see them here.
        </p>
        <div className="mt-6">
          <Button onClick={() => navigate('/shop')}>Browse products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="rounded-3xl bg-amber-200 px-6 py-8 shadow">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <p className="mt-1 text-sm text-slate-700">Review your items and proceed to checkout.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-slate-300"
              />
              Select all
            </label>
            <span className="text-sm text-slate-600">
              {selectedCartItems.length} of {cartItems.length} selected
            </span>
          </div>

          {cartItems.map(({ productId, quantity, price, product }) => (
            <div
              key={productId}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(productId)}
                  onChange={() => toggleSelect(productId)}
                  className="mt-2 h-5 w-5 rounded border-slate-300"
                />
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-24 w-24 rounded-xl object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-xs text-slate-500">₱{price.toFixed(2)} each</p>
                  </div>
                  <div className="text-right text-sm font-semibold text-slate-900">
                    ₱{(price * quantity).toFixed(2)}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2">
                    <Button
                      onClick={() => updateQuantity(productId, Math.max(1, quantity - 1))}
                      className="h-8 w-8 rounded-full bg-white text-lg font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                    >
                      -
                    </Button>
                    <span className="w-10 text-center font-semibold">{quantity}</span>
                    <Button
                      onClick={() => updateQuantity(productId, quantity + 1)}
                      className="h-8 w-8 rounded-full bg-white text-lg font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                    >
                      +
                    </Button>
                  </div>

                  <Button
                    onClick={() => removeFromCart(productId)}
                    className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <span className="text-lg">🗑</span>
                    Remove
                  </Button>
                </div>

                <p className="text-xs text-slate-500">Stock: {product.inventory}</p>
              </div>
            </div>
          ))}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>₱{selectedSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Delivery Fee</span>
              <span>₱{deliveryFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold text-amber-600">₱{total.toFixed(2)}</span>
          </div>

          {!selectedItems.length && (
            <p className="mt-3 text-sm text-slate-500">
              Select the items you want to checkout above.
            </p>
          )}

          <Button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login', { state: { from: '/checkout' } });
                return;
              }
              navigate('/checkout', { state: { selectedIds: selectedItems } });
            }}
            disabled={!selectedItems.length || !isAuthenticated}
            className="mt-6 w-full rounded-full bg-amber-500 px-4 py-3 text-sm font-bold text-slate-900 shadow hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
          </Button>

          <Button
            onClick={() => navigate('/shop')}
            className="mt-3 w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow hover:bg-slate-100"
          >
            Continue Shopping
          </Button>

          <Button
            onClick={clearCart}
            className="mt-3 w-full rounded-full bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Clear Cart
          </Button>
        </aside>
      </div>
    </div>
  );
}

export function Checkout() {
  const { getCartTotal, clearCart, cart, removeFromCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  const selectedIds = location.state?.selectedIds ?? cart.map((item) => item.productId);
  const selectedItems = cart.filter((item) => selectedIds.includes(item.productId));
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState(null);
  const [showGCashModal, setShowGCashModal] = useState(false);

  const [orderType, setOrderType] = useState('online');
  const [paymentMethod, setPaymentMethod] = useState(orderType === 'online' ? 'gcash' : 'cash');
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    // keep payment method aligned with order type
    if (orderType === 'online') {
      setPaymentMethod('gcash');
    } else if (paymentMethod === 'gcash') {
      // switching to counter resets to cash by default
      setPaymentMethod('cash');
    }
  }, [orderType]);

  const handlePlaceOrder = () => {
    // ensure payment method stays in-sync with order type
    if (orderType === 'online' && paymentMethod !== 'gcash') {
      setPaymentMethod('gcash');
    }

    const items = selectedItems.map((item) => {
      const product = storage.getProduct(item.productId);
      return {
        productId: item.productId,
        productName: product?.name || '',
        quantity: item.quantity,
        price: item.price,
      };
    });

    const newOrder = {
      id: Date.now().toString(),
      customerId: user?.id || '',
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      items,
      total: selectedTotal,
      status: 'confirmed',
      paymentStatus: paymentMethod === 'online' ? 'pending' : 'pending',
      paymentMethod,
      orderType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      review: undefined,
      qrCode: orderType === 'pos' ? qrUrl : undefined,
    };

    storage.saveOrder(newOrder);
    // Deduct inventory
    selectedItems.forEach((item) => {
      const product = storage.getProduct(item.productId);
      if (product) {
        storage.updateInventory(item.productId, product.inventory - item.quantity);
      }
    });

    // Remove purchased items from cart
    selectedItems.forEach((item) => removeFromCart(item.productId));

    setOrder(newOrder);
    setSubmitted(true);
  };

  const generateQr = () => {
    const payload = JSON.stringify(
      cart.map((i) => ({ id: i.productId, qty: i.quantity }))
    );
    const url =
      'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' +
      encodeURIComponent(payload);
    setQrUrl(url);
  };

  const handleGCashPayment = () => {
    // Show GCash payment modal
    setShowGCashModal(true);
  };

  const completeGCashPayment = () => {
    // Simulate GCash payment success
    const updatedOrder = { ...order, paymentStatus: 'paid', updatedAt: new Date().toISOString() };
    storage.saveOrder(updatedOrder);
    setOrder(updatedOrder);
    setShowGCashModal(false);
  };

  if (submitted || cart.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">Order Complete</h1>
        <p className="mt-2 text-slate-600">Thank you! Your order has been placed.</p>
        {order?.qrCode && (
          <div className="mt-4">
            <p className="font-medium">QR code for POS:</p>
            <img src={order.qrCode} alt="order qr" className="mt-2" />
          </div>
        )}
        {order?.paymentMethod === 'gcash' && order?.paymentStatus === 'pending' && (
          <div className="mt-4">
            <Button onClick={handleGCashPayment} className="bg-green-500 hover:bg-green-600 text-white">
              Pay with GCash
            </Button>
          </div>
        )}
        {order?.paymentStatus === 'paid' && (
          <p className="mt-4 text-green-600 font-semibold">Payment completed successfully!</p>
        )}
        <div className="mt-6">
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="mt-2 text-slate-600">Review your order and place it below.</p>

      <div className="mt-6">
        <p className="text-lg font-semibold">Order total: ₱{selectedTotal}</p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="online"
              checked={orderType === 'online'}
              onChange={() => setOrderType('online')}
              className="mr-2"
            />
            Online
          </label>
          <label className="inline-flex items-center ml-4">
            <input
              type="radio"
              value="pos"
              checked={orderType === 'pos'}
              onChange={() => setOrderType('pos')}
              className="mr-2"
            />
            At counter
          </label>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Payment Method</label>
          {orderType === 'online' ? (
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="gcash"
                  checked={paymentMethod === 'gcash'}
                  onChange={() => setPaymentMethod('gcash')}
                  className="mr-2"
                />
                GCash
              </label>
            </div>
          ) : (
            <div className="space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="mr-2"
                />
                Cash
              </label>
              <label className="inline-flex items-center ml-4">
                <input
                  type="radio"
                  value="gcash"
                  checked={paymentMethod === 'gcash'}
                  onChange={() => setPaymentMethod('gcash')}
                  className="mr-2"
                />
                GCash
              </label>
            </div>
          )}
        </div>

        {orderType === 'online' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, name: e.target.value })
                }
                className="mt-1 w-full rounded-md border px-3 py-2"
                type="text"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
                className="mt-1 w-full rounded-md border px-3 py-2"
                type="tel"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Address
              </label>
              <input
                value={customerInfo.address}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, address: e.target.value })
                }
                className="mt-1 w-full rounded-md border px-3 py-2"
                type="text"
              />
            </div>
          </div>
        )}

        {orderType === 'pos' && (
          <div className="space-y-4">
            <Button onClick={generateQr}>Generate QR</Button>
            {qrUrl && <img src={qrUrl} alt="cart qr" />}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row">
        <Button onClick={handlePlaceOrder}>Place order</Button>
        <Link to="/cart">
          <Button className="bg-gray-100 text-slate-700 hover:bg-gray-200">
            Back to Cart
          </Button>
        </Link>
      </div>
      {showGCashModal && <GCashModal />}
    </div>
  );
}

function OrderTimeline({ status, review }) {
  const steps = [
    { key: 'confirmed', label: 'Confirmed Order' },
    { key: 'to_ship', label: 'To Ship' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'received', label: 'Received' },
    { key: 'review', label: 'Review' },
  ];

  const currentIndex = steps.findIndex((step) => step.key === status);
  const showReviewStep = status === 'received' && !review;
  const activeIndex = review
    ? steps.length - 1
    : currentIndex === -1
      ? 0
      : currentIndex;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isComplete = index < activeIndex || (step.key === 'review' && !!review);
          const isActive = index === activeIndex || (step.key === 'review' && showReviewStep);
          return (
            <div key={step.key} className="flex-1">
              <div className="flex items-center justify-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${isComplete
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isActive
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-slate-200 bg-white text-slate-400'
                    }`}
                >
                  {isComplete ? '✓' : index + 1}
                </div>
              </div>
              <p
                className={`mt-2 text-center text-xs font-medium ${isActive || isComplete ? 'text-slate-900' : 'text-slate-400'
                  }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-1 w-full rounded-full bg-slate-200">
        <div
          className="h-1 rounded-full bg-amber-400"
          style={{ width: `${Math.min(100, ((activeIndex + 1) / steps.length) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function OrderTracking() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const refreshOrders = () => {
      const allOrders = storage.getOrders();
      const mine = isAuthenticated
        ? allOrders.filter((order) => order.customerId === user?.id)
        : [];
      setOrders(mine);
    };

    refreshOrders();

    // Keep the view in sync if orders change elsewhere (e.g., admin panel in another tab)
    const interval = window.setInterval(refreshOrders, 5000);
    window.addEventListener('storage', refreshOrders);
    window.addEventListener('vglecheflan:orders-updated', refreshOrders);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', refreshOrders);
      window.removeEventListener('vglecheflan:orders-updated', refreshOrders);
    };
  }, [isAuthenticated, user]);

  const handleSubmitReview = async (orderId) => {
    setSubmitting(true);
    const order = storage.getOrder(orderId);
    if (!order) {
      setSubmitting(false);
      return;
    }
    const updatedOrder = {
      ...order,
      review: {
        rating: reviewDraft.rating,
        comment: reviewDraft.comment,
        createdAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    storage.saveOrder(updatedOrder);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    setSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className="mt-2 text-slate-600">Please log in to view your orders and track their status.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <p className="mt-2 text-slate-600">View your recent orders and track delivery status in real time.</p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 shadow">
          <p className="text-slate-600">You don't have any orders yet. Shop now to place your first order.</p>
          <div className="mt-4">
            <Link to="/shop">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders
            .slice()
            .sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            .map((order) => {
              const isReviewable = order.status === 'received' && !order.review;
              return (
                <div key={order.id} className="rounded-2xl bg-white p-6 shadow">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Order ID</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Placed</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total</p>
                      <p className="mt-1 text-lg font-semibold text-amber-600">₱{order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Status</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900 capitalize">
                        {order.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <OrderTimeline status={order.status} review={order.review} />

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-sm font-semibold text-slate-700">Items</h3>
                      <ul className="mt-3 space-y-2">
                        {order.items.map((item) => (
                          <li key={item.productId} className="flex items-center justify-between">
                            <span className="text-sm text-slate-700">{item.productName} ×{item.quantity}</span>
                            <span className="text-sm font-semibold text-slate-900">
                              ₱{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isReviewable ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-slate-700">Leave a review</h3>
                        <p className="mt-1 text-xs text-slate-500">Share your experience so others can know what to expect.</p>
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setReviewDraft({ ...reviewDraft, rating: value })}
                                className={`text-2xl ${reviewDraft.rating >= value ? 'text-amber-500' : 'text-slate-300'
                                  }`}
                                aria-label={`Rate ${value} stars`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={reviewDraft.comment}
                            onChange={(e) => setReviewDraft({ ...reviewDraft, comment: e.target.value })}
                            placeholder="Tell us what you thought..."
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none"
                            rows={3}
                          />
                          <Button
                            onClick={() => handleSubmitReview(order.id)}
                            disabled={submitting || reviewDraft.comment.trim() === ''}
                          >
                            {submitting ? 'Submitting…' : 'Submit Review'}
                          </Button>
                        </div>
                      </div>
                    ) : order.review ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-slate-700">Your review</h3>
                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <span
                              key={value}
                              className={`text-xl ${order.review?.rating >= value ? 'text-amber-500' : 'text-slate-200'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 text-sm text-slate-600">{order.review.comment}</p>
                        <p className="mt-2 text-xs text-slate-400">Reviewed on {new Date(order.review.createdAt).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h3 className="text-sm font-semibold text-slate-700">Waiting for delivery</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Your review form will appear once your order is marked as received.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

export function Login() {
  const { login, register, sendVerificationCode, verifyCode, sendPasswordResetCode, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loginMode, setLoginMode] = useState('choose'); // 'choose' | 'admin' | 'customer'
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStep, setRegistrationStep] = useState('details'); // 'details' | 'verify'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetStep, setResetStep] = useState('email'); // 'email' | 'verify' | 'new'
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState(null);

  const handleSendCode = async () => {
    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!email.includes('@') && !/^\d{10,11}$/.test(email.replace(/\D/g, ''))) {
      setError('Please enter a valid Email or 11-digit Mobile Number.');
      return;
    }

    setLoading(true);
    const { success, message, code: generatedCode } = await sendVerificationCode(email, username, password);
    setLoading(false);
    if (success) {
      setDemoCode(generatedCode);
      setRegistrationStep('verify');
      setError(null);
    } else {
      setError(message || 'Failed to send verification code. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    setLoading(true);
    const result = await verifyCode(email, code);
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'Invalid verification code.');
      return;
    }
    // Auto-login after successful registration
    await login(username, password);
    navigate('/');
  };

  const handleSendResetCode = async () => {
    if (!resetEmail || (!resetEmail.includes('@') && !/^\d{10,11}$/.test(resetEmail.replace(/\D/g, '')))) {
      setError('Please enter a valid Email or 11-digit Mobile Number.');
      return;
    }

    setLoading(true);
    const result = await sendPasswordResetCode(resetEmail);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Failed to send reset code.');
      return;
    }

    setDemoCode(result.code);
    setResetStep('verify');
    setError(null);
  };

  const handleVerifyResetCode = async () => {
    if (!resetCode || resetCode.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Please enter a new password (at least 6 characters).');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(resetEmail, resetCode, newPassword);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Invalid reset code.');
      return;
    }

    // Reset completed, force login
    setError(null);
    setIsResetting(false);
    setResetStep('email');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');

    // Optionally log in directly if user exists
    await login(resetEmail, newPassword);
    navigate('/');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loginMode === 'customer') {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password.');
      }
    } else {
      // Admin login with email
      const success = await login(email, password); // For admin, still use email
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid credentials.');
      }
    }
  };

  const openAdminForm = () => {
    setError(null);
    setDemoCode(null);
    setEmail('');
    setPassword('');
    setLoginMode('admin');
  };
  const openCustomerForm = () => {
    setError(null);
    setDemoCode(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setCode('');
    setIsRegistering(false);
    setRegistrationStep('details');
    setLoginMode('customer');
  };
  const closeForm = () => {
    setDemoCode(null);
    setLoginMode('choose');
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-slate-600">
        Select how you want to log in.
      </p>

      {/* buttons moved to bottom when choose mode */}
      {loginMode === 'choose' && (
        <div className="flex flex-col gap-6 max-w-sm mx-auto relative z-10 mt-6">
          <button
            type="button"
            onClick={openAdminForm}
            className="group relative p-4 rounded-2xl border-2 border-orange-500 bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 shadow-2xl hover:shadow-red-500/60 hover:scale-[1.03] hover:-translate-y-1 active:scale-95 transition-all duration-500 ease-out cursor-pointer overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            ></div>
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 opacity-20 group-hover:opacity-40 blur-md transition duration-500"
            ></div>
            <div className="relative z-10 flex items-center justify-center">
              <p className="text-white font-bold text-lg tracking-wide drop-shadow-lg">
                Admin Login
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={openCustomerForm}
            className="group relative p-4 rounded-2xl border-2 border-orange-500 bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 shadow-2xl hover:shadow-red-500/60 hover:scale-[1.03] hover:-translate-y-1 active:scale-95 transition-all duration-500 ease-out cursor-pointer overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
            ></div>
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-yellow-400 to-red-500 opacity-20 group-hover:opacity-40 blur-md transition duration-500"
            ></div>
            <div className="relative z-10 flex items-center justify-center">
              <p className="text-white font-bold text-lg tracking-wide drop-shadow-lg">
                Customer Login
              </p>
            </div>
          </button>
        </div>
      )}
      {/* modal form for admin/customer login */}
      {loginMode !== 'choose' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {loginMode === 'admin'
                ? 'Admin Login'
                : isRegistering
                  ? registrationStep === 'details'
                    ? 'Create Account'
                    : 'Verify Email'
                  : 'Customer Login'}
            </h2>
            {error && (
              <div className="mt-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {loginMode === 'customer' && isResetting ? (
              resetStep === 'email' ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email or Mobile No.</label>
                    <input
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      type="text"
                      placeholder="you@example.com or 09123456789"
                    />
                  </div>
                  <Button onClick={handleSendResetCode} disabled={loading} className="w-full">
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetting(false);
                      setResetStep('email');
                      setResetEmail('');
                      setResetCode('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setError(null);
                    }}
                    className="w-full text-sm text-slate-600 hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {demoCode && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Testing Mode Active</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Your 6-digit verification code is: <span className="font-bold text-lg">{demoCode}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-slate-600">
                    We've sent a 6-digit reset code to {resetEmail}. Enter it below along with a new password.
                  </p>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Reset Code</label>
                    <input
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-center text-lg tracking-widest"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">New Password</label>
                    <div className="relative">
                      <input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 pr-10"
                        type={showPassword ? 'text' : 'password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                    <div className="relative">
                      <input
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 pr-10"
                        type={showConfirmPassword ? 'text' : 'password'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <Button onClick={handleVerifyResetCode} disabled={loading} className="w-full">
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setResetStep('email')}
                    className="w-full text-sm text-slate-600 hover:underline"
                  >
                    Back
                  </button>
                </div>
              )
            ) : loginMode === 'customer' && isRegistering ? (
              registrationStep === 'details' ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Username</label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      type="text"
                      placeholder="Choose a username"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email or Mobile No.</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      type="text"
                      placeholder="you@example.com or 09123456789"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 pr-10"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border px-3 py-2 pr-10"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                  <Button onClick={handleSendCode} disabled={loading} className="w-full">
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {demoCode && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Testing Mode Active</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>Your 6-digit verification code is: <span className="font-bold text-lg">{demoCode}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-slate-600">
                    We've sent a 6-digit verification code to {email}. Please enter it below.
                  </p>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Verification Code</label>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="mt-1 w-full rounded-md border px-3 py-2 text-center text-lg tracking-widest"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={handleVerifyCode} disabled={loading} className="w-full">
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setRegistrationStep('details')}
                    className="w-full text-sm text-slate-600 hover:underline"
                  >
                    Back
                  </button>
                </div>
              )
            ) : (
              <form onSubmit={handleLogin} className="mt-4 space-y-4">
                {loginMode === 'customer' ? (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Username</label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      type="text"
                      placeholder="Enter your username"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email or Mobile No.</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      type="text"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2 pr-10"
                      type={showPassword ? 'text' : 'password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
            )}
            {loginMode === 'customer' && !isRegistering && (
              <>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="mt-2 w-full text-left text-sm font-semibold text-amber-700 hover:text-amber-900 hover:underline"
                >
                  Don't have an account? Create one
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetting(true);
                    setResetStep('email');
                    setResetEmail(email);
                    setError(null);
                  }}
                  className="mt-1 w-full text-left text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                >
                  Forgot password?
                </button>
              </>
            )}
            {loginMode === 'customer' && isRegistering && registrationStep === 'details' && (
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="mt-2 text-sm font-semibold text-amber-700 hover:text-amber-900 hover:underline"
              >
                Already have an account? Login
              </button>
            )}
            <button
              type="button"
              onClick={closeForm}
              className="mt-4 text-sm text-slate-600 hover:underline"
            >
              Back
            </button>
          </div>
        </div>
      )}    </div>
  );
}

export function Contact() {
  return (
    <div className="rounded-2xl bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="mt-2 text-slate-600">
        For questions, email us at{' '}
        <a className="text-primary" href="mailto:support@vglecheflan.com">
          vnglecheflan0824@gmail.com
        </a>
        .
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Service</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Need help with an order? Send us a message and we’ll get back to you within 24 hours.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Business Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Interested in partnering or selling your desserts? Let’s talk.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function About() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <header className="rounded-3xl bg-white/60 backdrop-blur-sm p-10 shadow-xl">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              About V &amp; G Leche Flan
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-700 mx-auto">
              Pambansang Dessert.
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-10">
          <div className="rounded-3xl bg-white p-10 shadow-lg">
            <h2 className="text-3xl font-semibold text-rose-600">Our Story</h2>
            <p className="mt-4 text-slate-600">
              V &amp; G LecheFlan started as a humble kitchen dream in Las Pinas, where two passionate bakers, Vergie and Greg,
              combined their love for Filipino desserts with family recipes passed down through generations.
            </p>
            <p className="mt-4 text-slate-600">
              What began as preparing desserts for family gatherings quickly grew into a beloved local business.
              Our signature leche flan, made with the finest ingredients and traditional methods, became the talk of the neighborhood.
            </p>
            <p className="mt-4 text-slate-600">
              Today, V &amp; G LecheFlan continues to honor those same traditions while innovating with new flavors and creations.
              Every dessert we make carries the same love and attention to detail that started it all.
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 p-12 text-center text-white shadow-lg">
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="mt-4 max-w-3xl mx-auto text-sm text-white/90">
              To bring joy and sweetness to every celebration by crafting authentic Filipino desserts that honor
              tradition while delighting modern palates. We believe every special moment deserves the perfect dessert.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { AdminDashboard, ProductManagement, OrderManagement, POSSystem, InventoryManagement, Reports, QRScanner } from "./AdminPages";

export function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold">404 - Page not found</h1>
      <p className="mt-2 text-gray-600">The page you are looking for does not exist.</p>
      <div className="mt-6">
        <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
          Return home
        </Link>
      </div>
    </div>
  );
}
