-- =============================================================================
-- NETIZENCITY - Initial Database Schema Migration
-- =============================================================================
-- Version: 1.0.0
-- Created: 2024-11-03
-- Description: Complete initial schema for NetizenCity virtual city platform
--              Includes tables, indexes, RLS policies, functions, and triggers
-- =============================================================================

BEGIN;

-- =============================================================================
-- SECTION 1: CORE TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1.1 Citizens - Core user profiles linked to Supabase Auth
-- -----------------------------------------------------------------------------
CREATE TABLE public.citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  ktn_number TEXT UNIQUE NOT NULL,          -- Kartu Tanda Netizen (citizen ID card)
  avatar_config JSONB NOT NULL DEFAULT '{}',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  job TEXT DEFAULT NULL,
  housing_id UUID DEFAULT NULL,             -- FK added after housing_units table
  district TEXT DEFAULT NULL,
  biography TEXT DEFAULT NULL,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_location JSONB DEFAULT NULL,         -- { x, y, map } for in-game position
  achievements JSONB NOT NULL DEFAULT '[]',
  privacy_settings JSONB NOT NULL DEFAULT '{"profile_visible": true, "show_location": true}',
  role TEXT NOT NULL DEFAULT 'citizen'
    CHECK (role IN ('citizen', 'moderator', 'city_staff', 'admin', 'mayor')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_citizens_user_id ON public.citizens(user_id);
CREATE INDEX idx_citizens_username ON public.citizens(username);
CREATE INDEX idx_citizens_ktn ON public.citizens(ktn_number);
CREATE INDEX idx_citizens_is_online ON public.citizens(is_online);
CREATE INDEX idx_citizens_district ON public.citizens(district);
CREATE INDEX idx_citizens_role ON public.citizens(role);

-- -----------------------------------------------------------------------------
-- 1.2 Citizen Wallets - Virtual currency balance per citizen
-- -----------------------------------------------------------------------------
CREATE TABLE public.citizen_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID UNIQUE NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallets_citizen ON public.citizen_wallets(citizen_id);

-- -----------------------------------------------------------------------------
-- 1.3 Wallet Transactions - Immutable ledger of all currency changes
-- -----------------------------------------------------------------------------
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'reward', 'admin', 'refund')),
  amount INTEGER NOT NULL,
  previous_balance INTEGER NOT NULL,
  new_balance INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT DEFAULT NULL,          -- e.g. 'item', 'daily_login', 'mission'
  reference_id TEXT DEFAULT NULL,            -- ID of the referenced entity
  idempotency_key TEXT DEFAULT NULL,         -- Prevents duplicate transactions
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_citizen ON public.wallet_transactions(citizen_id);
CREATE INDEX idx_transactions_type ON public.wallet_transactions(type);
CREATE INDEX idx_transactions_created ON public.wallet_transactions(created_at DESC);
CREATE UNIQUE INDEX idx_transactions_idempotency
  ON public.wallet_transactions(idempotency_key)
  WHERE idempotency_key IS NOT NULL;


-- =============================================================================
-- SECTION 2: HOUSING SYSTEM
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 2.1 Housing Units - Available residences in the city
-- -----------------------------------------------------------------------------
CREATE TABLE public.housing_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL
    CHECK (type IN ('small_house', 'standard_house', 'apartment', 'public_housing', 'premium')),
  district TEXT NOT NULL,
  unit_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  position JSONB DEFAULT NULL,              -- { x, y } on the city map
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(district, unit_number)
);

CREATE INDEX idx_housing_status ON public.housing_units(status);
CREATE INDEX idx_housing_district ON public.housing_units(district);

-- Now add the FK from citizens.housing_id → housing_units.id
ALTER TABLE public.citizens
  ADD CONSTRAINT fk_citizens_housing
  FOREIGN KEY (housing_id) REFERENCES public.housing_units(id);

-- -----------------------------------------------------------------------------
-- 2.2 Housing Assignments - Tracks move-in / move-out history
-- -----------------------------------------------------------------------------
CREATE TABLE public.housing_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  housing_id UUID NOT NULL REFERENCES public.housing_units(id),
  moved_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  moved_out_at TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Only one active assignment per citizen
CREATE UNIQUE INDEX idx_housing_active_citizen
  ON public.housing_assignments(citizen_id)
  WHERE is_active = true;

-- Only one active tenant per housing unit
CREATE UNIQUE INDEX idx_housing_active_unit
  ON public.housing_assignments(housing_id)
  WHERE is_active = true;


-- =============================================================================
-- SECTION 3: MALL / INVENTORY SYSTEM
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3.1 Items - Catalogue of purchasable and default items
-- -----------------------------------------------------------------------------
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL
    CHECK (category IN ('tops', 'bottoms', 'shoes', 'hairstyles', 'accessories', 'skins', 'special')),
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  rarity TEXT NOT NULL DEFAULT 'common'
    CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  sprite_key TEXT NOT NULL,                 -- Asset key for the game renderer
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,-- Given to every new citizen for free
  is_limited BOOLEAN NOT NULL DEFAULT false,-- Limited-time availability
  available_from TIMESTAMPTZ DEFAULT NULL,
  available_until TIMESTAMPTZ DEFAULT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_available ON public.items(is_available);
CREATE INDEX idx_items_rarity ON public.items(rarity);

-- -----------------------------------------------------------------------------
-- 3.2 Citizen Inventory - Items owned by each citizen
-- -----------------------------------------------------------------------------
CREATE TABLE public.citizen_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id),
  is_equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(citizen_id, item_id)               -- Prevent duplicate items
);

CREATE INDEX idx_inventory_citizen ON public.citizen_inventory(citizen_id);
CREATE INDEX idx_inventory_equipped
  ON public.citizen_inventory(citizen_id, is_equipped)
  WHERE is_equipped = true;


-- =============================================================================
-- SECTION 4: CITY MANAGEMENT
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 4.1 City Population - Tracks official population (Instagram followers + manual)
-- -----------------------------------------------------------------------------
CREATE TABLE public.city_population (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN ('instagram_api', 'manual')),
  follower_count INTEGER NOT NULL DEFAULT 0,
  updated_by UUID DEFAULT NULL REFERENCES public.citizens(id),
  old_value INTEGER DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_population_recorded ON public.city_population(recorded_at DESC);

-- -----------------------------------------------------------------------------
-- 4.2 City Announcements - Official announcements from city staff
-- -----------------------------------------------------------------------------
CREATE TABLE public.city_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general', 'event', 'maintenance', 'government', 'emergency')),
  author_id UUID REFERENCES public.citizens(id),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_announcements_published
  ON public.city_announcements(is_published, published_at DESC);


-- =============================================================================
-- SECTION 5: SOCIAL / CHAT
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 5.1 Chat Messages - In-game chat channels
-- -----------------------------------------------------------------------------
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'global',
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'system', 'emote')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_channel ON public.chat_messages(channel, created_at DESC);
CREATE INDEX idx_chat_citizen ON public.chat_messages(citizen_id);


-- =============================================================================
-- SECTION 6: EVENTS SYSTEM
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 6.1 Events - City events and activities
-- -----------------------------------------------------------------------------
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_url TEXT DEFAULT NULL,
  location TEXT DEFAULT NULL,
  district TEXT DEFAULT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  rewards JSONB NOT NULL DEFAULT '{}',
  requirements JSONB NOT NULL DEFAULT '{}',
  max_participants INTEGER DEFAULT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.citizens(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_dates ON public.events(start_date, end_date);
CREATE INDEX idx_events_published ON public.events(is_published);

-- -----------------------------------------------------------------------------
-- 6.2 Event Participants - Registration and participation tracking
-- -----------------------------------------------------------------------------
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered'
    CHECK (status IN ('registered', 'participated', 'completed', 'cancelled')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, citizen_id)
);


-- =============================================================================
-- SECTION 7: REWARDS & MISSIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 7.1 Daily Login Rewards - Streak-based daily reward claims
-- -----------------------------------------------------------------------------
CREATE TABLE public.daily_login_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  reward_coins INTEGER NOT NULL,
  reward_item_id UUID DEFAULT NULL REFERENCES public.items(id),
  streak_count INTEGER NOT NULL DEFAULT 1,
  claimed_date DATE NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(citizen_id, claimed_date)          -- One claim per citizen per day
);

CREATE INDEX idx_login_rewards_citizen
  ON public.daily_login_rewards(citizen_id, claimed_date DESC);

-- -----------------------------------------------------------------------------
-- 7.2 Missions - Definitions for daily/weekly/special objectives
-- -----------------------------------------------------------------------------
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'special')),
  objective JSONB NOT NULL,                 -- { action, target_count, ... }
  reward_coins INTEGER NOT NULL DEFAULT 0,
  reward_xp INTEGER NOT NULL DEFAULT 0,
  reward_item_id UUID DEFAULT NULL REFERENCES public.items(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 7.3 Citizen Missions - Per-citizen progress on assigned missions
-- -----------------------------------------------------------------------------
CREATE TABLE public.citizen_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  progress INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'claimed', 'expired')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_citizen_missions ON public.citizen_missions(citizen_id, status);


-- =============================================================================
-- SECTION 8: VOTING SYSTEM
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 8.1 Votes - Polls and referendums
-- -----------------------------------------------------------------------------
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  options JSONB NOT NULL,                   -- [ { label, ... }, ... ]
  created_by UUID REFERENCES public.citizens(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 8.2 Vote Submissions - Individual citizen votes
-- -----------------------------------------------------------------------------
CREATE TABLE public.vote_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id UUID NOT NULL REFERENCES public.votes(id) ON DELETE CASCADE,
  citizen_id UUID NOT NULL REFERENCES public.citizens(id) ON DELETE CASCADE,
  selected_option INTEGER NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vote_id, citizen_id)               -- One vote per citizen per poll
);


-- =============================================================================
-- SECTION 9: ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on every table
ALTER TABLE public.citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_population ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_login_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_submissions ENABLE ROW LEVEL SECURITY;

-- ---- Citizens ----
-- Public profiles are readable by everyone
CREATE POLICY "Citizens are viewable by everyone"
  ON public.citizens FOR SELECT
  USING (true);

CREATE POLICY "Citizens can update own profile"
  ON public.citizens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Citizens can insert own profile"
  ON public.citizens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ---- Wallets ----
-- Only the owning citizen can view their wallet
CREATE POLICY "Users can view own wallet"
  ON public.citizen_wallets FOR SELECT
  USING (
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );
-- No direct INSERT/UPDATE from client - wallets are modified via SECURITY DEFINER functions

-- ---- Transactions ----
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT
  USING (
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );

-- ---- Housing Units ----
CREATE POLICY "Housing units are viewable by everyone"
  ON public.housing_units FOR SELECT
  USING (true);

-- ---- Housing Assignments ----
CREATE POLICY "Housing assignments are viewable by everyone"
  ON public.housing_assignments FOR SELECT
  USING (true);

-- ---- Items ----
CREATE POLICY "Items are viewable by everyone"
  ON public.items FOR SELECT
  USING (true);

-- ---- Inventory ----
CREATE POLICY "Users can view own inventory"
  ON public.citizen_inventory FOR SELECT
  USING (
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );

-- ---- City Population ----
CREATE POLICY "Population is viewable by everyone"
  ON public.city_population FOR SELECT
  USING (true);

-- ---- Announcements ----
-- Only published announcements are visible to normal users
CREATE POLICY "Published announcements viewable by all"
  ON public.city_announcements FOR SELECT
  USING (is_published = true);

-- ---- Chat Messages ----
CREATE POLICY "Authenticated can read chat"
  ON public.chat_messages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can send chat"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );

-- ---- Events ----
CREATE POLICY "Published events viewable by all"
  ON public.events FOR SELECT
  USING (is_published = true);

-- ---- Event Participants ----
CREATE POLICY "Users can view own participation"
  ON public.event_participants FOR SELECT
  USING (
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can register for events"
  ON public.event_participants FOR INSERT
  WITH CHECK (
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );

-- ---- Daily Login Rewards ----
CREATE POLICY "Users can view own login rewards"
  ON public.daily_login_rewards FOR SELECT
  USING (
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );

-- ---- Missions ----
CREATE POLICY "Active missions viewable by all"
  ON public.missions FOR SELECT
  USING (is_active = true);

-- ---- Citizen Missions ----
CREATE POLICY "Users can view own missions"
  ON public.citizen_missions FOR SELECT
  USING (
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );

-- ---- Votes ----
CREATE POLICY "Active votes viewable by all"
  ON public.votes FOR SELECT
  USING (is_active = true);

-- ---- Vote Submissions ----
CREATE POLICY "Users can view own votes"
  ON public.vote_submissions FOR SELECT
  USING (
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can submit votes"
  ON public.vote_submissions FOR INSERT
  WITH CHECK (
    citizen_id IN (SELECT id FROM public.citizens WHERE user_id = auth.uid())
  );


-- =============================================================================
-- SECTION 10: FUNCTIONS & TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 10.1 Auto-update updated_at timestamp on row modification
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.citizens
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.citizen_wallets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.city_announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 10.2 Auto-create wallet with welcome bonus when a new citizen registers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_citizen()
RETURNS TRIGGER AS $$
BEGIN
  -- Create wallet with 500 coin welcome bonus
  INSERT INTO public.citizen_wallets (citizen_id, balance, total_earned)
  VALUES (NEW.id, 500, 500);

  -- Record the welcome bonus transaction
  INSERT INTO public.wallet_transactions (
    citizen_id, type, amount, previous_balance, new_balance,
    description, idempotency_key
  )
  VALUES (
    NEW.id, 'reward', 500, 0, 500,
    'Welcome bonus - New citizen arrival',
    'welcome_' || NEW.id::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_citizen_created AFTER INSERT ON public.citizens
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_citizen();

-- -----------------------------------------------------------------------------
-- 10.3 Purchase item - Atomic mall purchase with idempotency protection
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purchase_item(
  p_citizen_id UUID,
  p_item_id UUID,
  p_idempotency_key TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_wallet RECORD;
  v_new_balance INTEGER;
BEGIN
  -- Idempotency guard: reject duplicate purchase requests
  IF EXISTS (
    SELECT 1 FROM public.wallet_transactions
    WHERE idempotency_key = p_idempotency_key
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Duplicate purchase request');
  END IF;

  -- Fetch and validate the item
  SELECT * INTO v_item
  FROM public.items
  WHERE id = p_item_id AND is_available = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item not available');
  END IF;

  -- Check if citizen already owns this item
  IF EXISTS (
    SELECT 1 FROM public.citizen_inventory
    WHERE citizen_id = p_citizen_id AND item_id = p_item_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Item already owned');
  END IF;

  -- Lock the wallet row to prevent race conditions
  SELECT * INTO v_wallet
  FROM public.citizen_wallets
  WHERE citizen_id = p_citizen_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;

  -- Verify sufficient balance
  IF v_wallet.balance < v_item.price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  v_new_balance := v_wallet.balance - v_item.price;

  -- Debit the wallet
  UPDATE public.citizen_wallets SET
    balance = v_new_balance,
    total_spent = total_spent + v_item.price
  WHERE citizen_id = p_citizen_id;

  -- Record the spend transaction
  INSERT INTO public.wallet_transactions (
    citizen_id, type, amount, previous_balance, new_balance,
    description, reference_type, reference_id, idempotency_key
  )
  VALUES (
    p_citizen_id, 'spend', v_item.price, v_wallet.balance, v_new_balance,
    'Purchased: ' || v_item.name, 'item', p_item_id::text, p_idempotency_key
  );

  -- Add item to citizen inventory
  INSERT INTO public.citizen_inventory (citizen_id, item_id)
  VALUES (p_citizen_id, p_item_id);

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', v_new_balance,
    'item_name', v_item.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 10.4 Claim daily login reward - Streak-based with 7-day cycle
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_daily_reward(
  p_citizen_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_today DATE;
  v_yesterday DATE;
  v_last_claim RECORD;
  v_streak INTEGER;
  v_day_number INTEGER;
  v_reward_coins INTEGER;
  v_wallet RECORD;
  v_new_balance INTEGER;
BEGIN
  -- Use Asia/Jakarta timezone (WIB, UTC+7) for date calculations
  v_today := (now() AT TIME ZONE 'Asia/Jakarta')::date;
  v_yesterday := v_today - 1;

  -- Prevent double claims on the same day
  IF EXISTS (
    SELECT 1 FROM public.daily_login_rewards
    WHERE citizen_id = p_citizen_id AND claimed_date = v_today
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed today');
  END IF;

  -- Get the most recent claim to calculate streak
  SELECT * INTO v_last_claim
  FROM public.daily_login_rewards
  WHERE citizen_id = p_citizen_id
  ORDER BY claimed_date DESC
  LIMIT 1;

  -- Determine streak: continues if last claim was yesterday, resets otherwise
  IF v_last_claim IS NULL OR v_last_claim.claimed_date < v_yesterday THEN
    v_streak := 1;
  ELSE
    v_streak := v_last_claim.streak_count + 1;
  END IF;

  -- Day number cycles 1-7
  v_day_number := ((v_streak - 1) % 7) + 1;

  -- Reward schedule (escalating with streak)
  v_reward_coins := CASE v_day_number
    WHEN 1 THEN 50
    WHEN 2 THEN 75
    WHEN 3 THEN 100
    WHEN 4 THEN 125
    WHEN 5 THEN 150
    WHEN 6 THEN 200
    WHEN 7 THEN 500   -- Big bonus on day 7
  END;

  -- Lock wallet for atomic update
  SELECT * INTO v_wallet
  FROM public.citizen_wallets
  WHERE citizen_id = p_citizen_id
  FOR UPDATE;

  v_new_balance := v_wallet.balance + v_reward_coins;

  -- Credit the wallet
  UPDATE public.citizen_wallets SET
    balance = v_new_balance,
    total_earned = total_earned + v_reward_coins
  WHERE citizen_id = p_citizen_id;

  -- Record the reward transaction
  INSERT INTO public.wallet_transactions (
    citizen_id, type, amount, previous_balance, new_balance,
    description, reference_type, idempotency_key
  )
  VALUES (
    p_citizen_id, 'reward', v_reward_coins, v_wallet.balance, v_new_balance,
    'Daily login reward - Day ' || v_day_number, 'daily_login',
    'daily_' || p_citizen_id::text || '_' || v_today::text
  );

  -- Record the claim
  INSERT INTO public.daily_login_rewards (
    citizen_id, day_number, reward_coins, streak_count, claimed_date
  )
  VALUES (p_citizen_id, v_day_number, v_reward_coins, v_streak, v_today);

  RETURN jsonb_build_object(
    'success', true,
    'day_number', v_day_number,
    'reward_coins', v_reward_coins,
    'streak', v_streak,
    'new_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 10.5 Get city statistics - Aggregate population and online counts
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_city_stats()
RETURNS JSONB AS $$
DECLARE
  v_population INTEGER;
  v_registered INTEGER;
  v_online INTEGER;
BEGIN
  -- Official population from latest record (Instagram or manual)
  SELECT follower_count INTO v_population
  FROM public.city_population
  ORDER BY recorded_at DESC
  LIMIT 1;

  -- Count of citizens who completed onboarding
  SELECT COUNT(*) INTO v_registered
  FROM public.citizens
  WHERE onboarding_completed = true;

  -- Currently online citizens
  SELECT COUNT(*) INTO v_online
  FROM public.citizens
  WHERE is_online = true;

  RETURN jsonb_build_object(
    'official_population', COALESCE(v_population, 0),
    'registered_citizens', v_registered,
    'online_now', v_online
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 10.6 Assign housing - Atomic housing assignment with locking
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.assign_housing(
  p_citizen_id UUID,
  p_housing_type TEXT DEFAULT 'public_housing'
)
RETURNS JSONB AS $$
DECLARE
  v_housing RECORD;
BEGIN
  -- Check if citizen already has active housing
  IF EXISTS (
    SELECT 1 FROM public.housing_assignments
    WHERE citizen_id = p_citizen_id AND is_active = true
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Citizen already has housing');
  END IF;

  -- Find available housing of the requested type (random selection, skip locked)
  SELECT * INTO v_housing
  FROM public.housing_units
  WHERE status = 'available' AND type = p_housing_type
  ORDER BY random()
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- Fallback: try any available housing if preferred type is full
  IF NOT FOUND THEN
    SELECT * INTO v_housing
    FROM public.housing_units
    WHERE status = 'available'
    ORDER BY random()
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No housing available');
  END IF;

  -- Mark unit as occupied
  UPDATE public.housing_units
  SET status = 'occupied'
  WHERE id = v_housing.id;

  -- Create the assignment record
  INSERT INTO public.housing_assignments (citizen_id, housing_id)
  VALUES (p_citizen_id, v_housing.id);

  -- Update citizen's housing reference and district
  UPDATE public.citizens
  SET housing_id = v_housing.id,
      district = v_housing.district
  WHERE id = p_citizen_id;

  RETURN jsonb_build_object(
    'success', true,
    'housing_id', v_housing.id,
    'housing_name', v_housing.name,
    'housing_type', v_housing.type,
    'district', v_housing.district,
    'unit_number', v_housing.unit_number
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


COMMIT;
