import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Room = {
  id: string
  code: string
  text_content: string | null
  image_url: string | null
  last_updated: string
  created_at: string
}

// Function to set up automatic cleanup (call this once to set up the scheduled job)
export async function setupAutomaticCleanup() {
  try {
    // Create a scheduled function to delete old rooms
    const { error } = await supabase.rpc('create_cleanup_function', {
      function_name: 'cleanup_old_rooms',
      schedule: '0 */6 * * *', // Run every 6 hours
      sql_function: `
        CREATE OR REPLACE FUNCTION cleanup_old_rooms()
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          -- Delete rooms older than 24 hours
          DELETE FROM rooms 
          WHERE created_at < NOW() - INTERVAL '24 hours';
          
          -- Log the cleanup
          INSERT INTO cleanup_logs (cleaned_at, rooms_deleted)
          VALUES (NOW(), (SELECT COUNT(*) FROM rooms WHERE created_at < NOW() - INTERVAL '24 hours'));
        END;
        $$;
      `
    })

    if (error) {
      console.error('Failed to set up cleanup function:', error)
    } else {
      console.log('Automatic cleanup scheduled successfully')
    }
  } catch (error) {
    console.error('Error setting up automatic cleanup:', error)
  }
}

// Function to manually trigger cleanup (for testing)
export async function triggerCleanup() {
  try {
    const { error } = await supabase.rpc('cleanup_old_rooms')
    if (error) {
      console.error('Failed to trigger cleanup:', error)
    } else {
      console.log('Manual cleanup triggered successfully')
    }
  } catch (error) {
    console.error('Error triggering cleanup:', error)
  }
}
