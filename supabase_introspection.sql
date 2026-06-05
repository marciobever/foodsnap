-- ============================================================
-- FOODSNAP - SUPABASE FULL INTROSPECTION (SINGLE JSON OUTPUT)
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor)
-- Retorna TUDO em um único JSON
-- ============================================================

SELECT jsonb_build_object(

  -- 1. TABLES & COLUMNS
  'tables', (
    SELECT jsonb_agg(jsonb_build_object(
      'table', t.table_name,
      'column', c.column_name,
      'type', c.data_type,
      'udt', c.udt_name,
      'default', c.column_default,
      'nullable', c.is_nullable
    ) ORDER BY t.table_name, c.ordinal_position)
    FROM information_schema.tables t
    JOIN information_schema.columns c 
      ON t.table_name = c.table_name AND t.table_schema = c.table_schema
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
  ),

  -- 2. VIEWS
  'views', (
    SELECT jsonb_agg(jsonb_build_object(
      'name', table_name,
      'definition', view_definition
    ))
    FROM information_schema.views
    WHERE table_schema = 'public'
  ),

  -- 3. FOREIGN KEYS
  'foreign_keys', (
    SELECT jsonb_agg(jsonb_build_object(
      'table', tc.table_name,
      'column', kcu.column_name,
      'ref_table', ccu.table_name,
      'ref_column', ccu.column_name,
      'constraint', tc.constraint_name
    ))
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  ),

  -- 4. PRIMARY KEYS & UNIQUE
  'primary_keys', (
    SELECT jsonb_agg(jsonb_build_object(
      'table', tc.table_name,
      'constraint', tc.constraint_name,
      'type', tc.constraint_type,
      'column', kcu.column_name
    ))
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.table_schema = 'public' AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
  ),

  -- 5. CHECK CONSTRAINTS
  'check_constraints', (
    SELECT jsonb_agg(jsonb_build_object(
      'table', tc.table_name,
      'constraint', tc.constraint_name,
      'check', cc.check_clause
    ))
    FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc
      ON tc.constraint_name = cc.constraint_name AND tc.constraint_schema = cc.constraint_schema
    WHERE tc.table_schema = 'public' AND tc.constraint_type = 'CHECK'
  ),

  -- 6. INDEXES
  'indexes', (
    SELECT jsonb_agg(jsonb_build_object(
      'table', tablename,
      'index', indexname,
      'def', indexdef
    ))
    FROM pg_indexes
    WHERE schemaname = 'public'
  ),

  -- 7. RLS POLICIES
  'rls_policies', (
    SELECT jsonb_agg(jsonb_build_object(
      'table', tablename,
      'policy', policyname,
      'permissive', permissive,
      'roles', roles,
      'cmd', cmd,
      'qual', qual,
      'with_check', with_check
    ))
    FROM pg_policies
    WHERE schemaname = 'public'
  ),

  -- 8. FUNCTIONS
  'functions', (
    SELECT jsonb_agg(jsonb_build_object(
      'name', p.proname,
      'args', pg_get_function_arguments(p.oid),
      'returns', pg_get_function_result(p.oid),
      'definition', pg_get_functiondef(p.oid)
    ))
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
  ),

  -- 9. TRIGGERS
  'triggers', (
    SELECT jsonb_agg(jsonb_build_object(
      'name', trigger_name,
      'event', event_manipulation,
      'table', event_object_table,
      'action', action_statement,
      'timing', action_timing
    ))
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
  ),

  -- 10. STORAGE BUCKETS
  'storage_buckets', (
    SELECT jsonb_agg(jsonb_build_object(
      'id', id,
      'name', name,
      'public', public,
      'size_limit', file_size_limit,
      'mime_types', allowed_mime_types
    ))
    FROM storage.buckets
  ),

  -- 11. STORAGE POLICIES
  'storage_policies', (
    SELECT jsonb_agg(jsonb_build_object(
      'policy', policyname,
      'table', tablename,
      'cmd', cmd,
      'qual', qual,
      'with_check', with_check
    ))
    FROM pg_policies
    WHERE schemaname = 'storage'
  ),

  -- 12. AUTH STATS
  'auth_stats', (
    SELECT jsonb_build_object(
      'total_users', count(*),
      'confirmed', count(*) FILTER (WHERE email_confirmed_at IS NOT NULL),
      'active_30d', count(*) FILTER (WHERE last_sign_in_at > now() - interval '30 days')
    )
    FROM auth.users
  ),

  -- 13. ROW COUNTS
  'row_counts', (
    SELECT jsonb_agg(jsonb_build_object(
      'table', relname,
      'rows', n_live_tup
    ) ORDER BY n_live_tup DESC)
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
  ),

  -- 14. EXTENSIONS
  'extensions', (
    SELECT jsonb_agg(jsonb_build_object(
      'name', extname,
      'version', extversion
    ))
    FROM pg_extension
  ),

  -- 15. REALTIME
  'realtime_tables', (
    SELECT jsonb_agg(jsonb_build_object(
      'pub', pubname,
      'schema', schemaname,
      'table', tablename
    ))
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
  ),

  -- 16. ENUMS
  'enums', (
    SELECT jsonb_agg(jsonb_build_object(
      'type', t.typname,
      'value', e.enumlabel
    ))
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE n.nspname = 'public'
  )

) AS full_introspection;
