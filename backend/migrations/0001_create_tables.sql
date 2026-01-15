-- Create schema for Kopiteh app
BEGIN;

-- venues
CREATE TABLE IF NOT EXISTS venue (
  venue_id      SERIAL PRIMARY KEY,
  name          VARCHAR NOT NULL,
  address       VARCHAR,
  description   TEXT,
  image_url     VARCHAR,
  opening_hours VARCHAR
);

-- users
CREATE TABLE IF NOT EXISTS users (
  user_id                   SERIAL PRIMARY KEY,
  name                      VARCHAR(255) NOT NULL,
  email                     VARCHAR(255) NOT NULL UNIQUE,
  password_hash             VARCHAR(255) NOT NULL,
  role                      VARCHAR(50) NOT NULL DEFAULT 'user',
  is_authenticated          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verify_code               VARCHAR(6),         
  verify_code_expires_at    TIMESTAMPTZ,
  reset_password_code       VARCHAR(6),
  reset_password_expires_at TIMESTAMPTZ
);

-- user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  user_session_id UUID PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- stalls
CREATE TABLE IF NOT EXISTS stall (
  stall_id     SERIAL PRIMARY KEY,
  venue_id     INTEGER NOT NULL REFERENCES venue(venue_id) ON DELETE CASCADE,
  name         VARCHAR NOT NULL,
  description  TEXT,
  stall_image  VARCHAR,
  is_open      BOOLEAN NOT NULL DEFAULT TRUE,
  waiting_time INTEGER NOT NULL DEFAULT 0 CHECK (waiting_time >= 0)
);
CREATE INDEX IF NOT EXISTS idx_stall_venue_id ON stall (venue_id);

-- menu items
CREATE TABLE IF NOT EXISTS menu_item (
  item_id      SERIAL PRIMARY KEY,
  stall_id     INTEGER NOT NULL REFERENCES stall(stall_id) ON DELETE CASCADE,
  item_image   VARCHAR,
  name         VARCHAR NOT NULL,
  description  TEXT,
  price        DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  prep_time    INTEGER NOT NULL DEFAULT 0 CHECK (prep_time >= 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_menu_item_stall_id ON menu_item (stall_id);

CREATE TABLE IF NOT EXISTS menu_item_category (
  category_id SERIAL PRIMARY KEY,
  stall_id    INTEGER NOT NULL REFERENCES stall(stall_id) ON DELETE CASCADE,
  name        VARCHAR NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_category_stall_id ON menu_item_category (stall_id);

ALTER TABLE menu_item
  ADD COLUMN category_id INTEGER REFERENCES menu_item_category(category_id) ON DELETE SET NULL;

CREATE INDEX idx_menu_item_category_id ON menu_item (category_id);

-- modifier sections (belongs to a menu_item)
CREATE TABLE IF NOT EXISTS menu_item_modifier_section (
  section_id     SERIAL PRIMARY KEY,
  item_id        INTEGER NOT NULL REFERENCES menu_item(item_id) ON DELETE CASCADE,
  name           VARCHAR NOT NULL,
  min_selections INTEGER NOT NULL DEFAULT 0 CHECK (min_selections >= 0),
  max_selections INTEGER NOT NULL DEFAULT 1 CHECK (max_selections >= 0)
);
ALTER TABLE menu_item_modifier_section
  ADD CONSTRAINT chk_modifier_section_min_le_max CHECK (max_selections >= min_selections);
CREATE INDEX IF NOT EXISTS idx_modifier_section_item_id ON menu_item_modifier_section (item_id);

-- modifiers/options for an item
CREATE TABLE IF NOT EXISTS menu_item_modifier (
  option_id      SERIAL PRIMARY KEY,
  section_id     INTEGER NOT NULL REFERENCES menu_item_modifier_section(section_id) ON DELETE CASCADE,
  item_id        INTEGER NOT NULL REFERENCES menu_item(item_id) ON DELETE CASCADE,
  name           VARCHAR NOT NULL,
  price_modifier DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price_modifier >= 0),
  is_available   BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_modifier_item_id ON menu_item_modifier (item_id);

-- tables in a venue
CREATE TABLE IF NOT EXISTS "table" (
  table_id     SERIAL PRIMARY KEY,
  venue_id     INTEGER NOT NULL REFERENCES venue(venue_id) ON DELETE CASCADE,
  table_number VARCHAR,
  qr_code      VARCHAR NOT NULL UNIQUE
);
CREATE INDEX IF NOT EXISTS idx_table_venue_id ON "table" (venue_id);

-- orders
CREATE TABLE IF NOT EXISTS "order" (
  order_id    SERIAL PRIMARY KEY,
  table_id    INTEGER NOT NULL REFERENCES "table"(table_id) ON DELETE RESTRICT,
  user_id     INTEGER REFERENCES users(user_id) ON DELETE RESTRICT,
  status      VARCHAR NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  remarks     TEXT
);
CREATE INDEX IF NOT EXISTS idx_order_table_id ON "order" (table_id);

-- order items
CREATE TABLE IF NOT EXISTS order_item (
  order_item_id SERIAL PRIMARY KEY,
  order_id      INTEGER NOT NULL REFERENCES "order"(order_id) ON DELETE CASCADE,
  item_id       INTEGER NOT NULL REFERENCES menu_item(item_id) ON DELETE RESTRICT,
  status        VARCHAR NOT NULL DEFAULT 'INCOMING',
  quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price         DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0)
);
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item (order_id);
CREATE INDEX IF NOT EXISTS idx_order_item_item_id ON order_item (item_id);

-- order item modifiers (selected options for an order_item)
CREATE TABLE IF NOT EXISTS order_item_modifiers (
  order_item_option_id SERIAL PRIMARY KEY,
  order_item_id        INTEGER NOT NULL REFERENCES order_item(order_item_id) ON DELETE CASCADE,
  option_id            INTEGER NOT NULL REFERENCES menu_item_modifier(option_id) ON DELETE RESTRICT,
  price_modifier       DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price_modifier >= 0),
  option_name          VARCHAR NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_order_item_id ON order_item_modifiers (order_item_id);
CREATE INDEX IF NOT EXISTS idx_order_item_modifiers_option_id ON order_item_modifiers (option_id);

COMMIT;