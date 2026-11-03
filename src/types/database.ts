// ============================================================
// NETIZENCITY - Database Type Definitions
// ============================================================

export type Database = {
  public: {
    Tables: {
      citizens: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string
          ktn_number: string
          avatar_config: Record<string, unknown>
          level: number
          xp: number
          job: string | null
          housing_id: string | null
          district: string | null
          biography: string | null
          is_online: boolean
          last_location: Record<string, unknown> | null
          role: 'citizen' | 'moderator' | 'city_staff' | 'admin' | 'mayor'
          onboarding_completed: boolean
          joined_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name: string
          ktn_number: string
          avatar_config?: Record<string, unknown>
          level?: number
          xp?: number
          job?: string | null
          housing_id?: string | null
          district?: string | null
          biography?: string | null
          is_online?: boolean
          last_location?: Record<string, unknown> | null
          role?: 'citizen' | 'moderator' | 'city_staff' | 'admin' | 'mayor'
          onboarding_completed?: boolean
          joined_at?: string
          updated_at?: string
        }
        Update: Partial<
          Database['public']['Tables']['citizens']['Insert']
        >
      }
      citizen_wallets: {
        Row: {
          id: string
          citizen_id: string
          balance: number
          total_earned: number
          total_spent: number
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['citizen_wallets']['Row'],
          'id' | 'updated_at'
        >
        Update: Partial<
          Database['public']['Tables']['citizen_wallets']['Insert']
        >
      }
      wallet_transactions: {
        Row: {
          id: string
          citizen_id: string
          type: 'earn' | 'spend' | 'reward' | 'admin'
          amount: number
          previous_balance: number
          new_balance: number
          description: string
          reference_type: string | null
          reference_id: string | null
          idempotency_key: string | null
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['wallet_transactions']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<
          Database['public']['Tables']['wallet_transactions']['Insert']
        >
      }
      housing_units: {
        Row: {
          id: string
          name: string
          type:
            | 'small_house'
            | 'standard_house'
            | 'apartment'
            | 'public_housing'
            | 'premium'
          district: string
          unit_number: string
          capacity: number
          occupied_by: string | null
          status: 'available' | 'occupied' | 'reserved' | 'maintenance'
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['housing_units']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<
          Database['public']['Tables']['housing_units']['Insert']
        >
      }
      items: {
        Row: {
          id: string
          name: string
          description: string
          category:
            | 'tops'
            | 'bottoms'
            | 'shoes'
            | 'hairstyles'
            | 'accessories'
            | 'skins'
            | 'special'
          price: number
          rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
          sprite_key: string
          is_available: boolean
          is_limited: boolean
          available_from: string | null
          available_until: string | null
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['items']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<
          Database['public']['Tables']['items']['Insert']
        >
      }
      citizen_inventory: {
        Row: {
          id: string
          citizen_id: string
          item_id: string
          is_equipped: boolean
          acquired_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['citizen_inventory']['Row'],
          'id' | 'acquired_at'
        >
        Update: Partial<
          Database['public']['Tables']['citizen_inventory']['Insert']
        >
      }
      city_population: {
        Row: {
          id: string
          source: 'instagram_api' | 'manual'
          follower_count: number
          updated_by: string | null
          old_value: number | null
          reason: string | null
          recorded_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['city_population']['Row'],
          'id' | 'recorded_at'
        >
        Update: Partial<
          Database['public']['Tables']['city_population']['Insert']
        >
      }
    }
  }
}

/** Helper type to extract a table row */
export type TableRow<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

/** Helper type to extract a table insert */
export type TableInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

/** Helper type to extract a table update */
export type TableUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
