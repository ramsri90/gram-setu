import { createClient } from '@supabase/supabase-js';
import { PanchayatProblem, ProblemStatus, UserProfile, UserRole } from '@/types';

const DEFAULT_SUPABASE_URL = 'https://zlzotxryaqagjytmpyft.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsem90eHJ5YXFhZ2p5dG1weWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NDAzMTAsImV4cCI6MjEwMzQxNjMxMH0.GX_V_GF3za3IW-1pdjcr5MZOWgYK5RAeyDZTn2ckVvM';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-supabase') &&
      !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload image to Supabase Storage bucket 'issue-images'
 * If Supabase is not configured, returns a client-side Data URL for instant testing
 */
export async function uploadIssueImage(file: File): Promise<string> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `citizen_uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('issue-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload warning:', error.message);
      } else if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('issue-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn('Error uploading to Supabase Storage, using Data URL fallback:', err);
    }
  }

  // Fallback: convert file to Base64 Data URL for immediate local demonstration
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Fetch live problems from Supabase PostgreSQL table
 */
export async function fetchSupabaseProblems(): Promise<PanchayatProblem[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching problems from Supabase:', error.message);
      return null;
    }

    return data as PanchayatProblem[];
  } catch (err) {
    console.error('Failed to query Supabase problems:', err);
    return null;
  }
}

/**
 * Save new citizen problem to Supabase
 */
export async function insertSupabaseProblem(problem: PanchayatProblem): Promise<PanchayatProblem | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('problems')
      .insert([problem])
      .select()
      .single();

    if (error) {
      console.warn('First insert attempt warning:', error.message);
      // If error is UUID syntax error (e.g. PRB-396 is not a UUID in existing Supabase schema), retry omitting custom string ID
      if (error.message.includes('uuid') || error.message.includes('invalid input syntax')) {
        const { id, ...problemWithoutId } = problem;
        const { data: retryData, error: retryError } = await supabase
          .from('problems')
          .insert([problemWithoutId])
          .select()
          .single();

        if (retryError) {
          console.error('Retry insert error:', retryError.message);
          return null;
        }

        console.log('Successfully inserted problem to Supabase with generated ID:', retryData?.id);
        return retryData as PanchayatProblem;
      }
      return null;
    }

    console.log('Successfully inserted problem to Supabase:', data?.id);
    return data as PanchayatProblem;
  } catch (err) {
    console.error('Failed to insert problem to Supabase:', err);
    return null;
  }
}

/**
 * Update status of an issue (e.g. 'noted', 'in_progress', 'completed')
 */
export async function updateSupabaseProblemStatus(
  problemId: string,
  newStatus: ProblemStatus,
  verifiedBy?: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const updates: Partial<PanchayatProblem> = { status: newStatus };
    if (verifiedBy) updates.verified_by = verifiedBy;

    const { error } = await supabase
      .from('problems')
      .update(updates)
      .eq('id', problemId);

    if (error) {
      console.error('Error updating status in Supabase:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to update problem status:', err);
    return false;
  }
}

/**
 * Delete a problem from Supabase PostgreSQL table
 */
export async function deleteSupabaseProblem(problemId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase
      .from('problems')
      .delete()
      .eq('id', problemId);

    if (error) {
      console.error('Error deleting problem from Supabase:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to delete problem from Supabase:', err);
    return false;
  }
}

/**
 * Citizen Sign Up using Supabase Auth
 */
export async function signUpCitizen(
  email: string,
  password: string,
  fullName: string,
  panchayatName: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    // Return mock successful user profile for offline demo mode
    return {
      user: {
        id: `usr_${Date.now()}`,
        email,
        full_name: fullName,
        role: 'citizen',
        panchayat_name: panchayatName,
      },
      error: null,
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'citizen',
          panchayat_name: panchayatName,
        },
      },
    });

    // If database error or user already registered, try signing in directly!
    if (error) {
      if (
        error.message.includes('Database error saving new user') ||
        error.message.includes('already registered') ||
        error.message.includes('User already exists')
      ) {
        console.warn('User exists or trigger notice, attempting direct sign in:', error.message);
        const signInRes = await signInUser(email, password, 'citizen');
        if (signInRes.user) return signInRes;
      }
      return { user: null, error: error.message };
    }

    if (data.user) {
      const newUserProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: fullName,
        role: 'citizen',
        panchayat_name: panchayatName,
      };

      // Explicit fallback profile insertion into public.profiles
      try {
        await supabase.from('profiles').upsert([newUserProfile], { onConflict: 'id' });
      } catch (upsertErr) {
        console.warn('Profile upsert warning:', upsertErr);
      }

      return {
        user: newUserProfile,
        error: null,
      };
    }

    return { user: null, error: 'Registration failed. Please check credentials.' };
  } catch (err: any) {
    console.error('Sign up error:', err);
    return { user: null, error: err?.message || 'An unexpected error occurred during signup.' };
  }
}

/**
 * Login user (Citizen or Official)
 */
export async function signInUser(
  email: string,
  password: string,
  targetRole: UserRole
): Promise<{ user: UserProfile | null; error: string | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    // Return mock user profile for offline demo mode
    return {
      user: {
        id: `usr_${Date.now()}`,
        email,
        full_name: targetRole === 'official' ? 'District Admin Officer' : 'Village Citizen',
        role: targetRole,
        panchayat_name: 'Rampur Gram Panchayat',
      },
      error: null,
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { user: null, error: error.message };

    if (data.user) {
      const userRole = (data.user.user_metadata?.role as UserRole) || targetRole;
      return {
        user: {
          id: data.user.id,
          email: data.user.email || email,
          full_name: data.user.user_metadata?.full_name || 'Authenticated User',
          role: userRole,
          panchayat_name: data.user.user_metadata?.panchayat_name || 'Rampur Gram Panchayat',
        },
        error: null,
      };
    }

    return { user: null, error: 'Sign in failed.' };
  } catch (err: any) {
    return { user: null, error: err?.message || 'An unexpected error occurred.' };
  }
}
