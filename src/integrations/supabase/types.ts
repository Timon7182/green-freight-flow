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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          mime_type: string | null
          request_id: string
          uploaded_by: string | null
          visible_to_client: boolean | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          mime_type?: string | null
          request_id: string
          uploaded_by?: string | null
          visible_to_client?: boolean | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          mime_type?: string | null
          request_id?: string
          uploaded_by?: string | null
          visible_to_client?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "shipment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string | null
          file_name: string | null
          file_path: string | null
          id: string
          is_read: boolean | null
          message: string | null
          request_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          request_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "shipment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          id: string
          name_ru: string
          sort_order: number | null
        }
        Insert: {
          code: string
          id?: string
          name_ru: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          id?: string
          name_ru?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      destination_cities: {
        Row: {
          country_id: string
          id: string
          is_consolidated_hub: boolean | null
          name_ru: string
        }
        Insert: {
          country_id: string
          id?: string
          is_consolidated_hub?: boolean | null
          name_ru: string
        }
        Update: {
          country_id?: string
          id?: string
          is_consolidated_hub?: boolean | null
          name_ru?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_cities_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          request_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          request_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          request_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "shipment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          comments: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          domestic_delivery: number | null
          estimated_days: number | null
          freight: number | null
          id: string
          other_costs: number | null
          pickup_china: number | null
          request_id: string
          total_amount: number
          warehouse_consolidation: number | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          domestic_delivery?: number | null
          estimated_days?: number | null
          freight?: number | null
          id?: string
          other_costs?: number | null
          pickup_china?: number | null
          request_id: string
          total_amount: number
          warehouse_consolidation?: number | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          domestic_delivery?: number | null
          estimated_days?: number | null
          freight?: number | null
          id?: string
          other_costs?: number | null
          pickup_china?: number | null
          request_id?: string
          total_amount?: number
          warehouse_consolidation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "shipment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_requests: {
        Row: {
          agreed_offer: boolean | null
          agreed_privacy: boolean | null
          agreed_terms: boolean | null
          assigned_manager_id: string | null
          cargo_name: string | null
          clarify_with_supplier: boolean | null
          client_id: string
          created_at: string | null
          delivery_status: Database["public"]["Enums"]["delivery_status"] | null
          destination_city_custom: string | null
          destination_city_id: string | null
          destination_comment: string | null
          destination_country_id: string | null
          destination_station: string | null
          hs_code: string | null
          id: string
          material: string | null
          pickup_address: string | null
          pickup_city: string | null
          pickup_contact_name: string | null
          pickup_contact_phone: string | null
          pickup_contact_wechat: string | null
          pickup_province: string | null
          places_count: number | null
          purpose: string | null
          request_number: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          source_warehouse_id: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          supplier_comment: string | null
          supplier_contact: string | null
          supplier_phone: string | null
          supplier_wechat: string | null
          updated_at: string | null
          volume_m3: number | null
          weight_gross: number | null
          weight_net: number | null
        }
        Insert: {
          agreed_offer?: boolean | null
          agreed_privacy?: boolean | null
          agreed_terms?: boolean | null
          assigned_manager_id?: string | null
          cargo_name?: string | null
          clarify_with_supplier?: boolean | null
          client_id: string
          created_at?: string | null
          delivery_status?:
            | Database["public"]["Enums"]["delivery_status"]
            | null
          destination_city_custom?: string | null
          destination_city_id?: string | null
          destination_comment?: string | null
          destination_country_id?: string | null
          destination_station?: string | null
          hs_code?: string | null
          id?: string
          material?: string | null
          pickup_address?: string | null
          pickup_city?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_contact_wechat?: string | null
          pickup_province?: string | null
          places_count?: number | null
          purpose?: string | null
          request_number?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          source_warehouse_id?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          supplier_comment?: string | null
          supplier_contact?: string | null
          supplier_phone?: string | null
          supplier_wechat?: string | null
          updated_at?: string | null
          volume_m3?: number | null
          weight_gross?: number | null
          weight_net?: number | null
        }
        Update: {
          agreed_offer?: boolean | null
          agreed_privacy?: boolean | null
          agreed_terms?: boolean | null
          assigned_manager_id?: string | null
          cargo_name?: string | null
          clarify_with_supplier?: boolean | null
          client_id?: string
          created_at?: string | null
          delivery_status?:
            | Database["public"]["Enums"]["delivery_status"]
            | null
          destination_city_custom?: string | null
          destination_city_id?: string | null
          destination_comment?: string | null
          destination_country_id?: string | null
          destination_station?: string | null
          hs_code?: string | null
          id?: string
          material?: string | null
          pickup_address?: string | null
          pickup_city?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_contact_wechat?: string | null
          pickup_province?: string | null
          places_count?: number | null
          purpose?: string | null
          request_number?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          source_warehouse_id?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          supplier_comment?: string | null
          supplier_contact?: string | null
          supplier_phone?: string | null
          supplier_wechat?: string | null
          updated_at?: string | null
          volume_m3?: number | null
          weight_gross?: number | null
          weight_net?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_requests_destination_city_id_fkey"
            columns: ["destination_city_id"]
            isOneToOne: false
            referencedRelation: "destination_cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_requests_destination_country_id_fkey"
            columns: ["destination_country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_requests_source_warehouse_id_fkey"
            columns: ["source_warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          comment: string | null
          created_at: string | null
          created_by: string | null
          id: string
          request_id: string
          status: Database["public"]["Enums"]["delivery_status"]
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          request_id: string
          status: Database["public"]["Enums"]["delivery_status"]
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "shipment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          city: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          full_address: string
          id: string
          is_active: boolean | null
          name: string
          working_hours: string | null
        }
        Insert: {
          city: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          full_address: string
          id?: string
          is_active?: boolean | null
          name: string
          working_hours?: string | null
        }
        Update: {
          city?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          full_address?: string
          id?: string
          is_active?: boolean | null
          name?: string
          working_hours?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_profile_for_user: {
        Args: { _email: string; _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "client" | "manager" | "admin"
      delivery_status:
        | "picked_up"
        | "arrived_china_warehouse"
        | "shipped"
        | "at_border"
        | "customs_cleared"
        | "in_delivery"
        | "delivered"
      request_status:
        | "draft"
        | "submitted"
        | "calculating"
        | "quoted"
        | "confirmed"
        | "awaiting_payment"
        | "paid"
        | "in_progress"
        | "completed"
        | "cancelled"
      service_type:
        | "consolidated_pickup"
        | "consolidated_warehouse"
        | "container_fcl"
        | "truck_ftl"
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
  public: {
    Enums: {
      app_role: ["client", "manager", "admin"],
      delivery_status: [
        "picked_up",
        "arrived_china_warehouse",
        "shipped",
        "at_border",
        "customs_cleared",
        "in_delivery",
        "delivered",
      ],
      request_status: [
        "draft",
        "submitted",
        "calculating",
        "quoted",
        "confirmed",
        "awaiting_payment",
        "paid",
        "in_progress",
        "completed",
        "cancelled",
      ],
      service_type: [
        "consolidated_pickup",
        "consolidated_warehouse",
        "container_fcl",
        "truck_ftl",
      ],
    },
  },
} as const
