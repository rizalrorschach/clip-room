import { supabase } from './supabase'

// Function to clean up old rooms (call this periodically)
export async function cleanupOldRooms() {
  try {
    // Delete rooms older than 24 hours
    const { error } = await supabase
      .from('rooms')
      .delete()
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('Failed to cleanup old rooms:', error)
      return false
    }

    console.log('Successfully cleaned up old rooms')
    return true
  } catch (error) {
    console.error('Error during cleanup:', error)
    return false
  }
}

// Function to get cleanup statistics
export async function getCleanupStats() {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('created_at')
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error('Failed to get cleanup stats:', error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error('Error getting cleanup stats:', error)
    return 0
  }
}

// Function to set up periodic cleanup (call this in your app)
export function setupPeriodicCleanup() {
  // Clean up every 6 hours
  const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000 // 6 hours in milliseconds

  const cleanupInterval = setInterval(async () => {
    console.log('Running periodic cleanup...')
    await cleanupOldRooms()
  }, CLEANUP_INTERVAL)

  // Also run cleanup on page load
  cleanupOldRooms()

  return cleanupInterval
} 