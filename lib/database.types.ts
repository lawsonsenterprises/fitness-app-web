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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_email: string | null
          actor_id: string | null
          actor_ip: unknown
          actor_type: string
          actor_user_agent: string | null
          created_at: string
          description: string | null
          error_code: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          request_id: string | null
          resource_id: string | null
          resource_name: string | null
          resource_type: string | null
          session_id: string | null
          severity: Database["public"]["Enums"]["audit_severity"]
          success: boolean | null
          target_user_email: string | null
          target_user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: unknown
          actor_type?: string
          actor_user_agent?: string | null
          created_at?: string
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          request_id?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          session_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"]
          success?: boolean | null
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_email?: string | null
          actor_id?: string | null
          actor_ip?: unknown
          actor_type?: string
          actor_user_agent?: string | null
          created_at?: string
          description?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          request_id?: string | null
          resource_id?: string | null
          resource_name?: string | null
          resource_type?: string | null
          session_id?: string | null
          severity?: Database["public"]["Enums"]["audit_severity"]
          success?: boolean | null
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_marker_definitions: {
        Row: {
          category: string
          code: string
          created_at: string | null
          default_unit: string
          description: string | null
          id: string
          label: string
          reference_high: number | null
          reference_low: number | null
          sort_order: number | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          default_unit: string
          description?: string | null
          id?: string
          label: string
          reference_high?: number | null
          reference_low?: number | null
          sort_order?: number | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          default_unit?: string
          description?: string | null
          id?: string
          label?: string
          reference_high?: number | null
          reference_low?: number | null
          sort_order?: number | null
        }
        Relationships: []
      }
      blood_markers: {
        Row: {
          code: string | null
          created_at: string | null
          flag: string | null
          id: string
          label: string
          notes: string | null
          panel_id: string
          reference_high: number | null
          reference_low: number | null
          sort_order: number | null
          unit: string
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          flag?: string | null
          id?: string
          label: string
          notes?: string | null
          panel_id: string
          reference_high?: number | null
          reference_low?: number | null
          sort_order?: number | null
          unit: string
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          code?: string | null
          created_at?: string | null
          flag?: string | null
          id?: string
          label?: string
          notes?: string | null
          panel_id?: string
          reference_high?: number | null
          reference_low?: number | null
          sort_order?: number | null
          unit?: string
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "blood_markers_panel_id_fkey"
            columns: ["panel_id"]
            isOneToOne: false
            referencedRelation: "blood_panels"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_markers_v2: {
        Row: {
          created_at: string | null
          id: string
          marker_code: string
          ref_high: number | null
          ref_low: number | null
          ref_text: string | null
          status: string | null
          test_id: string
          unit: string | null
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          marker_code: string
          ref_high?: number | null
          ref_low?: number | null
          ref_text?: string | null
          status?: string | null
          test_id: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          marker_code?: string
          ref_high?: number | null
          ref_low?: number | null
          ref_text?: string | null
          status?: string | null
          test_id?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "blood_markers_v2_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "blood_tests_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_panels: {
        Row: {
          attachment_added_at: string | null
          attachment_file_name: string | null
          attachment_file_size_bytes: number | null
          attachment_original_name: string | null
          auto_import_last_attempt_at: string | null
          auto_import_last_status: string | null
          auto_import_notes: string | null
          auto_import_supported: boolean
          created_at: string | null
          date: string
          device_id: string | null
          fasted: boolean | null
          fasted_hours: number | null
          has_attachment: boolean | null
          id: string
          lab_name: string | null
          location: string | null
          notes: string | null
          source: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachment_added_at?: string | null
          attachment_file_name?: string | null
          attachment_file_size_bytes?: number | null
          attachment_original_name?: string | null
          auto_import_last_attempt_at?: string | null
          auto_import_last_status?: string | null
          auto_import_notes?: string | null
          auto_import_supported?: boolean
          created_at?: string | null
          date: string
          device_id?: string | null
          fasted?: boolean | null
          fasted_hours?: number | null
          has_attachment?: boolean | null
          id?: string
          lab_name?: string | null
          location?: string | null
          notes?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachment_added_at?: string | null
          attachment_file_name?: string | null
          attachment_file_size_bytes?: number | null
          attachment_original_name?: string | null
          auto_import_last_attempt_at?: string | null
          auto_import_last_status?: string | null
          auto_import_notes?: string | null
          auto_import_supported?: boolean
          created_at?: string | null
          date?: string
          device_id?: string | null
          fasted?: boolean | null
          fasted_hours?: number | null
          has_attachment?: boolean | null
          id?: string
          lab_name?: string | null
          location?: string | null
          notes?: string | null
          source?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blood_tests_v2: {
        Row: {
          created_at: string | null
          fasted: boolean | null
          fasted_hours: number | null
          id: string
          lab_provider: string
          notes: string | null
          order_reference: string | null
          pdf_file_name: string | null
          pdf_file_size_bytes: number | null
          pdf_storage_path: string | null
          report_date: string | null
          sample_date: string
          shared_id: string | null
          synced_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fasted?: boolean | null
          fasted_hours?: number | null
          id?: string
          lab_provider?: string
          notes?: string | null
          order_reference?: string | null
          pdf_file_name?: string | null
          pdf_file_size_bytes?: number | null
          pdf_storage_path?: string | null
          report_date?: string | null
          sample_date: string
          shared_id?: string | null
          synced_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fasted?: boolean | null
          fasted_hours?: number | null
          id?: string
          lab_provider?: string
          notes?: string | null
          order_reference?: string | null
          pdf_file_name?: string | null
          pdf_file_size_bytes?: number | null
          pdf_storage_path?: string | null
          report_date?: string | null
          sample_date?: string
          shared_id?: string | null
          synced_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bug_reports: {
        Row: {
          app_version: string
          build_number: string
          category: string
          created_at: string
          details: string
          device_model: string
          email: string | null
          extra_json: Json | null
          has_screenshot: boolean
          id: string
          os_version: string
          screen_context: string
          screenshot_path: string | null
          severity: string
          status: string
          title: string
          trigger: string
          user_id: string | null
        }
        Insert: {
          app_version: string
          build_number: string
          category: string
          created_at?: string
          details: string
          device_model: string
          email?: string | null
          extra_json?: Json | null
          has_screenshot?: boolean
          id: string
          os_version: string
          screen_context: string
          screenshot_path?: string | null
          severity?: string
          status?: string
          title: string
          trigger: string
          user_id?: string | null
        }
        Update: {
          app_version?: string
          build_number?: string
          category?: string
          created_at?: string
          details?: string
          device_model?: string
          email?: string | null
          extra_json?: Json | null
          has_screenshot?: boolean
          id?: string
          os_version?: string
          screen_context?: string
          screenshot_path?: string | null
          severity?: string
          status?: string
          title?: string
          trigger?: string
          user_id?: string | null
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          check_in_type: string
          coach_feedback: string | null
          coach_rating: number | null
          created_at: string | null
          date: string
          deleted_at: string | null
          flag_reason: string | null
          follow_up_completed_at: string | null
          id: string
          is_flagged: boolean | null
          muscle_group_trained: string | null
          notes: string | null
          photo_data: string | null
          requires_follow_up: boolean | null
          review_status:
            | Database["public"]["Enums"]["check_in_review_status"]
            | null
          reviewed_at: string | null
          reviewed_by: string | null
          sent_at: string | null
          session_quality: string | null
          sleep_hours: number | null
          sleep_quality: string | null
          snooze_count: number | null
          snoozed_at: string | null
          snoozed_until: string | null
          steps_average: number | null
          steps_total: number | null
          updated_at: string | null
          user_id: string
          video_recorded: boolean | null
          was_sent_to_coach: boolean | null
          weight: number | null
          weight_timestamp: string | null
        }
        Insert: {
          check_in_type: string
          coach_feedback?: string | null
          coach_rating?: number | null
          created_at?: string | null
          date: string
          deleted_at?: string | null
          flag_reason?: string | null
          follow_up_completed_at?: string | null
          id?: string
          is_flagged?: boolean | null
          muscle_group_trained?: string | null
          notes?: string | null
          photo_data?: string | null
          requires_follow_up?: boolean | null
          review_status?:
            | Database["public"]["Enums"]["check_in_review_status"]
            | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          session_quality?: string | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          snooze_count?: number | null
          snoozed_at?: string | null
          snoozed_until?: string | null
          steps_average?: number | null
          steps_total?: number | null
          updated_at?: string | null
          user_id: string
          video_recorded?: boolean | null
          was_sent_to_coach?: boolean | null
          weight?: number | null
          weight_timestamp?: string | null
        }
        Update: {
          check_in_type?: string
          coach_feedback?: string | null
          coach_rating?: number | null
          created_at?: string | null
          date?: string
          deleted_at?: string | null
          flag_reason?: string | null
          follow_up_completed_at?: string | null
          id?: string
          is_flagged?: boolean | null
          muscle_group_trained?: string | null
          notes?: string | null
          photo_data?: string | null
          requires_follow_up?: boolean | null
          review_status?:
            | Database["public"]["Enums"]["check_in_review_status"]
            | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sent_at?: string | null
          session_quality?: string | null
          sleep_hours?: number | null
          sleep_quality?: string | null
          snooze_count?: number | null
          snoozed_at?: string | null
          snoozed_until?: string | null
          steps_average?: number | null
          steps_total?: number | null
          updated_at?: string | null
          user_id?: string
          video_recorded?: boolean | null
          was_sent_to_coach?: boolean | null
          weight?: number | null
          weight_timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_clients: {
        Row: {
          check_in_frequency: number | null
          client_id: string
          coach_id: string
          created_at: string
          ended_at: string | null
          id: string
          next_check_in_due: string | null
          notes: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["coach_client_status"] | null
          updated_at: string
        }
        Insert: {
          check_in_frequency?: number | null
          client_id: string
          coach_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          next_check_in_due?: string | null
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["coach_client_status"] | null
          updated_at?: string
        }
        Update: {
          check_in_frequency?: number | null
          client_id?: string
          coach_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          next_check_in_due?: string | null
          notes?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["coach_client_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_messages: {
        Row: {
          coach_client_id: string
          content: string
          created_at: string
          id: string
          is_deleted_by_recipient: boolean | null
          is_deleted_by_sender: boolean | null
          is_read: boolean | null
          metadata: Json | null
          read_at: string | null
          reply_to_id: string | null
          sender_id: string
          type: Database["public"]["Enums"]["message_type"] | null
          updated_at: string
        }
        Insert: {
          coach_client_id: string
          content: string
          created_at?: string
          id?: string
          is_deleted_by_recipient?: boolean | null
          is_deleted_by_sender?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          read_at?: string | null
          reply_to_id?: string | null
          sender_id: string
          type?: Database["public"]["Enums"]["message_type"] | null
          updated_at?: string
        }
        Update: {
          coach_client_id?: string
          content?: string
          created_at?: string
          id?: string
          is_deleted_by_recipient?: boolean | null
          is_deleted_by_sender?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          read_at?: string | null
          reply_to_id?: string | null
          sender_id?: string
          type?: Database["public"]["Enums"]["message_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_coach_client_id_fkey"
            columns: ["coach_client_id"]
            isOneToOne: false
            referencedRelation: "coach_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "coach_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_notes: {
        Row: {
          category: Database["public"]["Enums"]["note_category"] | null
          client_id: string
          coach_id: string
          content: string
          created_at: string
          follow_up_date: string | null
          id: string
          is_flagged: boolean | null
          is_pinned: boolean | null
          linked_check_in_id: string | null
          linked_meal_plan_id: string | null
          linked_programme_id: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["note_category"] | null
          client_id: string
          coach_id: string
          content: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          is_flagged?: boolean | null
          is_pinned?: boolean | null
          linked_check_in_id?: string | null
          linked_meal_plan_id?: string | null
          linked_programme_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["note_category"] | null
          client_id?: string
          coach_id?: string
          content?: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          is_flagged?: boolean | null
          is_pinned?: boolean | null
          linked_check_in_id?: string | null
          linked_meal_plan_id?: string | null
          linked_programme_id?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_readiness_summaries: {
        Row: {
          active_energy_kcal: number
          created_at: string | null
          date: string
          exercise_minutes: number
          has_any_sleep: boolean
          has_high_quality_sleep: boolean
          has_hrv: boolean
          has_phone_motion_only: boolean
          has_wearable: boolean
          has_workouts: boolean
          id: string
          last_healthkit_sync: string | null
          mode: string | null
          overall_copy_key: string | null
          overall_readiness_band: string | null
          readiness_label: string | null
          recovery_score: number
          sleep_score: number
          steps: number
          strain_score: number
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          active_energy_kcal?: number
          created_at?: string | null
          date: string
          exercise_minutes?: number
          has_any_sleep?: boolean
          has_high_quality_sleep?: boolean
          has_hrv?: boolean
          has_phone_motion_only?: boolean
          has_wearable?: boolean
          has_workouts?: boolean
          id?: string
          last_healthkit_sync?: string | null
          mode?: string | null
          overall_copy_key?: string | null
          overall_readiness_band?: string | null
          readiness_label?: string | null
          recovery_score?: number
          sleep_score?: number
          steps?: number
          strain_score?: number
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          active_energy_kcal?: number
          created_at?: string | null
          date?: string
          exercise_minutes?: number
          has_any_sleep?: boolean
          has_high_quality_sleep?: boolean
          has_hrv?: boolean
          has_phone_motion_only?: boolean
          has_wearable?: boolean
          has_workouts?: boolean
          id?: string
          last_healthkit_sync?: string | null
          mode?: string | null
          overall_copy_key?: string | null
          overall_readiness_band?: string | null
          readiness_label?: string | null
          recovery_score?: number
          sleep_score?: number
          steps?: number
          strain_score?: number
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      daily_recovery_summaries: {
        Row: {
          created_at: string | null
          date: string
          hr_range_state: string | null
          hrv_range_state: string | null
          id: string
          oxygen_saturation: number | null
          recovery_band: string | null
          recovery_copy_key: string | null
          recovery_label: string | null
          recovery_score: number
          respiratory_range_state: string | null
          respiratory_rate: number | null
          resting_hr: number | null
          resting_hrv: number | null
          spo2_range_state: string | null
          updated_at: string | null
          user_id: string
          wrist_temp_range_state: string | null
          wrist_temperature: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          hr_range_state?: string | null
          hrv_range_state?: string | null
          id?: string
          oxygen_saturation?: number | null
          recovery_band?: string | null
          recovery_copy_key?: string | null
          recovery_label?: string | null
          recovery_score?: number
          respiratory_range_state?: string | null
          respiratory_rate?: number | null
          resting_hr?: number | null
          resting_hrv?: number | null
          spo2_range_state?: string | null
          updated_at?: string | null
          user_id: string
          wrist_temp_range_state?: string | null
          wrist_temperature?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          hr_range_state?: string | null
          hrv_range_state?: string | null
          id?: string
          oxygen_saturation?: number | null
          recovery_band?: string | null
          recovery_copy_key?: string | null
          recovery_label?: string | null
          recovery_score?: number
          respiratory_range_state?: string | null
          respiratory_rate?: number | null
          resting_hr?: number | null
          resting_hrv?: number | null
          spo2_range_state?: string | null
          updated_at?: string | null
          user_id?: string
          wrist_temp_range_state?: string | null
          wrist_temperature?: number | null
        }
        Relationships: []
      }
      daily_sleep_summaries: {
        Row: {
          average_sleeping_hr: number | null
          baseline_range_state: string | null
          created_at: string | null
          date: string
          deep_minutes: number
          deep_range_state: string | null
          hr_dip_percent: number | null
          id: string
          light_or_core_minutes: number
          oxygen_saturation: number | null
          rem_minutes: number
          rem_range_state: string | null
          respiratory_rate: number | null
          sleep_bank_minutes: number
          sleep_bank_range_state: string | null
          sleep_end_time: string | null
          sleep_label: string | null
          sleep_score: number
          sleep_score_band: string | null
          sleep_score_range_state: string | null
          sleep_start_time: string | null
          source_kind: string | null
          time_asleep_minutes: number
          time_asleep_range_state: string | null
          time_in_bed_minutes: number
          time_to_fall_asleep_minutes: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_sleeping_hr?: number | null
          baseline_range_state?: string | null
          created_at?: string | null
          date: string
          deep_minutes?: number
          deep_range_state?: string | null
          hr_dip_percent?: number | null
          id?: string
          light_or_core_minutes?: number
          oxygen_saturation?: number | null
          rem_minutes?: number
          rem_range_state?: string | null
          respiratory_rate?: number | null
          sleep_bank_minutes?: number
          sleep_bank_range_state?: string | null
          sleep_end_time?: string | null
          sleep_label?: string | null
          sleep_score?: number
          sleep_score_band?: string | null
          sleep_score_range_state?: string | null
          sleep_start_time?: string | null
          source_kind?: string | null
          time_asleep_minutes?: number
          time_asleep_range_state?: string | null
          time_in_bed_minutes?: number
          time_to_fall_asleep_minutes?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_sleeping_hr?: number | null
          baseline_range_state?: string | null
          created_at?: string | null
          date?: string
          deep_minutes?: number
          deep_range_state?: string | null
          hr_dip_percent?: number | null
          id?: string
          light_or_core_minutes?: number
          oxygen_saturation?: number | null
          rem_minutes?: number
          rem_range_state?: string | null
          respiratory_rate?: number | null
          sleep_bank_minutes?: number
          sleep_bank_range_state?: string | null
          sleep_end_time?: string | null
          sleep_label?: string | null
          sleep_score?: number
          sleep_score_band?: string | null
          sleep_score_range_state?: string | null
          sleep_start_time?: string | null
          source_kind?: string | null
          time_asleep_minutes?: number
          time_asleep_range_state?: string | null
          time_in_bed_minutes?: number
          time_to_fall_asleep_minutes?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_workouts: {
        Row: {
          active_energy_kcal: number | null
          avg_heart_rate: number | null
          created_at: string | null
          date: string
          distance_meters: number | null
          duration_seconds: number | null
          end_time: string | null
          healthkit_uuid: string | null
          id: string
          max_heart_rate: number | null
          name: string | null
          source_bundle_id: string | null
          source_name: string | null
          start_time: string | null
          total_energy_kcal: number
          updated_at: string | null
          user_id: string
          workout_name: string | null
          workout_type: string
        }
        Insert: {
          active_energy_kcal?: number | null
          avg_heart_rate?: number | null
          created_at?: string | null
          date: string
          distance_meters?: number | null
          duration_seconds?: number | null
          end_time?: string | null
          healthkit_uuid?: string | null
          id?: string
          max_heart_rate?: number | null
          name?: string | null
          source_bundle_id?: string | null
          source_name?: string | null
          start_time?: string | null
          total_energy_kcal?: number
          updated_at?: string | null
          user_id: string
          workout_name?: string | null
          workout_type: string
        }
        Update: {
          active_energy_kcal?: number | null
          avg_heart_rate?: number | null
          created_at?: string | null
          date?: string
          distance_meters?: number | null
          duration_seconds?: number | null
          end_time?: string | null
          healthkit_uuid?: string | null
          id?: string
          max_heart_rate?: number | null
          name?: string | null
          source_bundle_id?: string | null
          source_name?: string | null
          start_time?: string | null
          total_energy_kcal?: number
          updated_at?: string | null
          user_id?: string
          workout_name?: string | null
          workout_type?: string
        }
        Relationships: []
      }
      day_overrides: {
        Row: {
          actual_day_type_raw: number | null
          actual_day_type_updated_at: string | null
          created_at: string | null
          date: string
          day_type: string
          deleted_at: string | null
          id: string
          meal_plan_type: string
          training_day_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_day_type_raw?: number | null
          actual_day_type_updated_at?: string | null
          created_at?: string | null
          date: string
          day_type: string
          deleted_at?: string | null
          id?: string
          meal_plan_type: string
          training_day_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_day_type_raw?: number | null
          actual_day_type_updated_at?: string | null
          created_at?: string | null
          date?: string
          day_type?: string
          deleted_at?: string | null
          id?: string
          meal_plan_type?: string
          training_day_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      day_templates: {
        Row: {
          created_at: string | null
          day_type: string
          deleted_at: string | null
          id: string
          meal_plan_type: string
          training_day_name: string | null
          updated_at: string | null
          user_id: string
          weekday: number
        }
        Insert: {
          created_at?: string | null
          day_type: string
          deleted_at?: string | null
          id?: string
          meal_plan_type: string
          training_day_name?: string | null
          updated_at?: string | null
          user_id: string
          weekday: number
        }
        Update: {
          created_at?: string | null
          day_type?: string
          deleted_at?: string | null
          id?: string
          meal_plan_type?: string
          training_day_name?: string | null
          updated_at?: string | null
          user_id?: string
          weekday?: number
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string | null
          default_rep_range: string | null
          default_sets: number | null
          default_weight: number | null
          deleted_at: string | null
          feeder_sets: string | null
          id: string
          name: string
          order_index: number | null
          prescription: string | null
          rest_period: number | null
          set_type: string | null
          tempo: string | null
          training_day_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_rep_range?: string | null
          default_sets?: number | null
          default_weight?: number | null
          deleted_at?: string | null
          feeder_sets?: string | null
          id?: string
          name: string
          order_index?: number | null
          prescription?: string | null
          rest_period?: number | null
          set_type?: string | null
          tempo?: string | null
          training_day_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_rep_range?: string | null
          default_sets?: number | null
          default_weight?: number | null
          deleted_at?: string | null
          feeder_sets?: string | null
          id?: string
          name?: string
          order_index?: number | null
          prescription?: string | null
          rest_period?: number | null
          set_type?: string | null
          tempo?: string | null
          training_day_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_training_day_id_fkey"
            columns: ["training_day_id"]
            isOneToOne: false
            referencedRelation: "training_days"
            referencedColumns: ["id"]
          },
        ]
      }
      food_database: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          deleted_at: string | null
          fats: number | null
          id: string
          is_modified: boolean | null
          last_modified: string | null
          name: string
          protein: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          deleted_at?: string | null
          fats?: number | null
          id?: string
          is_modified?: boolean | null
          last_modified?: string | null
          name: string
          protein?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          deleted_at?: string | null
          fats?: number | null
          id?: string
          is_modified?: boolean | null
          last_modified?: string | null
          name?: string
          protein?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          amount: number | null
          calories: number | null
          carbs: number | null
          created_at: string | null
          deleted_at: string | null
          fats: number | null
          food_database_id: string | null
          id: string
          is_modified: boolean | null
          last_modified: string | null
          meal_id: string | null
          order_index: number | null
          portion_multiplier: number | null
          portion_size: number | null
          protein: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          deleted_at?: string | null
          fats?: number | null
          food_database_id?: string | null
          id?: string
          is_modified?: boolean | null
          last_modified?: string | null
          meal_id?: string | null
          order_index?: number | null
          portion_multiplier?: number | null
          portion_size?: number | null
          protein?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          deleted_at?: string | null
          fats?: number | null
          food_database_id?: string | null
          id?: string
          is_modified?: boolean | null
          last_modified?: string | null
          meal_id?: string | null
          order_index?: number | null
          portion_multiplier?: number | null
          portion_size?: number | null
          protein?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_items_food_database_id_fkey"
            columns: ["food_database_id"]
            isOneToOne: false
            referencedRelation: "food_database"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_items_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      logged_sets: {
        Row: {
          created_at: string | null
          id: string
          is_failure_set: boolean | null
          is_pb_estimated_1rm: boolean | null
          is_pb_volume: boolean | null
          is_pb_weight: boolean | null
          is_soft_deleted: boolean | null
          is_warm_up: boolean | null
          notes: string | null
          reps: number | null
          rest_seconds_after_set: number | null
          rir: number | null
          rpe: number | null
          session_item_id: string | null
          set_index: number | null
          tempo_string_override: string | null
          updated_at: string | null
          user_id: string
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_failure_set?: boolean | null
          is_pb_estimated_1rm?: boolean | null
          is_pb_volume?: boolean | null
          is_pb_weight?: boolean | null
          is_soft_deleted?: boolean | null
          is_warm_up?: boolean | null
          notes?: string | null
          reps?: number | null
          rest_seconds_after_set?: number | null
          rir?: number | null
          rpe?: number | null
          session_item_id?: string | null
          set_index?: number | null
          tempo_string_override?: string | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_failure_set?: boolean | null
          is_pb_estimated_1rm?: boolean | null
          is_pb_volume?: boolean | null
          is_pb_weight?: boolean | null
          is_soft_deleted?: boolean | null
          is_warm_up?: boolean | null
          notes?: string | null
          reps?: number | null
          rest_seconds_after_set?: number | null
          rir?: number | null
          rpe?: number | null
          session_item_id?: string | null
          set_index?: number | null
          tempo_string_override?: string | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logged_sets_session_item_id_fkey"
            columns: ["session_item_id"]
            isOneToOne: false
            referencedRelation: "session_items"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_completions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          date: string
          deleted_at: string | null
          id: string
          meal_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          date: string
          deleted_at?: string | null
          id?: string
          meal_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          date?: string
          deleted_at?: string | null
          id?: string
          meal_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_completions_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_assignments: {
        Row: {
          adherence_percentage: number | null
          allergies: string[] | null
          client_id: string
          coach_id: string
          coach_notes: string | null
          content: Json
          created_at: string
          dietary_requirements: string[] | null
          end_date: string | null
          id: string
          name: string
          start_date: string
          status: Database["public"]["Enums"]["assignment_status"] | null
          target_calories: number | null
          target_carbs_g: number | null
          target_fat_g: number | null
          target_fibre_g: number | null
          target_protein_g: number | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          adherence_percentage?: number | null
          allergies?: string[] | null
          client_id: string
          coach_id: string
          coach_notes?: string | null
          content?: Json
          created_at?: string
          dietary_requirements?: string[] | null
          end_date?: string | null
          id?: string
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fibre_g?: number | null
          target_protein_g?: number | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          adherence_percentage?: number | null
          allergies?: string[] | null
          client_id?: string
          coach_id?: string
          coach_notes?: string | null
          content?: Json
          created_at?: string
          dietary_requirements?: string[] | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fibre_g?: number | null
          target_protein_g?: number | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_assignments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_templates: {
        Row: {
          allergies: string[] | null
          coach_id: string
          content: Json
          created_at: string
          cuisine_preferences: string[] | null
          description: string | null
          dietary_requirements: string[] | null
          duration_weeks: number | null
          goal: Database["public"]["Enums"]["meal_plan_goal"] | null
          id: string
          is_public: boolean | null
          is_template: boolean | null
          name: string
          tags: string[] | null
          target_calories: number | null
          target_carbs_g: number | null
          target_fat_g: number | null
          target_fibre_g: number | null
          target_protein_g: number | null
          updated_at: string
        }
        Insert: {
          allergies?: string[] | null
          coach_id: string
          content?: Json
          created_at?: string
          cuisine_preferences?: string[] | null
          description?: string | null
          dietary_requirements?: string[] | null
          duration_weeks?: number | null
          goal?: Database["public"]["Enums"]["meal_plan_goal"] | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          name: string
          tags?: string[] | null
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fibre_g?: number | null
          target_protein_g?: number | null
          updated_at?: string
        }
        Update: {
          allergies?: string[] | null
          coach_id?: string
          content?: Json
          created_at?: string
          cuisine_preferences?: string[] | null
          description?: string | null
          dietary_requirements?: string[] | null
          duration_weeks?: number | null
          goal?: Database["public"]["Enums"]["meal_plan_goal"] | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          name?: string
          tags?: string[] | null
          target_calories?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fibre_g?: number | null
          target_protein_g?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string
          notes: string | null
          total_calories: number | null
          total_carbs: number | null
          total_days: number | null
          total_fats: number | null
          total_protein: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          notes?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_days?: number | null
          total_fats?: number | null
          total_protein?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          total_calories?: number | null
          total_carbs?: number | null
          total_days?: number | null
          total_fats?: number | null
          total_protein?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string | null
          deleted_at: string | null
          details: string | null
          fats: number | null
          id: string
          is_modified: boolean | null
          last_modified: string | null
          meal_plan_id: string | null
          notes: string | null
          order_index: number | null
          protein: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          deleted_at?: string | null
          details?: string | null
          fats?: number | null
          id?: string
          is_modified?: boolean | null
          last_modified?: string | null
          meal_plan_id?: string | null
          notes?: string | null
          order_index?: number | null
          protein?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string | null
          deleted_at?: string | null
          details?: string | null
          fats?: number | null
          id?: string
          is_modified?: boolean | null
          last_modified?: string | null
          meal_plan_id?: string | null
          notes?: string | null
          order_index?: number | null
          protein?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          check_ins_email: boolean | null
          check_ins_in_app: boolean | null
          check_ins_push: boolean | null
          client_activity_email: boolean | null
          client_activity_in_app: boolean | null
          client_activity_push: boolean | null
          created_at: string | null
          email_digest: string | null
          id: string
          messages_email: boolean | null
          messages_in_app: boolean | null
          messages_push: boolean | null
          reminders_email: boolean | null
          reminders_in_app: boolean | null
          reminders_push: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          check_ins_email?: boolean | null
          check_ins_in_app?: boolean | null
          check_ins_push?: boolean | null
          client_activity_email?: boolean | null
          client_activity_in_app?: boolean | null
          client_activity_push?: boolean | null
          created_at?: string | null
          email_digest?: string | null
          id?: string
          messages_email?: boolean | null
          messages_in_app?: boolean | null
          messages_push?: boolean | null
          reminders_email?: boolean | null
          reminders_in_app?: boolean | null
          reminders_push?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          check_ins_email?: boolean | null
          check_ins_in_app?: boolean | null
          check_ins_push?: boolean | null
          client_activity_email?: boolean | null
          client_activity_in_app?: boolean | null
          client_activity_push?: boolean | null
          created_at?: string | null
          email_digest?: string | null
          id?: string
          messages_email?: boolean | null
          messages_in_app?: boolean | null
          messages_push?: boolean | null
          reminders_email?: boolean | null
          reminders_in_app?: boolean | null
          reminders_push?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_daily_summaries: {
        Row: {
          actual_calories: number | null
          actual_carbs: number | null
          actual_fat: number | null
          actual_protein: number | null
          created_at: string | null
          date: string
          day_type: string | null
          id: string
          is_diet_break_day: boolean | null
          is_refeed_day: boolean | null
          notes: string | null
          original_target_calories: number | null
          rebalance_amount: number | null
          target_calories: number | null
          target_carbs: number | null
          target_fat: number | null
          target_protein: number | null
          tracking_state: string | null
          updated_at: string | null
          user_id: string
          was_rebalanced: boolean | null
        }
        Insert: {
          actual_calories?: number | null
          actual_carbs?: number | null
          actual_fat?: number | null
          actual_protein?: number | null
          created_at?: string | null
          date: string
          day_type?: string | null
          id?: string
          is_diet_break_day?: boolean | null
          is_refeed_day?: boolean | null
          notes?: string | null
          original_target_calories?: number | null
          rebalance_amount?: number | null
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          tracking_state?: string | null
          updated_at?: string | null
          user_id: string
          was_rebalanced?: boolean | null
        }
        Update: {
          actual_calories?: number | null
          actual_carbs?: number | null
          actual_fat?: number | null
          actual_protein?: number | null
          created_at?: string | null
          date?: string
          day_type?: string | null
          id?: string
          is_diet_break_day?: boolean | null
          is_refeed_day?: boolean | null
          notes?: string | null
          original_target_calories?: number | null
          rebalance_amount?: number | null
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          tracking_state?: string | null
          updated_at?: string | null
          user_id?: string
          was_rebalanced?: boolean | null
        }
        Relationships: []
      }
      nutrition_food_entries: {
        Row: {
          calories: number | null
          carbohydrates: number | null
          created_at: string | null
          fat: number | null
          food_item_id: string | null
          id: string
          is_precise: boolean | null
          is_quick_add: boolean | null
          meal_id: string | null
          name: string | null
          notes: string | null
          nutrition_food_item_id: string | null
          protein: number | null
          quantity: number | null
          serving_unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbohydrates?: number | null
          created_at?: string | null
          fat?: number | null
          food_item_id?: string | null
          id?: string
          is_precise?: boolean | null
          is_quick_add?: boolean | null
          meal_id?: string | null
          name?: string | null
          notes?: string | null
          nutrition_food_item_id?: string | null
          protein?: number | null
          quantity?: number | null
          serving_unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbohydrates?: number | null
          created_at?: string | null
          fat?: number | null
          food_item_id?: string | null
          id?: string
          is_precise?: boolean | null
          is_quick_add?: boolean | null
          meal_id?: string | null
          name?: string | null
          notes?: string | null
          nutrition_food_item_id?: string | null
          protein?: number | null
          quantity?: number | null
          serving_unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_food_entries_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "nutrition_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_food_items: {
        Row: {
          allergens: string[] | null
          barcode: string | null
          brand: string | null
          calories: number
          carbohydrates: number
          category: string | null
          confidence: string | null
          created_at: string | null
          fat: number
          fibre: number | null
          id: string
          is_favourite: boolean | null
          last_used: string | null
          name: string
          protein: number
          serving_size: number | null
          serving_unit: string | null
          source: string | null
          source_id: string | null
          updated_at: string | null
          use_count: number | null
          user_id: string
        }
        Insert: {
          allergens?: string[] | null
          barcode?: string | null
          brand?: string | null
          calories: number
          carbohydrates: number
          category?: string | null
          confidence?: string | null
          created_at?: string | null
          fat: number
          fibre?: number | null
          id?: string
          is_favourite?: boolean | null
          last_used?: string | null
          name: string
          protein: number
          serving_size?: number | null
          serving_unit?: string | null
          source?: string | null
          source_id?: string | null
          updated_at?: string | null
          use_count?: number | null
          user_id: string
        }
        Update: {
          allergens?: string[] | null
          barcode?: string | null
          brand?: string | null
          calories?: number
          carbohydrates?: number
          category?: string | null
          confidence?: string | null
          created_at?: string | null
          fat?: number
          fibre?: number | null
          id?: string
          is_favourite?: boolean | null
          last_used?: string | null
          name?: string
          protein?: number
          serving_size?: number | null
          serving_unit?: string | null
          source?: string | null
          source_id?: string | null
          updated_at?: string | null
          use_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      nutrition_meals: {
        Row: {
          created_at: string | null
          daily_summary_id: string
          id: string
          is_favourite_template: boolean | null
          meal_time: string | null
          meal_type: string
          name: string
          notes: string | null
          order_index: number | null
          slot_type: string | null
          time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_summary_id: string
          id?: string
          is_favourite_template?: boolean | null
          meal_time?: string | null
          meal_type: string
          name: string
          notes?: string | null
          order_index?: number | null
          slot_type?: string | null
          time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_summary_id?: string
          id?: string
          is_favourite_template?: boolean | null
          meal_time?: string | null
          meal_type?: string
          name?: string
          notes?: string | null
          order_index?: number | null
          slot_type?: string | null
          time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_meals_daily_summary_id_fkey"
            columns: ["daily_summary_id"]
            isOneToOne: false
            referencedRelation: "nutrition_daily_summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_weekly_check_ins: {
        Row: {
          adherence_percentage: number | null
          average_calories: number | null
          average_protein: number | null
          created_at: string | null
          date: string | null
          end_weight: number | null
          energy_level: number | null
          hunger_level: number | null
          id: string
          is_off_plan_week: boolean | null
          mood_rating: number | null
          new_calories: number | null
          notes: string | null
          previous_calories: number | null
          sleep_quality: number | null
          start_weight: number | null
          tracked_days: number | null
          training_performance: number | null
          updated_at: string | null
          user_id: string
          user_notes: string | null
          week_ending_date: string | null
          weight: number | null
          weight_change: number | null
        }
        Insert: {
          adherence_percentage?: number | null
          average_calories?: number | null
          average_protein?: number | null
          created_at?: string | null
          date?: string | null
          end_weight?: number | null
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          is_off_plan_week?: boolean | null
          mood_rating?: number | null
          new_calories?: number | null
          notes?: string | null
          previous_calories?: number | null
          sleep_quality?: number | null
          start_weight?: number | null
          tracked_days?: number | null
          training_performance?: number | null
          updated_at?: string | null
          user_id: string
          user_notes?: string | null
          week_ending_date?: string | null
          weight?: number | null
          weight_change?: number | null
        }
        Update: {
          adherence_percentage?: number | null
          average_calories?: number | null
          average_protein?: number | null
          created_at?: string | null
          date?: string | null
          end_weight?: number | null
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          is_off_plan_week?: boolean | null
          mood_rating?: number | null
          new_calories?: number | null
          notes?: string | null
          previous_calories?: number | null
          sleep_quality?: number | null
          start_weight?: number | null
          tracked_days?: number | null
          training_performance?: number | null
          updated_at?: string | null
          user_id?: string
          user_notes?: string | null
          week_ending_date?: string | null
          weight?: number | null
          weight_change?: number | null
        }
        Relationships: []
      }
      personal_bests: {
        Row: {
          achieved_at: string | null
          created_at: string | null
          exercise_library_item_id: string | null
          id: string
          is_soft_deleted: boolean | null
          logged_set_id: string | null
          pb_type: string | null
          reps: number | null
          training_session_id: string | null
          updated_at: string | null
          user_id: string
          value: number | null
          weight: number | null
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string | null
          exercise_library_item_id?: string | null
          id?: string
          is_soft_deleted?: boolean | null
          logged_set_id?: string | null
          pb_type?: string | null
          reps?: number | null
          training_session_id?: string | null
          updated_at?: string | null
          user_id: string
          value?: number | null
          weight?: number | null
        }
        Update: {
          achieved_at?: string | null
          created_at?: string | null
          exercise_library_item_id?: string | null
          id?: string
          is_soft_deleted?: boolean | null
          logged_set_id?: string | null
          pb_type?: string | null
          reps?: number | null
          training_session_id?: string | null
          updated_at?: string | null
          user_id?: string
          value?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_bests_logged_set_id_fkey"
            columns: ["logged_set_id"]
            isOneToOne: false
            referencedRelation: "logged_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_bests_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_metrics: {
        Row: {
          breakdown: Json | null
          change_percentage: number | null
          created_at: string
          id: string
          metric_type: Database["public"]["Enums"]["metric_type"]
          notes: string | null
          period: Database["public"]["Enums"]["metric_period"]
          period_end: string
          period_start: string
          previous_value: number | null
          updated_at: string
          value: number
        }
        Insert: {
          breakdown?: Json | null
          change_percentage?: number | null
          created_at?: string
          id?: string
          metric_type: Database["public"]["Enums"]["metric_type"]
          notes?: string | null
          period?: Database["public"]["Enums"]["metric_period"]
          period_end: string
          period_start: string
          previous_value?: number | null
          updated_at?: string
          value?: number
        }
        Update: {
          breakdown?: Json | null
          change_percentage?: number | null
          created_at?: string
          id?: string
          metric_type?: Database["public"]["Enums"]["metric_type"]
          notes?: string | null
          period?: Database["public"]["Enums"]["metric_period"]
          period_end?: string
          period_start?: string
          previous_value?: number | null
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      preferences: {
        Row: {
          auto_open_messaging_app: boolean | null
          check_in_days_data: Json | null
          check_in_show_sleep: boolean | null
          check_in_show_steps: boolean | null
          check_in_show_supplements: boolean | null
          check_in_show_weight: boolean | null
          check_ins_enabled: boolean | null
          coach_contact_method: string | null
          coach_email: string | null
          coach_name: string | null
          coach_phone_number: string | null
          created_at: string | null
          daily_water_goal_ml: number | null
          deleted_at: string | null
          id: string
          updated_at: string | null
          user_id: string
          water_unit: string | null
        }
        Insert: {
          auto_open_messaging_app?: boolean | null
          check_in_days_data?: Json | null
          check_in_show_sleep?: boolean | null
          check_in_show_steps?: boolean | null
          check_in_show_supplements?: boolean | null
          check_in_show_weight?: boolean | null
          check_ins_enabled?: boolean | null
          coach_contact_method?: string | null
          coach_email?: string | null
          coach_name?: string | null
          coach_phone_number?: string | null
          created_at?: string | null
          daily_water_goal_ml?: number | null
          deleted_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
          water_unit?: string | null
        }
        Update: {
          auto_open_messaging_app?: boolean | null
          check_in_days_data?: Json | null
          check_in_show_sleep?: boolean | null
          check_in_show_steps?: boolean | null
          check_in_show_supplements?: boolean | null
          check_in_show_weight?: boolean | null
          check_ins_enabled?: boolean | null
          coach_contact_method?: string | null
          coach_email?: string | null
          coach_name?: string | null
          coach_phone_number?: string | null
          created_at?: string | null
          daily_water_goal_ml?: number | null
          deleted_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
          water_unit?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          apple_sub: string | null
          avatar_url: string | null
          bio: string | null
          brand_colour: string | null
          business_logo_url: string | null
          business_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_accepting_clients: boolean | null
          max_clients: number | null
          onboarding_completed: boolean | null
          postcode: string | null
          qualifications: string[] | null
          role: Database["public"]["Enums"]["user_role"] | null
          roles: string[] | null
          social_links: Json | null
          specialisations: string[] | null
          timezone: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          apple_sub?: string | null
          avatar_url?: string | null
          bio?: string | null
          brand_colour?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          is_accepting_clients?: boolean | null
          max_clients?: number | null
          onboarding_completed?: boolean | null
          postcode?: string | null
          qualifications?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          roles?: string[] | null
          social_links?: Json | null
          specialisations?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          apple_sub?: string | null
          avatar_url?: string | null
          bio?: string | null
          brand_colour?: string | null
          business_logo_url?: string | null
          business_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_accepting_clients?: boolean | null
          max_clients?: number | null
          onboarding_completed?: boolean | null
          postcode?: string | null
          qualifications?: string[] | null
          role?: Database["public"]["Enums"]["user_role"] | null
          roles?: string[] | null
          social_links?: Json | null
          specialisations?: string[] | null
          timezone?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      programme_assignments: {
        Row: {
          client_id: string
          coach_id: string
          coach_notes: string | null
          content: Json
          created_at: string
          current_day: number | null
          current_week: number | null
          end_date: string | null
          id: string
          last_workout_at: string | null
          name: string
          progress_percentage: number | null
          start_date: string
          status: Database["public"]["Enums"]["assignment_status"] | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          coach_notes?: string | null
          content?: Json
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          end_date?: string | null
          id?: string
          last_workout_at?: string | null
          name: string
          progress_percentage?: number | null
          start_date: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          coach_notes?: string | null
          content?: Json
          created_at?: string
          current_day?: number | null
          current_week?: number | null
          end_date?: string | null
          id?: string
          last_workout_at?: string | null
          name?: string
          progress_percentage?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"] | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_assignments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_assignments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "programme_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_days: {
        Row: {
          created_at: string | null
          day_type: string | null
          id: string
          is_soft_deleted: boolean | null
          name: string
          notes: string | null
          planned_duration_minutes: number | null
          programme_id: string | null
          sort_order: number | null
          updated_at: string | null
          user_id: string
          weekday: number | null
        }
        Insert: {
          created_at?: string | null
          day_type?: string | null
          id?: string
          is_soft_deleted?: boolean | null
          name: string
          notes?: string | null
          planned_duration_minutes?: number | null
          programme_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          user_id: string
          weekday?: number | null
        }
        Update: {
          created_at?: string | null
          day_type?: string | null
          id?: string
          is_soft_deleted?: boolean | null
          name?: string
          notes?: string | null
          planned_duration_minutes?: number | null
          programme_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string
          weekday?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "programme_days_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_templates: {
        Row: {
          coach_id: string
          content: Json
          created_at: string
          days_per_week: number
          description: string | null
          difficulty: Database["public"]["Enums"]["programme_difficulty"] | null
          duration_weeks: number
          id: string
          is_public: boolean | null
          is_template: boolean | null
          name: string
          tags: string[] | null
          type: Database["public"]["Enums"]["programme_type"] | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          content?: Json
          created_at?: string
          days_per_week?: number
          description?: string | null
          difficulty?:
            | Database["public"]["Enums"]["programme_difficulty"]
            | null
          duration_weeks?: number
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          name: string
          tags?: string[] | null
          type?: Database["public"]["Enums"]["programme_type"] | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          content?: Json
          created_at?: string
          days_per_week?: number
          description?: string | null
          difficulty?:
            | Database["public"]["Enums"]["programme_difficulty"]
            | null
          duration_weeks?: number
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          name?: string
          tags?: string[] | null
          type?: Database["public"]["Enums"]["programme_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_templates_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      programmes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_soft_deleted: boolean | null
          name: string
          rotation_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_soft_deleted?: boolean | null
          name: string
          rotation_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_soft_deleted?: boolean | null
          name?: string
          rotation_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      session_items: {
        Row: {
          created_at: string | null
          exercise_library_item_id: string | null
          id: string
          is_from_plan: boolean | null
          is_soft_deleted: boolean | null
          notes: string | null
          original_exercise_name: string | null
          sort_order: number | null
          training_session_id: string | null
          updated_at: string | null
          user_id: string
          was_skipped: boolean | null
          was_swapped: boolean | null
          workout_item_id: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_library_item_id?: string | null
          id?: string
          is_from_plan?: boolean | null
          is_soft_deleted?: boolean | null
          notes?: string | null
          original_exercise_name?: string | null
          sort_order?: number | null
          training_session_id?: string | null
          updated_at?: string | null
          user_id: string
          was_skipped?: boolean | null
          was_swapped?: boolean | null
          workout_item_id?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_library_item_id?: string | null
          id?: string
          is_from_plan?: boolean | null
          is_soft_deleted?: boolean | null
          notes?: string | null
          original_exercise_name?: string | null
          sort_order?: number | null
          training_session_id?: string | null
          updated_at?: string | null
          user_id?: string
          was_skipped?: boolean | null
          was_swapped?: boolean | null
          workout_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_items_training_session_id_fkey"
            columns: ["training_session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_items_workout_item_id_fkey"
            columns: ["workout_item_id"]
            isOneToOne: false
            referencedRelation: "workout_items"
            referencedColumns: ["id"]
          },
        ]
      }
      set_logs: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          exercise_id: string | null
          id: string
          reps: number
          rir: number | null
          set_index: number
          timestamp: string
          updated_at: string | null
          user_id: string
          weight: number
          workout_session_id: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          exercise_id?: string | null
          id?: string
          reps: number
          rir?: number | null
          set_index: number
          timestamp: string
          updated_at?: string | null
          user_id: string
          weight: number
          workout_session_id?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          exercise_id?: string | null
          id?: string
          reps?: number
          rir?: number | null
          set_index?: number
          timestamp?: string
          updated_at?: string | null
          user_id?: string
          weight?: number
          workout_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "set_logs_workout_session_id_fkey"
            columns: ["workout_session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_records: {
        Row: {
          average_hr: number | null
          average_hrv: number | null
          average_respiratory_rate: number | null
          average_spo2: number | null
          awake_minutes: number | null
          core_minutes: number | null
          created_at: string | null
          date: string
          deep_minutes: number | null
          duration_delta_minutes: number | null
          duration_goal_minutes: number | null
          duration_score: number | null
          end_date: string | null
          fragmentation_score: number | null
          id: string
          note: string | null
          rem_minutes: number | null
          restorative_percent: number | null
          restorative_score: number | null
          sleep_grade: string | null
          sleep_score: number | null
          start_date: string | null
          subjective_score: number | null
          tags_raw: string | null
          total_minutes: number | null
          updated_at: string | null
          user_id: string
          wake_count: number | null
        }
        Insert: {
          average_hr?: number | null
          average_hrv?: number | null
          average_respiratory_rate?: number | null
          average_spo2?: number | null
          awake_minutes?: number | null
          core_minutes?: number | null
          created_at?: string | null
          date: string
          deep_minutes?: number | null
          duration_delta_minutes?: number | null
          duration_goal_minutes?: number | null
          duration_score?: number | null
          end_date?: string | null
          fragmentation_score?: number | null
          id?: string
          note?: string | null
          rem_minutes?: number | null
          restorative_percent?: number | null
          restorative_score?: number | null
          sleep_grade?: string | null
          sleep_score?: number | null
          start_date?: string | null
          subjective_score?: number | null
          tags_raw?: string | null
          total_minutes?: number | null
          updated_at?: string | null
          user_id: string
          wake_count?: number | null
        }
        Update: {
          average_hr?: number | null
          average_hrv?: number | null
          average_respiratory_rate?: number | null
          average_spo2?: number | null
          awake_minutes?: number | null
          core_minutes?: number | null
          created_at?: string | null
          date?: string
          deep_minutes?: number | null
          duration_delta_minutes?: number | null
          duration_goal_minutes?: number | null
          duration_score?: number | null
          end_date?: string | null
          fragmentation_score?: number | null
          id?: string
          note?: string | null
          rem_minutes?: number | null
          restorative_percent?: number | null
          restorative_score?: number | null
          sleep_grade?: string | null
          sleep_score?: number | null
          start_date?: string | null
          subjective_score?: number | null
          tags_raw?: string | null
          total_minutes?: number | null
          updated_at?: string | null
          user_id?: string
          wake_count?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          cancellation_reason: string | null
          created_at: string
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          features: Json | null
          id: string
          last_payment_amount: number | null
          last_payment_at: string | null
          max_clients: number | null
          max_meal_plans: number | null
          max_programmes: number | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          stripe_subscription_id: string | null
          tier: Database["public"]["Enums"]["subscription_tier"]
          total_revenue: number | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          features?: Json | null
          id?: string
          last_payment_amount?: number | null
          last_payment_at?: string | null
          max_clients?: number | null
          max_meal_plans?: number | null
          max_programmes?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          total_revenue?: number | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          created_at?: string
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          features?: Json | null
          id?: string
          last_payment_amount?: number | null
          last_payment_at?: string | null
          max_clients?: number | null
          max_meal_plans?: number | null
          max_programmes?: number | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          stripe_subscription_id?: string | null
          tier?: Database["public"]["Enums"]["subscription_tier"]
          total_revenue?: number | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplement_intakes: {
        Row: {
          created_at: string | null
          date: string
          day: string
          deleted_at: string | null
          id: string
          supplement_id: string | null
          time_of_day: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          day: string
          deleted_at?: string | null
          id?: string
          supplement_id?: string | null
          time_of_day?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          day?: string
          deleted_at?: string | null
          id?: string
          supplement_id?: string | null
          time_of_day?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_intakes_supplement_id_fkey"
            columns: ["supplement_id"]
            isOneToOne: false
            referencedRelation: "supplements"
            referencedColumns: ["id"]
          },
        ]
      }
      supplement_templates: {
        Row: {
          category: string | null
          created_at: string | null
          default_dosage: string
          id: string
          is_user_defined: boolean | null
          name: string
          tags: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          default_dosage: string
          id?: string
          is_user_defined?: boolean | null
          name: string
          tags?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          default_dosage?: string
          id?: string
          is_user_defined?: boolean | null
          name?: string
          tags?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      supplements: {
        Row: {
          category: string | null
          created_at: string | null
          days_mask: number | null
          deleted_at: string | null
          dosage: string
          dosage_amount: string | null
          dosage_unit: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          schedule_type: string | null
          sort_order: number | null
          template_id: string | null
          times_per_day: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          days_mask?: number | null
          deleted_at?: string | null
          dosage: string
          dosage_amount?: string | null
          dosage_unit?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          schedule_type?: string | null
          sort_order?: number | null
          template_id?: string | null
          times_per_day?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          days_mask?: number | null
          deleted_at?: string | null
          dosage?: string
          dosage_amount?: string | null
          dosage_unit?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          schedule_type?: string | null
          sort_order?: number | null
          template_id?: string | null
          times_per_day?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplements_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "supplement_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string
          id: string
          is_internal: boolean | null
          read_at: string | null
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          read_at?: string | null
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          read_at?: string | null
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: Database["public"]["Enums"]["ticket_category"]
          closed_at: string | null
          created_at: string
          description: string
          first_response_at: string | null
          id: string
          internal_notes: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          satisfaction_feedback: string | null
          satisfaction_rating: number | null
          sla_breached: boolean | null
          sla_deadline: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tags: string[] | null
          ticket_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description: string
          first_response_at?: string | null
          id?: string
          internal_notes?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          tags?: string[] | null
          ticket_number?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: Database["public"]["Enums"]["ticket_category"]
          closed_at?: string | null
          created_at?: string
          description?: string
          first_response_at?: string | null
          id?: string
          internal_notes?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          tags?: string[] | null
          ticket_number?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tdee_history_entries: {
        Row: {
          average_intake: number | null
          calculated_at: string | null
          confidence: string | null
          confidence_level: string | null
          created_at: string | null
          data_points_used: number | null
          date: string | null
          days_of_data: number | null
          estimated_tdee: number | null
          id: string
          trend: string | null
          updated_at: string | null
          user_id: string
          weight_at_calculation: number | null
          weight_change: number | null
        }
        Insert: {
          average_intake?: number | null
          calculated_at?: string | null
          confidence?: string | null
          confidence_level?: string | null
          created_at?: string | null
          data_points_used?: number | null
          date?: string | null
          days_of_data?: number | null
          estimated_tdee?: number | null
          id?: string
          trend?: string | null
          updated_at?: string | null
          user_id: string
          weight_at_calculation?: number | null
          weight_change?: number | null
        }
        Update: {
          average_intake?: number | null
          calculated_at?: string | null
          confidence?: string | null
          confidence_level?: string | null
          created_at?: string | null
          data_points_used?: number | null
          date?: string | null
          days_of_data?: number | null
          estimated_tdee?: number | null
          id?: string
          trend?: string | null
          updated_at?: string | null
          user_id?: string
          weight_at_calculation?: number | null
          weight_change?: number | null
        }
        Relationships: []
      }
      training_days: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          name: string
          order_index: number | null
          planned_weekday: number | null
          training_plan_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name: string
          order_index?: number | null
          planned_weekday?: number | null
          training_plan_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          name?: string
          order_index?: number | null
          planned_weekday?: number | null
          training_plan_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_days_training_plan_id_fkey"
            columns: ["training_plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      training_sessions: {
        Row: {
          bodyweight_kg: number | null
          created_at: string | null
          date: string | null
          duration_seconds: number | null
          end_time: string | null
          id: string
          is_soft_deleted: boolean | null
          notes: string | null
          perceived_intensity: number | null
          programme_day_id: string | null
          programme_id: string | null
          start_time: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bodyweight_kg?: number | null
          created_at?: string | null
          date?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          is_soft_deleted?: boolean | null
          notes?: string | null
          perceived_intensity?: number | null
          programme_day_id?: string | null
          programme_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bodyweight_kg?: number | null
          created_at?: string | null
          date?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          is_soft_deleted?: boolean | null
          notes?: string | null
          perceived_intensity?: number | null
          programme_day_id?: string | null
          programme_id?: string | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_programme_day_id_fkey"
            columns: ["programme_day_id"]
            isOneToOne: false
            referencedRelation: "programme_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_dietary_profiles: {
        Row: {
          activity_level: string | null
          adaptive_tdee: number | null
          age: number | null
          auto_rebalance_enabled: boolean | null
          biological_sex: string | null
          body_fat_percentage: number | null
          competitive_mode: boolean | null
          created_at: string | null
          current_phase: string | null
          current_weight: number | null
          current_weight_kg: number | null
          date_of_birth: string | null
          dietary_type: string | null
          goal: string | null
          has_meal_plan_setup_complete: boolean | null
          height_cm: number | null
          id: string
          initial_tdee: number | null
          is_competitive_mode: boolean | null
          last_check_in: string | null
          max_daily_adjustment: number | null
          meals_per_day: number | null
          ntd_calories: number | null
          ntd_carbs: number | null
          ntd_fat: number | null
          ntd_protein: number | null
          preferred_meal_count: number | null
          primary_goal: string | null
          protect_protein: boolean | null
          religious_requirement: string | null
          sex: string | null
          target_calories: number | null
          target_carbs: number | null
          target_fat: number | null
          target_protein: number | null
          target_rate: number | null
          target_rate_per_week: number | null
          target_weight_kg: number | null
          td_calories: number | null
          td_carbs: number | null
          td_fat: number | null
          td_protein: number | null
          tdee_confidence: string | null
          training_days_per_week: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          adaptive_tdee?: number | null
          age?: number | null
          auto_rebalance_enabled?: boolean | null
          biological_sex?: string | null
          body_fat_percentage?: number | null
          competitive_mode?: boolean | null
          created_at?: string | null
          current_phase?: string | null
          current_weight?: number | null
          current_weight_kg?: number | null
          date_of_birth?: string | null
          dietary_type?: string | null
          goal?: string | null
          has_meal_plan_setup_complete?: boolean | null
          height_cm?: number | null
          id?: string
          initial_tdee?: number | null
          is_competitive_mode?: boolean | null
          last_check_in?: string | null
          max_daily_adjustment?: number | null
          meals_per_day?: number | null
          ntd_calories?: number | null
          ntd_carbs?: number | null
          ntd_fat?: number | null
          ntd_protein?: number | null
          preferred_meal_count?: number | null
          primary_goal?: string | null
          protect_protein?: boolean | null
          religious_requirement?: string | null
          sex?: string | null
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          target_rate?: number | null
          target_rate_per_week?: number | null
          target_weight_kg?: number | null
          td_calories?: number | null
          td_carbs?: number | null
          td_fat?: number | null
          td_protein?: number | null
          tdee_confidence?: string | null
          training_days_per_week?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_level?: string | null
          adaptive_tdee?: number | null
          age?: number | null
          auto_rebalance_enabled?: boolean | null
          biological_sex?: string | null
          body_fat_percentage?: number | null
          competitive_mode?: boolean | null
          created_at?: string | null
          current_phase?: string | null
          current_weight?: number | null
          current_weight_kg?: number | null
          date_of_birth?: string | null
          dietary_type?: string | null
          goal?: string | null
          has_meal_plan_setup_complete?: boolean | null
          height_cm?: number | null
          id?: string
          initial_tdee?: number | null
          is_competitive_mode?: boolean | null
          last_check_in?: string | null
          max_daily_adjustment?: number | null
          meals_per_day?: number | null
          ntd_calories?: number | null
          ntd_carbs?: number | null
          ntd_fat?: number | null
          ntd_protein?: number | null
          preferred_meal_count?: number | null
          primary_goal?: string | null
          protect_protein?: boolean | null
          religious_requirement?: string | null
          sex?: string | null
          target_calories?: number | null
          target_carbs?: number | null
          target_fat?: number | null
          target_protein?: number | null
          target_rate?: number | null
          target_rate_per_week?: number | null
          target_weight_kg?: number | null
          td_calories?: number | null
          td_carbs?: number | null
          td_fat?: number | null
          td_protein?: number | null
          tdee_confidence?: string | null
          training_days_per_week?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          amount_ml: number
          created_at: string | null
          deleted_at: string | null
          id: string
          note: string | null
          source: string | null
          timestamp: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          note?: string | null
          source?: string | null
          timestamp: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          note?: string | null
          source?: string | null
          timestamp?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          created_at: string | null
          day: string
          deleted_at: string | null
          healthkit_identifier: string | null
          id: string
          logged_at: string
          note: string | null
          source: string
          updated_at: string | null
          user_id: string
          value_kg: number
        }
        Insert: {
          created_at?: string | null
          day: string
          deleted_at?: string | null
          healthkit_identifier?: string | null
          id?: string
          logged_at: string
          note?: string | null
          source: string
          updated_at?: string | null
          user_id: string
          value_kg: number
        }
        Update: {
          created_at?: string | null
          day?: string
          deleted_at?: string | null
          healthkit_identifier?: string | null
          id?: string
          logged_at?: string
          note?: string | null
          source?: string
          updated_at?: string | null
          user_id?: string
          value_kg?: number
        }
        Relationships: []
      }
      workout_items: {
        Row: {
          created_at: string | null
          exercise_library_item_id: string | null
          id: string
          is_soft_deleted: boolean | null
          is_warm_up_only: boolean | null
          notes: string | null
          programme_day_id: string | null
          set_type: string | null
          sort_order: number | null
          target_reps_lower: number | null
          target_reps_upper: number | null
          target_rest_seconds: number | null
          target_rpe_lower: number | null
          target_rpe_upper: number | null
          target_sets: number | null
          tempo_string: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_library_item_id?: string | null
          id?: string
          is_soft_deleted?: boolean | null
          is_warm_up_only?: boolean | null
          notes?: string | null
          programme_day_id?: string | null
          set_type?: string | null
          sort_order?: number | null
          target_reps_lower?: number | null
          target_reps_upper?: number | null
          target_rest_seconds?: number | null
          target_rpe_lower?: number | null
          target_rpe_upper?: number | null
          target_sets?: number | null
          tempo_string?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exercise_library_item_id?: string | null
          id?: string
          is_soft_deleted?: boolean | null
          is_warm_up_only?: boolean | null
          notes?: string | null
          programme_day_id?: string | null
          set_type?: string | null
          sort_order?: number | null
          target_reps_lower?: number | null
          target_reps_upper?: number | null
          target_rest_seconds?: number | null
          target_rpe_lower?: number | null
          target_rpe_upper?: number | null
          target_sets?: number | null
          tempo_string?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_items_programme_day_id_fkey"
            columns: ["programme_day_id"]
            isOneToOne: false
            referencedRelation: "programme_days"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          date: string
          deleted_at: string | null
          duration: number | null
          end_time: string | null
          id: string
          location_name: string | null
          notes: string | null
          start_time: string
          training_day_id: string | null
          training_day_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          deleted_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          location_name?: string | null
          notes?: string | null
          start_time: string
          training_day_id?: string | null
          training_day_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          deleted_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          location_name?: string | null
          notes?: string | null
          start_time?: string
          training_day_id?: string | null
          training_day_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_training_day_id_fkey"
            columns: ["training_day_id"]
            isOneToOne: false
            referencedRelation: "training_days"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_coach_client_ids: { Args: never; Returns: string[] }
      is_admin: { Args: never; Returns: boolean }
      is_coach: { Args: never; Returns: boolean }
      is_coach_of: { Args: { client_uuid: string }; Returns: boolean }
      log_audit_event: {
        Args: {
          p_action: Database["public"]["Enums"]["audit_action"]
          p_description?: string
          p_error_message?: string
          p_metadata?: Json
          p_new_values?: Json
          p_old_values?: Json
          p_resource_id?: string
          p_resource_name?: string
          p_resource_type?: string
          p_severity?: Database["public"]["Enums"]["audit_severity"]
          p_success?: boolean
          p_target_user_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      assignment_status:
        | "scheduled"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      audit_action:
        | "auth.login"
        | "auth.logout"
        | "auth.password_change"
        | "auth.password_reset"
        | "auth.mfa_enable"
        | "auth.mfa_disable"
        | "user.create"
        | "user.update"
        | "user.delete"
        | "user.role_change"
        | "user.suspend"
        | "user.reactivate"
        | "subscription.create"
        | "subscription.update"
        | "subscription.cancel"
        | "subscription.payment"
        | "subscription.refund"
        | "coach.client_add"
        | "coach.client_remove"
        | "coach.programme_create"
        | "coach.programme_assign"
        | "coach.meal_plan_create"
        | "coach.meal_plan_assign"
        | "coach.check_in_review"
        | "admin.user_view"
        | "admin.subscription_modify"
        | "admin.ticket_assign"
        | "admin.ticket_resolve"
        | "admin.settings_change"
        | "admin.data_export"
        | "admin.data_delete"
        | "system.error"
        | "system.maintenance"
        | "system.migration"
      audit_severity: "debug" | "info" | "warning" | "error" | "critical"
      check_in_review_status: "pending" | "reviewed" | "flagged" | "archived"
      coach_client_status:
        | "pending"
        | "active"
        | "paused"
        | "completed"
        | "cancelled"
      meal_plan_goal:
        | "weight_loss"
        | "muscle_gain"
        | "maintenance"
        | "performance"
        | "health"
        | "custom"
      message_type: "text" | "image" | "file" | "voice" | "system"
      metric_period: "hourly" | "daily" | "weekly" | "monthly" | "yearly"
      metric_type:
        | "user_count"
        | "active_users"
        | "new_signups"
        | "coach_count"
        | "athlete_count"
        | "check_ins_submitted"
        | "programmes_created"
        | "meal_plans_created"
        | "messages_sent"
        | "revenue"
        | "churn_rate"
        | "retention_rate"
      note_category:
        | "general"
        | "progress"
        | "concern"
        | "goal"
        | "medical"
        | "behaviour"
        | "reminder"
      programme_difficulty: "beginner" | "intermediate" | "advanced" | "elite"
      programme_type:
        | "strength"
        | "hypertrophy"
        | "endurance"
        | "weight_loss"
        | "sport_specific"
        | "rehabilitation"
        | "general_fitness"
        | "custom"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
        | "incomplete"
        | "incomplete_expired"
        | "paused"
      subscription_tier: "free" | "starter" | "professional" | "enterprise"
      ticket_category:
        | "account"
        | "billing"
        | "technical"
        | "feature_request"
        | "bug_report"
        | "coaching"
        | "data_privacy"
        | "other"
      ticket_priority: "low" | "medium" | "high" | "urgent"
      ticket_status:
        | "open"
        | "in_progress"
        | "waiting_on_user"
        | "waiting_on_admin"
        | "resolved"
        | "closed"
      user_role: "client" | "coach" | "admin"
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
      assignment_status: [
        "scheduled",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      audit_action: [
        "auth.login",
        "auth.logout",
        "auth.password_change",
        "auth.password_reset",
        "auth.mfa_enable",
        "auth.mfa_disable",
        "user.create",
        "user.update",
        "user.delete",
        "user.role_change",
        "user.suspend",
        "user.reactivate",
        "subscription.create",
        "subscription.update",
        "subscription.cancel",
        "subscription.payment",
        "subscription.refund",
        "coach.client_add",
        "coach.client_remove",
        "coach.programme_create",
        "coach.programme_assign",
        "coach.meal_plan_create",
        "coach.meal_plan_assign",
        "coach.check_in_review",
        "admin.user_view",
        "admin.subscription_modify",
        "admin.ticket_assign",
        "admin.ticket_resolve",
        "admin.settings_change",
        "admin.data_export",
        "admin.data_delete",
        "system.error",
        "system.maintenance",
        "system.migration",
      ],
      audit_severity: ["debug", "info", "warning", "error", "critical"],
      check_in_review_status: ["pending", "reviewed", "flagged", "archived"],
      coach_client_status: [
        "pending",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      meal_plan_goal: [
        "weight_loss",
        "muscle_gain",
        "maintenance",
        "performance",
        "health",
        "custom",
      ],
      message_type: ["text", "image", "file", "voice", "system"],
      metric_period: ["hourly", "daily", "weekly", "monthly", "yearly"],
      metric_type: [
        "user_count",
        "active_users",
        "new_signups",
        "coach_count",
        "athlete_count",
        "check_ins_submitted",
        "programmes_created",
        "meal_plans_created",
        "messages_sent",
        "revenue",
        "churn_rate",
        "retention_rate",
      ],
      note_category: [
        "general",
        "progress",
        "concern",
        "goal",
        "medical",
        "behaviour",
        "reminder",
      ],
      programme_difficulty: ["beginner", "intermediate", "advanced", "elite"],
      programme_type: [
        "strength",
        "hypertrophy",
        "endurance",
        "weight_loss",
        "sport_specific",
        "rehabilitation",
        "general_fitness",
        "custom",
      ],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
        "incomplete",
        "incomplete_expired",
        "paused",
      ],
      subscription_tier: ["free", "starter", "professional", "enterprise"],
      ticket_category: [
        "account",
        "billing",
        "technical",
        "feature_request",
        "bug_report",
        "coaching",
        "data_privacy",
        "other",
      ],
      ticket_priority: ["low", "medium", "high", "urgent"],
      ticket_status: [
        "open",
        "in_progress",
        "waiting_on_user",
        "waiting_on_admin",
        "resolved",
        "closed",
      ],
      user_role: ["client", "coach", "admin"],
    },
  },
} as const
