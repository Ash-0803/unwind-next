import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
}

class AuthService {
  // Sign up new user
  async signUp(email: string, password: string, name?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      });

      if (error) throw error;
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      } : null;
    } catch (error) {
      return null;
    }
  }

  // Listen to auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name
        });
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
