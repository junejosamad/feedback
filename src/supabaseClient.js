import { createClient } from '@supabase/supabase-js'

function cleanEnvValue(value) {
  return value?.trim().replace(/^['"]|['"]$/g, '')
}

const supabaseUrl = cleanEnvValue(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

if (!/^https?:\/\//.test(supabaseUrl)) {
  throw new Error('Invalid VITE_SUPABASE_URL. It must look like https://your-project-ref.supabase.co')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
