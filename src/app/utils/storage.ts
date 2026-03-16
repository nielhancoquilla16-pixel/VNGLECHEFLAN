/**
 * Local Storage utilities for data persistence
 * In production, this would be replaced with Supabase API calls
 */

export interface User {
  id: string;
  email: string;
  username?: string;
  role: 'customer' | 'staff' | 'admin';
  name: string;
  password?: string; // stored in plaintext for demo; replace with secure hashing in prod
}

export interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  username: string;
  password: string;
  code: string;
  expiresAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  categoryId?: string;
  image?: string;
  inventory: number;
  status: 'active' | 'inactive';
  type: 'product' | 'ingredient';
  unit?: string; // for ingredients
  itemNumber?: string; // for ingredients
  purchaseCount?: number; // track how many times this product has been purchased
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status:
    | 'pending'
    | 'confirmed'
    | 'to_ship'
    | 'out_for_delivery'
    | 'received'
    | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'online' | 'cash' | 'pos';
  orderType: 'online' | 'pos';
  createdAt: string;
  updatedAt: string;
  review?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  qrCode?: string;
}

export interface POSTransaction {
  id: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: 'cash' | 'card';
  cashierId: string;
  createdAt: string;
}

// Safe localStorage wrapper (some browsers / modes can throw when accessing localStorage)
const safeStorage = (() => {
  const memoryStore: Record<string, string> = {};
  let available = true;

  try {
    const testKey = '__vglecheflan_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
  } catch {
    available = false;
  }

  return {
    getItem: (key: string) => {
      if (!available) return memoryStore[key] ?? null;
      try {
        return window.localStorage.getItem(key);
      } catch {
        return memoryStore[key] ?? null;
      }
    },
    setItem: (key: string, value: string) => {
      if (!available) {
        memoryStore[key] = value;
        return;
      }
      try {
        window.localStorage.setItem(key, value);
      } catch {
        memoryStore[key] = value;
      }
    },
    removeItem: (key: string) => {
      if (!available) {
        delete memoryStore[key];
        return;
      }
      try {
        window.localStorage.removeItem(key);
      } catch {
        delete memoryStore[key];
      }
    },
  };
})();

// helper that safely parses JSON, returning a default if parsing fails
function parseJSON<T>(value: string | null, fallback: T): T {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    // corrupted data – fall back rather than throwing
    console.warn('storage: failed to parse JSON, resetting value', value);
    return fallback;
  }
}

// Initialize default data
const initializeData = () => {
  if (!safeStorage.getItem('categories')) {
    const categories: Category[] = [
      { id: '1', name: 'Leche Flan', description: 'Classic Filipino caramel custard' },
      { id: '2', name: 'Cakes', description: 'Delicious homemade cakes' },
      { id: '3', name: 'Pastries', description: 'Fresh baked pastries' },
      { id: '4', name: 'Special Desserts', description: 'Unique and special creations' },
    ];
    safeStorage.setItem('categories', JSON.stringify(categories));
  }

  if (!safeStorage.getItem('products')) {
    const products: Product[] = [
      {
        id: '1',
        name: 'Classic Leche Flan',
        description: 'Traditional Filipino leche flan with caramel sauce',
        price: 250,
        categoryId: '1',
        image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
        inventory: 50,
        status: 'active',
        type: 'product',
        purchaseCount: 45,
      },
      {
        id: '2',
        name: 'Ube Leche Flan',
        description: 'Purple yam flavored leche flan',
        price: 280,
        categoryId: '1',
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400',
        inventory: 30,
        status: 'active',
        type: 'product',
        purchaseCount: 32,
      },
      {
        id: '3',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with ganache',
        price: 650,
        categoryId: '2',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
        inventory: 15,
        status: 'active',
        type: 'product',
        purchaseCount: 18,
      },
      {
        id: '4',
        name: 'Mango Float',
        description: 'Layered mango and cream dessert',
        price: 350,
        categoryId: '4',
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
        inventory: 25,
        status: 'active',
        type: 'product',
        purchaseCount: 27,
      },
      {
        id: '5',
        name: 'Cheese Cupcakes',
        description: 'Soft and creamy cheese cupcakes',
        price: 150,
        categoryId: '3',
        image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400',
        inventory: 40,
        status: 'active',
        type: 'product',
        purchaseCount: 38,
      },
      {
        id: '6',
        name: 'Buko Pandan',
        description: 'Young coconut in pandan jelly',
        price: 200,
        categoryId: '4',
        image: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400',
        inventory: 35,
        status: 'active',
        type: 'product',
        purchaseCount: 22,
      },
      {
        id: '7',
        name: 'Sugar',
        description: 'White granulated sugar',
        inventory: 100,
        status: 'active',
        type: 'ingredient',
        unit: 'kg',
        itemNumber: 'ING-001',
      },
      {
        id: '8',
        name: 'Milk',
        description: 'Fresh cow milk',
        inventory: 50,
        status: 'active',
        type: 'ingredient',
        unit: 'liters',
        itemNumber: 'ING-002',
      },
      {
        id: '9',
        name: 'Flour',
        description: 'All-purpose flour',
        inventory: 75,
        status: 'active',
        type: 'ingredient',
        unit: 'kg',
        itemNumber: 'ING-003',
      },
      {
        id: '10',
        name: 'Eggs',
        description: 'Fresh chicken eggs',
        inventory: 200,
        status: 'active',
        type: 'ingredient',
        unit: 'pieces',
        itemNumber: 'ING-004',
      },
    ];
    safeStorage.setItem('products', JSON.stringify(products));
  }

  const defaultUsers: User[] = [
    { id: '1', email: 'vngadmin@admin.com', username: 'admin', role: 'admin', name: 'Admin User', password: 'vnglecheflanadmin26' },
    { id: '2', email: 'vngstaff@staff.com', username: 'staff', role: 'staff', name: 'Staff User', password: 'vnglecheflanstaff2026' },
    { id: '3', email: 'customer@example.com', username: 'johndoe', role: 'customer', name: 'John Doe', password: '' },
  ];

  // Ensure required demo users exist and are up-to-date.
  const existingUsers: User[] = parseJSON(safeStorage.getItem('users'), []);

  // Remove legacy demo accounts that should no longer be valid
  const disallowedEmails = ['admin@vglecheflan.com', 'staff@vglecheflan.com'];
  const filteredExisting = existingUsers.filter(
    (u) => !disallowedEmails.includes(u.email)
  );

  const mergedUsers = defaultUsers.map((defaultUser) => {
    const existing = filteredExisting.find((u) => u.email === defaultUser.email);
    return existing ? { ...existing, ...defaultUser } : defaultUser;
  });

  // Preserve any additional users that may have been added by other demo flows
  const extraUsers = filteredExisting.filter(
    (u) => !mergedUsers.some((m) => m.email === u.email)
  );

  safeStorage.setItem('users', JSON.stringify([...mergedUsers, ...extraUsers]));

  if (!safeStorage.getItem('orders')) {
    const orders: Order[] = [
      {
        id: '1001',
        customerId: '3',
        customerName: 'John Doe',
        customerEmail: 'customer@example.com',
        items: [
          { productId: '1', productName: 'Classic Leche Flan', quantity: 2, price: 250 },
          { productId: '3', productName: 'Chocolate Cake', quantity: 1, price: 650 },
        ],
        total: 1150,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'online',
        orderType: 'online',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '1002',
        customerId: '3',
        customerName: 'John Doe',
        customerEmail: 'customer@example.com',
        items: [
          { productId: '2', productName: 'Ube Leche Flan', quantity: 1, price: 280 },
          { productId: '4', productName: 'Mango Float', quantity: 1, price: 350 },
        ],
        total: 630,
        status: 'out_for_delivery',
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        orderType: 'pos',
        createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        updatedAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: '1003',
        customerId: '',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        items: [
          { productId: '5', productName: 'Cheese Cupcakes', quantity: 3, price: 150 },
        ],
        total: 450,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'online',
        orderType: 'online',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    safeStorage.setItem('orders', JSON.stringify(orders));
  }

  if (!safeStorage.getItem('revenue')) {
    const now = new Date();
    const revenue = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      // track period start markers to auto-rollover
      lastDailyStart: startOfDay(now).toISOString(),
      lastWeeklyStart: startOfWeek(now).toISOString(),
      lastMonthlyStart: startOfMonth(now).toISOString(),
      // history for past periods
      dailyHistory: [] as Array<{ date: string; total: number }> ,
      weeklyHistory: [] as Array<{ weekStart: string; total: number }> ,
      monthlyHistory: [] as Array<{ month: string; total: number }> ,
    };
    safeStorage.setItem('revenue', JSON.stringify(revenue));
  }
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  // assume week starts on Sunday
  d.setDate(d.getDate() - day);
  return d;
}

function startOfMonth(date: Date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface Revenue {
  daily: number;
  weekly: number;
  monthly: number;
  lastDailyStart: string;
  lastWeeklyStart: string;
  lastMonthlyStart: string;
  dailyHistory: Array<{ date: string; total: number }>;
  weeklyHistory: Array<{ weekStart: string; total: number }>;
  monthlyHistory: Array<{ month: string; total: number }>;
}

function normalizeRevenue(revenue: Revenue) {
  const now = new Date();
  const currentDayStart = startOfDay(now).toISOString();
  const currentWeekStart = startOfWeek(now).toISOString();
  const currentMonthStart = startOfMonth(now).toISOString();

  if (revenue.lastDailyStart !== currentDayStart) {
    revenue.dailyHistory = revenue.dailyHistory ?? [];
    revenue.dailyHistory.push({ date: revenue.lastDailyStart, total: revenue.daily });
    // keep last 7 days
    if (revenue.dailyHistory.length > 7) revenue.dailyHistory.shift();
    revenue.daily = 0;
    revenue.lastDailyStart = currentDayStart;
  }

  if (revenue.lastWeeklyStart !== currentWeekStart) {
    revenue.weeklyHistory = revenue.weeklyHistory ?? [];
    revenue.weeklyHistory.push({ weekStart: revenue.lastWeeklyStart, total: revenue.weekly });
    // keep last 12 weeks
    if (revenue.weeklyHistory.length > 12) revenue.weeklyHistory.shift();
    revenue.weekly = 0;
    revenue.lastWeeklyStart = currentWeekStart;
  }

  if (revenue.lastMonthlyStart !== currentMonthStart) {
    revenue.monthlyHistory = revenue.monthlyHistory ?? [];
    revenue.monthlyHistory.push({ month: revenue.lastMonthlyStart, total: revenue.monthly });
    // keep last 12 months
    if (revenue.monthlyHistory.length > 12) revenue.monthlyHistory.shift();
    revenue.monthly = 0;
    revenue.lastMonthlyStart = currentMonthStart;
  }

  return revenue;
}


// Storage API
export const storage = {
  init: () => {
    try {
      initializeData();
    } catch (e) {
      console.error('storage.initializeData() threw, clearing storage and retrying', e);
      // clear out problematic keys to allow app to boot
      ['categories','products','users','cart','orders','posTransactions'].forEach(k => safeStorage.removeItem(k));
      try {
        initializeData();
      } catch (err) {
        console.error('retry after clearing storage failed', err);
      }
    }
  },

  // User operations
  getUser: (id: string): User | null => {
    const users: User[] = parseJSON(safeStorage.getItem('users'), []);
    return users.find(u => u.id === id) || null;
  },

  getUserByEmail: (email: string): User | null => {
    const users: User[] = parseJSON(safeStorage.getItem('users'), []);
    return users.find(u => u.email === email) || null;
  },

  getUserByUsername: (username: string): User | null => {
    const users: User[] = parseJSON(safeStorage.getItem('users'), []);
    return users.find(u => u.username === username) || null;
  },

  savePendingRegistration: (pending: PendingRegistration) => {
    const pendingList: PendingRegistration[] = parseJSON(safeStorage.getItem('pendingRegistrations'), []);
    const filtered = pendingList.filter((p) => p.email !== pending.email);
    safeStorage.setItem('pendingRegistrations', JSON.stringify([...filtered, pending]));
  },

  getPendingRegistration: (email: string): PendingRegistration | null => {
    const pendingList: PendingRegistration[] = parseJSON(safeStorage.getItem('pendingRegistrations'), []);
    return pendingList.find((p) => p.email === email) || null;
  },

  removePendingRegistration: (email: string) => {
    const pendingList: PendingRegistration[] = parseJSON(safeStorage.getItem('pendingRegistrations'), []);
    const filtered = pendingList.filter((p) => p.email !== email);
    safeStorage.setItem('pendingRegistrations', JSON.stringify(filtered));
  },

  getUsers: (): User[] => {
    return parseJSON(safeStorage.getItem('users'), []);
  },

  saveUser: (user: User) => {
    const users: User[] = parseJSON(safeStorage.getItem('users'), []);
    const index = users.findIndex(u => u.id === user.id || u.email === user.email);
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    safeStorage.setItem('users', JSON.stringify(users));
  },

  // Product operations
  getProducts: (): Product[] => {
    const products = parseJSON(safeStorage.getItem('products'), []);
    // Ensure legacy entries (created before ingredient/product typing) default to product
    return products.map((p: unknown) => {
      const product = p as Partial<Product>;
      return {
        ...(product as Product),
        type: (product.type ?? 'product') as Product['type'],
      };
    });
  },

  getProduct: (id: string): Product | null => {
    const products = storage.getProducts();
    return products.find(p => p.id === id) || null;
  },

  saveProduct: (product: Product) => {
    const products = storage.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    safeStorage.setItem('products', JSON.stringify(products));
  },

  deleteProduct: (id: string) => {
    const products = storage.getProducts();
    const filtered = products.filter(p => p.id !== id);
    safeStorage.setItem('products', JSON.stringify(filtered));
  },

  updateInventory: (productId: string, quantity: number) => {
    const product = storage.getProduct(productId);
    if (product) {
      product.inventory = quantity;
      storage.saveProduct(product);
    }
  },

  // Category operations
  getCategories: (): Category[] => {
    return parseJSON(safeStorage.getItem('categories'), []);
  },

  getCategory: (id: string): Category | null => {
    const categories = storage.getCategories();
    return categories.find(c => c.id === id) || null;
  },

  saveCategory: (category: Category) => {
    const categories = storage.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    safeStorage.setItem('categories', JSON.stringify(categories));
  },

  deleteCategory: (id: string) => {
    const categories = storage.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    safeStorage.setItem('categories', JSON.stringify(filtered));
  },

  // Cart operations
  getCart: (): CartItem[] => {
    return parseJSON(safeStorage.getItem('cart'), []);
  },

  addToCart: (item: CartItem) => {
    const cart = storage.getCart();
    const existingItem = cart.find(i => i.productId === item.productId);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    
    safeStorage.setItem('cart', JSON.stringify(cart));
  },

  updateCartItem: (productId: string, quantity: number) => {
    const cart = storage.getCart();
    const item = cart.find(i => i.productId === productId);
    
    if (item) {
      item.quantity = quantity;
      safeStorage.setItem('cart', JSON.stringify(cart));
    }
  },

  removeFromCart: (productId: string) => {
    const cart = storage.getCart();
    const filtered = cart.filter(i => i.productId !== productId);
    safeStorage.setItem('cart', JSON.stringify(filtered));
  },

  clearCart: () => {
    safeStorage.setItem('cart', JSON.stringify([]));
  },

  // Order operations
  getOrders: (): Order[] => {
    return parseJSON(safeStorage.getItem('orders'), []);
  },

  getOrder: (id: string): Order | null => {
    const orders = storage.getOrders();
    return orders.find(o => o.id === id) || null;
  },

  saveOrder: (order: Order) => {
    const orders = storage.getOrders();
    const index = orders.findIndex(o => o.id === order.id);

    if (index >= 0) {
      const previous = orders[index];
      orders[index] = order;

      // If payment status transitions to paid, add to revenue and update purchase counts.
      if (previous.paymentStatus !== 'paid' && order.paymentStatus === 'paid') {
        storage.addRevenue(order.total);
        storage.updatePurchaseCounts(order.items);
      }
    } else {
      orders.push(order);
      // Add to revenue if new order and paid
      if (order.paymentStatus === 'paid') {
        storage.addRevenue(order.total);
        storage.updatePurchaseCounts(order.items);
      }
    }

    safeStorage.setItem('orders', JSON.stringify(orders));
    return order;
  },

  updateOrderStatus: (orderId: string, status: Order['status']) => {
    const order = storage.getOrder(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      storage.saveOrder(order);
    }
  },

  // Revenue operations
  getRevenue: () => {
    const revenue = parseJSON(safeStorage.getItem('revenue'), {
      daily: 0,
      weekly: 0,
      monthly: 0,
      lastDailyStart: startOfDay(new Date()).toISOString(),
      lastWeeklyStart: startOfWeek(new Date()).toISOString(),
      lastMonthlyStart: startOfMonth(new Date()).toISOString(),
      dailyHistory: [],
      weeklyHistory: [],
      monthlyHistory: [],
    });

    const normalized = normalizeRevenue(revenue);
    safeStorage.setItem('revenue', JSON.stringify(normalized));
    return normalized;
  },

  addRevenue: (amount: number) => {
    const revenue = storage.getRevenue();
    const normalized = normalizeRevenue(revenue);

    normalized.daily += amount;
    normalized.weekly += amount;
    normalized.monthly += amount;

    safeStorage.setItem('revenue', JSON.stringify(normalized));
  },

  resetDaily: () => {
    const revenue = storage.getRevenue();
    revenue.daily = 0;
    safeStorage.setItem('revenue', JSON.stringify(revenue));
  },

  resetWeekly: () => {
    const revenue = storage.getRevenue();
    revenue.weekly = 0;
    revenue.lastWeeklyStart = startOfWeek(new Date()).toISOString();
    safeStorage.setItem('revenue', JSON.stringify(revenue));
  },

  // POS Transaction operations
  getPOSTransactions: (): POSTransaction[] => {
    return parseJSON(safeStorage.getItem('posTransactions'), []);
  },

  savePOSTransaction: (transaction: POSTransaction) => {
    const transactions = storage.getPOSTransactions();
    transactions.push(transaction);
    safeStorage.setItem('posTransactions', JSON.stringify(transactions));
    
    // Add to revenue
    storage.addRevenue(transaction.total);
    
    // Update purchase counts
    storage.updatePurchaseCounts(transaction.items);

  },

  // Current user session
  setCurrentUser: (user: User | null) => {
    if (user) {
      safeStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      safeStorage.removeItem('currentUser');
    }
  },

  getCurrentUser: (): User | null => {
    const user = safeStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  updatePurchaseCounts: (items: Array<{ productId: string; quantity: number }>) => {
    const products = storage.getProducts();
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.purchaseCount = (product.purchaseCount || 0) + item.quantity;
      }
    });
    safeStorage.setItem('products', JSON.stringify(products));
  },

  getBestSellers: (limit: number = 6): Product[] => {
    const products = storage.getProducts()
      .filter(p => p.status === 'active')
      .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0));
    return products.slice(0, limit);
  },
};
