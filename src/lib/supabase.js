import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ecykvhngdkdzdicammpe.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjeWt2aG5nZGtkemRpY2FtbXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTEyNjEsImV4cCI6MjA5MDgyNzI2MX0.ccIhb-ReE5juDa1YeokSSIdaI-L_nHhZT-JK-_u28ng'

export const supabase = createClient(supabaseUrl, supabaseKey)