/**
 * Tipos generados de tu base de datos Supabase.
 *
 * Regeneralos cada vez que cambie el esquema:
 *
 *   npm run db:types
 *   # (= supabase gen types typescript --local > src/lib/supabase/database.types.ts)
 *
 * Este archivo es un placeholder para que el proyecto tipe-checkee desde el inicio.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
