-- =============================================================================
-- STEP 1: FIND AND FIX THE BROKEN TRIGGER
-- Run this first to see what's blocking user creation
-- =============================================================================

-- Show all triggers on auth.users
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users';

-- Show all triggers on public schema too
SELECT trigger_name, event_object_table, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public';
