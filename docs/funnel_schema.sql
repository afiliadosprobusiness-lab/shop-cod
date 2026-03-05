-- ShopCOD simple funnel schema (single product per funnel)

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE funnels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  funnel_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('physical', 'digital')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('stripe', 'paypal', 'cash_on_delivery')),
  FOREIGN KEY (funnel_id) REFERENCES funnels(id)
);

CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  funnel_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('landing', 'checkout', 'thankyou')),
  content_json TEXT NOT NULL,
  FOREIGN KEY (funnel_id) REFERENCES funnels(id)
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  funnel_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('stripe', 'paypal', 'cash_on_delivery')),
  status TEXT NOT NULL CHECK (status IN ('new', 'processing', 'shipped', 'completed')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (funnel_id) REFERENCES funnels(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
