export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      topics: {
        Row: {
          id: string
          user_id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          title: string
          slug: string
          read_time: number
          content: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          topic_id: string
          title: string
          slug: string
          read_time?: number
          content?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          title?: string
          slug?: string
          read_time?: number
          content?: string | null
          updated_at?: string
          created_at?: string
        }
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
  }
}
