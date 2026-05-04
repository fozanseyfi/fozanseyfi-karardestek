export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bid_prices: {
        Row: {
          comparison_id: string
          firm_id: string
          id: string
          item_id: string
          price: number | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          comparison_id: string
          firm_id: string
          id?: string
          item_id: string
          price?: number | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          comparison_id?: string
          firm_id?: string
          id?: string
          item_id?: string
          price?: number | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "bid_prices_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_prices_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_prices_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "comparison_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bid_prices_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_firms: {
        Row: {
          bid_pdf_url: string | null
          comparison_id: string
          created_at: string
          firm_id: string
          id: string
          notes: string | null
        }
        Insert: {
          bid_pdf_url?: string | null
          comparison_id: string
          created_at?: string
          firm_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          bid_pdf_url?: string | null
          comparison_id?: string
          created_at?: string
          firm_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparison_firms_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparison_firms_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_items: {
        Row: {
          category: Database["public"]["Enums"]["item_category"]
          comparison_id: string
          created_at: string
          id: string
          name: string
          position: number
          qty: number
          target_price: number | null
          unit: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["item_category"]
          comparison_id: string
          created_at?: string
          id?: string
          name: string
          position?: number
          qty?: number
          target_price?: number | null
          unit?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["item_category"]
          comparison_id?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          qty?: number
          target_price?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparison_items_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_shares: {
        Row: {
          comparison_id: string
          created_at: string
          id: string
          permission: Database["public"]["Enums"]["share_permission"]
          shared_by: string
          shared_with: string
        }
        Insert: {
          comparison_id: string
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["share_permission"]
          shared_by: string
          shared_with: string
        }
        Update: {
          comparison_id?: string
          created_at?: string
          id?: string
          permission?: Database["public"]["Enums"]["share_permission"]
          shared_by?: string
          shared_with?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparison_shares_comparison_id_fkey"
            columns: ["comparison_id"]
            isOneToOne: false
            referencedRelation: "comparisons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparison_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparison_shares_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comparisons: {
        Row: {
          budget: number | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          decided_firm_id: string | null
          decision_date: string | null
          id: string
          name: string
          notes: string | null
          owner_id: string
          project_id: string | null
          status: Database["public"]["Enums"]["comparison_status"]
          type: Database["public"]["Enums"]["comparison_type"]
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          decided_firm_id?: string | null
          decision_date?: string | null
          id?: string
          name: string
          notes?: string | null
          owner_id: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["comparison_status"]
          type: Database["public"]["Enums"]["comparison_type"]
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          decided_firm_id?: string | null
          decision_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          owner_id?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["comparison_status"]
          type?: Database["public"]["Enums"]["comparison_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparisons_decided_firm_fk"
            columns: ["decided_firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparisons_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comparisons_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "firms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: Database["public"]["Enums"]["template_category"]
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_system: boolean
          items: Json
          name: string
          type: Database["public"]["Enums"]["comparison_type"]
        }
        Insert: {
          category?: Database["public"]["Enums"]["template_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          items?: Json
          name: string
          type: Database["public"]["Enums"]["comparison_type"]
        }
        Update: {
          category?: Database["public"]["Enums"]["template_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          items?: Json
          name?: string
          type?: Database["public"]["Enums"]["comparison_type"]
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
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
      can_edit_comparison: { Args: { c_id: string }; Returns: boolean }
      can_view_comparison: { Args: { c_id: string }; Returns: boolean }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      comparison_status: "draft" | "in_review" | "decided" | "archived"
      comparison_type:
        | "Taşeron"
        | "Malzeme"
        | "Hizmet"
        | "İşçilik"
        | "Ekipman"
        | "Diğer"
      currency_code: "TRY" | "USD" | "EUR"
      item_category:
        | "Mekanik"
        | "Elektrik"
        | "İnşaat"
        | "İş Makinaları"
        | "Malzeme"
        | "Hizmet"
        | "Harita"
        | "Diğer"
      notification_type: "share" | "decision" | "invite" | "system"
      share_permission: "view" | "edit"
      template_category: "GES" | "RES" | "Genel"
      user_role: "admin" | "user" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      comparison_status: ["draft", "in_review", "decided", "archived"],
      comparison_type: [
        "Taşeron",
        "Malzeme",
        "Hizmet",
        "İşçilik",
        "Ekipman",
        "Diğer",
      ],
      currency_code: ["TRY", "USD", "EUR"],
      item_category: [
        "Mekanik",
        "Elektrik",
        "İnşaat",
        "İş Makinaları",
        "Malzeme",
        "Hizmet",
        "Harita",
        "Diğer",
      ],
      notification_type: ["share", "decision", "invite", "system"],
      share_permission: ["view", "edit"],
      template_category: ["GES", "RES", "Genel"],
      user_role: ["admin", "user", "viewer"],
    },
  },
} as const