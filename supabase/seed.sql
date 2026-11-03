-- =============================================================================
-- NETIZENCITY - Seed Data
-- =============================================================================
-- Run after the initial migration to populate the database with default data.
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECTION 1: HOUSING UNITS
-- =============================================================================
-- 50 housing units across districts with Indonesian-inspired naming

-- ---- Small Houses (10) - Residential District ----
INSERT INTO public.housing_units (name, type, district, unit_number) VALUES
  ('Rumah Kecil Jalan Melati No. 1',      'small_house',    'residential', 'RES-SH-001'),
  ('Rumah Kecil Jalan Melati No. 2',      'small_house',    'residential', 'RES-SH-002'),
  ('Rumah Kecil Jalan Anggrek No. 1',     'small_house',    'residential', 'RES-SH-003'),
  ('Rumah Kecil Jalan Anggrek No. 2',     'small_house',    'residential', 'RES-SH-004'),
  ('Rumah Kecil Jalan Kenanga No. 1',     'small_house',    'residential', 'RES-SH-005'),
  ('Rumah Kecil Jalan Kenanga No. 2',     'small_house',    'residential', 'RES-SH-006'),
  ('Rumah Kecil Jalan Mawar No. 1',       'small_house',    'residential', 'RES-SH-007'),
  ('Rumah Kecil Jalan Mawar No. 2',       'small_house',    'residential', 'RES-SH-008'),
  ('Rumah Kecil Jalan Dahlia No. 1',      'small_house',    'residential', 'RES-SH-009'),
  ('Rumah Kecil Jalan Dahlia No. 2',      'small_house',    'residential', 'RES-SH-010');

-- ---- Standard Houses (10) - Residential District ----
INSERT INTO public.housing_units (name, type, district, unit_number) VALUES
  ('Jalan Merdeka No. 5',                 'standard_house', 'residential', 'RES-ST-001'),
  ('Jalan Merdeka No. 7',                 'standard_house', 'residential', 'RES-ST-002'),
  ('Jalan Pahlawan No. 3',                'standard_house', 'residential', 'RES-ST-003'),
  ('Jalan Pahlawan No. 5',                'standard_house', 'residential', 'RES-ST-004'),
  ('Jalan Cendana No. 10',                'standard_house', 'residential', 'RES-ST-005'),
  ('Jalan Cendana No. 12',                'standard_house', 'residential', 'RES-ST-006'),
  ('Jalan Flamboyan No. 8',               'standard_house', 'residential', 'RES-ST-007'),
  ('Jalan Flamboyan No. 10',              'standard_house', 'residential', 'RES-ST-008'),
  ('Jalan Bougenville No. 1',             'standard_house', 'residential', 'RES-ST-009'),
  ('Jalan Bougenville No. 3',             'standard_house', 'residential', 'RES-ST-010');

-- ---- Apartments (15) - Residential District ----
INSERT INTO public.housing_units (name, type, district, unit_number) VALUES
  ('Netizen Apartments Block A - Unit 101', 'apartment',    'residential', 'RES-AP-A101'),
  ('Netizen Apartments Block A - Unit 102', 'apartment',    'residential', 'RES-AP-A102'),
  ('Netizen Apartments Block A - Unit 103', 'apartment',    'residential', 'RES-AP-A103'),
  ('Netizen Apartments Block A - Unit 201', 'apartment',    'residential', 'RES-AP-A201'),
  ('Netizen Apartments Block A - Unit 202', 'apartment',    'residential', 'RES-AP-A202'),
  ('Netizen Apartments Block B - Unit 101', 'apartment',    'residential', 'RES-AP-B101'),
  ('Netizen Apartments Block B - Unit 102', 'apartment',    'residential', 'RES-AP-B102'),
  ('Netizen Apartments Block B - Unit 103', 'apartment',    'residential', 'RES-AP-B103'),
  ('Netizen Apartments Block B - Unit 201', 'apartment',    'residential', 'RES-AP-B201'),
  ('Netizen Apartments Block B - Unit 202', 'apartment',    'residential', 'RES-AP-B202'),
  ('Netizen Apartments Block C - Unit 101', 'apartment',    'residential', 'RES-AP-C101'),
  ('Netizen Apartments Block C - Unit 102', 'apartment',    'residential', 'RES-AP-C102'),
  ('Netizen Apartments Block C - Unit 103', 'apartment',    'residential', 'RES-AP-C103'),
  ('Netizen Apartments Block C - Unit 201', 'apartment',    'residential', 'RES-AP-C201'),
  ('Netizen Apartments Block C - Unit 202', 'apartment',    'residential', 'RES-AP-C202');

-- ---- Public Housing (10) - Residential District ----
INSERT INTO public.housing_units (name, type, district, unit_number) VALUES
  ('Rusunawa Harapan Baru - Unit 1',      'public_housing', 'residential', 'RES-PH-001'),
  ('Rusunawa Harapan Baru - Unit 2',      'public_housing', 'residential', 'RES-PH-002'),
  ('Rusunawa Harapan Baru - Unit 3',      'public_housing', 'residential', 'RES-PH-003'),
  ('Rusunawa Harapan Baru - Unit 4',      'public_housing', 'residential', 'RES-PH-004'),
  ('Rusunawa Harapan Baru - Unit 5',      'public_housing', 'residential', 'RES-PH-005'),
  ('Rusunawa Sejahtera - Unit 1',         'public_housing', 'residential', 'RES-PH-006'),
  ('Rusunawa Sejahtera - Unit 2',         'public_housing', 'residential', 'RES-PH-007'),
  ('Rusunawa Sejahtera - Unit 3',         'public_housing', 'residential', 'RES-PH-008'),
  ('Rusunawa Sejahtera - Unit 4',         'public_housing', 'residential', 'RES-PH-009'),
  ('Rusunawa Sejahtera - Unit 5',         'public_housing', 'residential', 'RES-PH-010');

-- ---- Premium Residences (5) - Downtown ----
INSERT INTO public.housing_units (name, type, district, unit_number) VALUES
  ('Menara Netizen Penthouse - Unit 1',   'premium',        'downtown',    'DT-PR-001'),
  ('Menara Netizen Penthouse - Unit 2',   'premium',        'downtown',    'DT-PR-002'),
  ('Graha Nusantara Suite - Unit 1',      'premium',        'downtown',    'DT-PR-003'),
  ('Graha Nusantara Suite - Unit 2',      'premium',        'downtown',    'DT-PR-004'),
  ('Istana Digital Residence',            'premium',        'downtown',    'DT-PR-005');


-- =============================================================================
-- SECTION 2: DEFAULT ITEMS (Free starter items)
-- =============================================================================

-- ---- Default Tops (5) - Free ----
INSERT INTO public.items (name, description, category, price, rarity, sprite_key, is_default) VALUES
  ('Basic T-Shirt (White)',    'A clean white tee. The classic.', 'tops', 0, 'common', 'top_basic_white',   true),
  ('Basic T-Shirt (Black)',    'A sleek black tee.',              'tops', 0, 'common', 'top_basic_black',   true),
  ('Basic T-Shirt (Red)',      'A bold red tee.',                 'tops', 0, 'common', 'top_basic_red',     true),
  ('Basic T-Shirt (Blue)',     'A cool blue tee.',                'tops', 0, 'common', 'top_basic_blue',    true),
  ('Basic T-Shirt (Green)',    'A fresh green tee.',              'tops', 0, 'common', 'top_basic_green',   true);

-- ---- Default Bottoms (3) - Free ----
INSERT INTO public.items (name, description, category, price, rarity, sprite_key, is_default) VALUES
  ('Basic Jeans',              'Reliable blue denim jeans.',      'bottoms', 0, 'common', 'bottom_jeans',       true),
  ('Basic Shorts',             'Casual everyday shorts.',         'bottoms', 0, 'common', 'bottom_shorts',      true),
  ('Casual Pants',             'Comfortable casual pants.',       'bottoms', 0, 'common', 'bottom_casual',      true);

-- ---- Default Shoes (2) - Free ----
INSERT INTO public.items (name, description, category, price, rarity, sprite_key, is_default) VALUES
  ('Basic Sneakers',           'Comfy everyday sneakers.',        'shoes', 0, 'common', 'shoe_sneakers',      true),
  ('Basic Sandals',            'Simple sandals for warm days.',   'shoes', 0, 'common', 'shoe_sandals',       true);

-- ---- Default Hairstyles (3) - Free ----
INSERT INTO public.items (name, description, category, price, rarity, sprite_key, is_default) VALUES
  ('Short Hair',               'A clean short hairstyle.',        'hairstyles', 0, 'common', 'hair_short',   true),
  ('Medium Hair',              'A versatile medium-length cut.',  'hairstyles', 0, 'common', 'hair_medium',  true),
  ('Long Hair',                'Flowing long locks.',             'hairstyles', 0, 'common', 'hair_long',    true);


-- =============================================================================
-- SECTION 3: PURCHASABLE ITEMS
-- =============================================================================

-- ---- Common Items (50-100 coins) ----
INSERT INTO public.items (name, description, category, price, rarity, sprite_key) VALUES
  ('Polo Shirt (Navy)',        'A smart navy polo.',              'tops',    50,  'common',   'top_polo_navy'),
  ('Striped T-Shirt',         'A trendy striped tee.',           'tops',    75,  'common',   'top_striped'),
  ('Canvas Shoes',            'Classic canvas shoes.',            'shoes',   60,  'common',   'shoe_canvas'),
  ('Baseball Cap',            'A sporty baseball cap.',           'accessories', 80, 'common','acc_baseball_cap');

-- ---- Uncommon Items (150-300 coins) ----
INSERT INTO public.items (name, description, category, price, rarity, sprite_key) VALUES
  ('Denim Jacket',            'A stylish denim jacket.',         'tops',    200, 'uncommon', 'top_denim_jacket'),
  ('Cargo Pants',             'Tactical cargo pants.',            'bottoms', 175, 'uncommon', 'bottom_cargo'),
  ('High-Top Sneakers',       'Premium high-top sneakers.',      'shoes',   250, 'uncommon', 'shoe_hightop'),
  ('Sunglasses',              'Cool aviator sunglasses.',         'accessories', 150, 'uncommon','acc_sunglasses'),
  ('Beanie Hat',              'A cozy knitted beanie.',           'accessories', 175, 'uncommon','acc_beanie'),
  ('Wavy Hair',               'A trendy wavy hairstyle.',        'hairstyles', 200, 'uncommon','hair_wavy');

-- ---- Rare Items (500-1000 coins) ----
INSERT INTO public.items (name, description, category, price, rarity, sprite_key) VALUES
  ('Batik Shirt',             'A beautiful traditional batik.',   'tops',    750, 'rare',     'top_batik'),
  ('Leather Jacket',          'A cool leather jacket.',           'tops',    800, 'rare',     'top_leather_jacket'),
  ('Designer Jeans',          'Premium designer denim.',          'bottoms', 600, 'rare',     'bottom_designer'),
  ('Boots',                   'Sturdy leather boots.',            'shoes',   500, 'rare',     'shoe_boots'),
  ('Gold Watch',              'A shiny gold wristwatch.',         'accessories', 1000,'rare',  'acc_gold_watch');

-- ---- Epic Items (2000-5000 coins) ----
INSERT INTO public.items (name, description, category, price, rarity, sprite_key) VALUES
  ('Neon Cyberpunk Jacket',   'Glowing neon-trimmed jacket.',     'tops',    3000, 'epic',    'top_cyberpunk'),
  ('Holographic Sneakers',    'Sneakers with holographic soles.', 'shoes',   2500, 'epic',    'shoe_holographic'),
  ('Digital Crown',           'A pixelated royal crown.',         'accessories', 5000,'epic',  'acc_digital_crown'),
  ('Flame Hair',              'Hair that looks like fire.',       'hairstyles',  3500,'epic',  'hair_flame'),
  ('Galaxy Skin',             'A cosmic galaxy body skin.',       'skins',   4000, 'epic',    'skin_galaxy');


-- =============================================================================
-- SECTION 4: MISSIONS
-- =============================================================================

-- ---- Daily Missions ----
INSERT INTO public.missions (name, description, type, objective, reward_coins, reward_xp) VALUES
  (
    'Say Hello',
    'Send a message in the global chat.',
    'daily',
    '{"action": "send_chat", "target_count": 1}',
    25, 10
  ),
  (
    'Window Shopping',
    'Visit the mall and browse items.',
    'daily',
    '{"action": "visit_mall", "target_count": 1}',
    25, 10
  ),
  (
    'Social Butterfly',
    'Send 5 messages in any chat channel.',
    'daily',
    '{"action": "send_chat", "target_count": 5}',
    50, 25
  ),
  (
    'Daily Check-In',
    'Claim your daily login reward.',
    'daily',
    '{"action": "claim_daily", "target_count": 1}',
    15, 5
  ),
  (
    'Explorer',
    'Visit 3 different districts in the city.',
    'daily',
    '{"action": "visit_district", "target_count": 3}',
    40, 20
  );

-- ---- Weekly Missions ----
INSERT INTO public.missions (name, description, type, objective, reward_coins, reward_xp) VALUES
  (
    'Loyal Citizen',
    'Claim daily rewards for 5 consecutive days this week.',
    'weekly',
    '{"action": "daily_streak", "target_count": 5}',
    200, 100
  ),
  (
    'Civic Duty',
    'Participate in a community vote.',
    'weekly',
    '{"action": "cast_vote", "target_count": 1}',
    150, 75
  ),
  (
    'Fashionista',
    'Purchase an item from the mall.',
    'weekly',
    '{"action": "purchase_item", "target_count": 1}',
    100, 50
  );


-- =============================================================================
-- SECTION 5: INITIAL CITY POPULATION RECORD
-- =============================================================================

INSERT INTO public.city_population (source, follower_count, reason)
VALUES ('manual', 0, 'Initial population record - city founded');


COMMIT;
