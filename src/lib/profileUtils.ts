/**
 * Profile utility functions for unified profile completion judgment
 * Single source of truth using database `profiles.onboarding_completed`
 */

import React from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAppStore } from '@/lib/store'
import { getSupabaseClient } from '@/lib/supabaseClient'

/**
 * Check if user has completed onboarding based on database record
 * This is the authoritative check that should be used across the application
 */
export async function isOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not configured')
      return false
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Failed to check onboarding status:', error)
      return false
    }

    return Boolean(profile?.onboarding_completed)
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

/**
 * Hook to check onboarding completion status
 * Provides reactive state that updates when profile changes
 */
export function useIsOnboardingCompleted(): {
  isCompleted: boolean | null
  isLoading: boolean
  refresh: () => Promise<void>
} {
  const [isCompleted, setIsCompleted] = React.useState<boolean | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  const refresh = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsCompleted(false)
        setIsLoading(false)
        return
      }

      const completed = await isOnboardingCompleted(user.id)
      setIsCompleted(completed)
    } catch (error) {
      console.error('Failed to refresh onboarding status:', error)
      setIsCompleted(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return { isCompleted, isLoading, refresh }
}

/**
 * Check if current authenticated user has completed onboarding
 * Convenience function that gets current user and checks their onboarding status
 */
export async function isCurrentUserOnboardingCompleted(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return false
    }

    return await isOnboardingCompleted(user.id)
  } catch (error) {
    console.error('Error checking current user onboarding status:', error)
    return false
  }
}

/**
 * Legacy fallback: Check profile completion using birthDate (deprecated)
 * Only use this as fallback when database check is not available
 * @deprecated Use isOnboardingCompleted instead
 */
export function isProfileCompletedLegacy(profile: any): boolean {
  return Boolean(profile.birthDate && profile.studentType && profile.residenceCity)
}

/**
 * Sync profile completion state to database
 * Should be called when user completes onboarding
 */
export async function markOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not configured')
      return false
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
    
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', userId)

    if (error) {
      console.error('Failed to mark onboarding as completed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error marking onboarding as completed:', error)
    return false
  }
}
