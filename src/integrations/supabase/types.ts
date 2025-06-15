export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bounties: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          entry_price: number
          id: string
          mystery_prize: string | null
          start_time: string | null
          title: string
          winner_wallet: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          entry_price: number
          id?: string
          mystery_prize?: string | null
          start_time?: string | null
          title: string
          winner_wallet?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          entry_price?: number
          id?: string
          mystery_prize?: string | null
          start_time?: string | null
          title?: string
          winner_wallet?: string | null
        }
        Relationships: []
      }
      bounty_entries: {
        Row: {
          bounty_id: string | null
          created_at: string
          id: string
          paid: boolean | null
          tx_hash: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          bounty_id?: string | null
          created_at?: string
          id?: string
          paid?: boolean | null
          tx_hash?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          bounty_id?: string | null
          created_at?: string
          id?: string
          paid?: boolean | null
          tx_hash?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bounty_entries_bounty_id_fkey"
            columns: ["bounty_id"]
            isOneToOne: false
            referencedRelation: "bounties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bounty_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          base_balance: number | null
          created_at: string | null
          id: string
          updated_at: string | null
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          base_balance?: number | null
          created_at?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          base_balance?: number | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          amount: number
          base_price_usd: number
          created_at: string | null
          id: string
          price_per_token: number
          token_address: string
          token_symbol: string
          total_base: number
          trade_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          base_price_usd: number
          created_at?: string | null
          id?: string
          price_per_token: number
          token_address: string
          token_symbol: string
          total_base: number
          trade_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          base_price_usd?: number
          created_at?: string | null
          id?: string
          price_per_token?: number
          token_address?: string
          token_symbol?: string
          total_base?: number
          trade_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_holdings: {
        Row: {
          amount: number
          average_buy_price: number
          created_at: string | null
          id: string
          token_address: string
          token_name: string
          token_symbol: string
          total_invested: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number
          average_buy_price?: number
          created_at?: string | null
          id?: string
          token_address: string
          token_name: string
          token_symbol: string
          total_invested?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          average_buy_price?: number
          created_at?: string | null
          id?: string
          token_address?: string
          token_name?: string
          token_symbol?: string
          total_invested?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
