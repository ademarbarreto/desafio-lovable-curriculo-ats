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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      certifications: {
        Row: {
          created_at: string
          data_emissao: string
          data_validade: string
          emissor: string
          id: string
          nome: string
          ordem: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_emissao?: string
          data_validade?: string
          emissor?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_emissao?: string
          data_validade?: string
          emissor?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          created_at: string
          curso: string
          data_fim: string
          data_inicio: string
          id: string
          instituicao: string
          ordem: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          curso?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          instituicao?: string
          ordem?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          curso?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          instituicao?: string
          ordem?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experiences: {
        Row: {
          cargo: string
          created_at: string
          data_fim: string
          data_inicio: string
          descricao: string
          empresa: string
          id: string
          ordem: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cargo?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string
          empresa?: string
          id?: string
          ordem?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cargo?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          descricao?: string
          empresa?: string
          id?: string
          ordem?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          cargo: string
          created_at: string
          descricao: string
          empresa: string
          id: string
          idioma: Database["public"]["Enums"]["vaga_idioma"]
          status: Database["public"]["Enums"]["candidatura_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cargo?: string
          created_at?: string
          descricao?: string
          empresa?: string
          id?: string
          idioma?: Database["public"]["Enums"]["vaga_idioma"]
          status?: Database["public"]["Enums"]["candidatura_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cargo?: string
          created_at?: string
          descricao?: string
          empresa?: string
          id?: string
          idioma?: Database["public"]["Enums"]["vaga_idioma"]
          status?: Database["public"]["Enums"]["candidatura_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          curriculo_adaptado: Json
          evidencias: Json
          gerado_por_ia: boolean
          habilidades_compativeis: string[]
          id: string
          job_posting_id: string
          lacunas_detalhadas: Json
          lacunas_reais: string[]
          observacoes: string[]
          pontuacao: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          curriculo_adaptado?: Json
          evidencias?: Json
          gerado_por_ia?: boolean
          habilidades_compativeis?: string[]
          id?: string
          job_posting_id: string
          lacunas_detalhadas?: Json
          lacunas_reais?: string[]
          observacoes?: string[]
          pontuacao?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          curriculo_adaptado?: Json
          evidencias?: Json
          gerado_por_ia?: boolean
          habilidades_compativeis?: string[]
          id?: string
          job_posting_id?: string
          lacunas_detalhadas?: Json
          lacunas_reais?: string[]
          observacoes?: string[]
          pontuacao?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          github_url: string
          id: string
          linkedin_url: string
          localizacao: string
          nome_completo: string
          portfolio_url: string
          resumo: string
          telefone: string
          titulo_profissional: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string
          github_url?: string
          id: string
          linkedin_url?: string
          localizacao?: string
          nome_completo?: string
          portfolio_url?: string
          resumo?: string
          telefone?: string
          titulo_profissional?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          github_url?: string
          id?: string
          linkedin_url?: string
          localizacao?: string
          nome_completo?: string
          portfolio_url?: string
          resumo?: string
          telefone?: string
          titulo_profissional?: string
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          categoria: Database["public"]["Enums"]["skill_categoria"]
          created_at: string
          id: string
          nome: string
          ordem: number
          updated_at: string
          user_id: string
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["skill_categoria"]
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["skill_categoria"]
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      candidatura_status:
        | "rascunho"
        | "aplicado"
        | "entrevista"
        | "rejeitado"
        | "aceito"
      skill_categoria: "técnica" | "ferramenta" | "soft skill"
      vaga_idioma: "pt" | "en"
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
      candidatura_status: [
        "rascunho",
        "aplicado",
        "entrevista",
        "rejeitado",
        "aceito",
      ],
      skill_categoria: ["técnica", "ferramenta", "soft skill"],
      vaga_idioma: ["pt", "en"],
    },
  },
} as const
