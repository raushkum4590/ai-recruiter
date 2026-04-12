"use client"
import { UserDetailContext } from '@/context/UserDetailContext';
import { supabase } from './../services/superbaseClient';
import React, { useContext, useEffect, useState } from 'react';

function Provider({ children }) {
  const [user, setUser] = useState();
    
  useEffect(() => {
    createNewUser();
    
    // Handle session updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        createNewUser();
      }
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [])
    
  const createNewUser = async () => {
    try {
      // Clear any invalid sessions that might cause clock skew errors
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          
          if (!authUser) {
            // Session is invalid, clear it
            await supabase.auth.signOut();
            return;
          }
        } catch (error) {
          // Clock skew or invalid token, try to refresh
          console.warn("Session validation error, attempting refresh:", error.message);
          await supabase.auth.refreshSession();
          return;
        }
      }
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
                    
      if (!authUser) return;
        
      const { data: Users, error: fetchError } = await supabase
        .from('Users')
        .select('*')
        .eq('email', authUser.email);
        
      console.log('Users:', Users);
                    
      if (fetchError) {
        console.error("Error fetching user:", fetchError.message);
        return;
      }
        
      if (Users?.length === 0) {
        const { data, error } = await supabase
          .from("Users")
          .insert([
            {
              name: authUser?.user_metadata?.name,
              email: authUser?.email,
              picture: authUser?.user_metadata?.picture,
            }
          ])
          .select(); // Add this to return the inserted data
            
        if (error) {
          console.error("Data insertion error:", error.message);
        } else {
          console.log('New User:', data);
          // Set the user state with the newly created user
          setUser(data[0]);
        }
      } else {
        // Set the user state with the existing user
        setUser(Users[0]);
      }
    } catch (error) {
      console.error("Authentication error:", error.message);
      // If it's a clock skew error, clear the session and try again
      if (error.message?.includes('future') || error.message?.includes('skew')) {
        try {
          await supabase.auth.signOut();
          // Clear local storage of any cached tokens
          localStorage.removeItem('sb-ypndnsyvgkxcuuhrhnjs-auth-token');
          window.location.reload();
        } catch (logoutError) {
          console.error("Logout error:", logoutError.message);
        }
      }
    }
  }
    
  return (
    <UserDetailContext.Provider value={{user, setUser}}>
      <div>
        {children}
      </div>
    </UserDetailContext.Provider>
  )
}

export default Provider;

export const useUser = () => {
  const context = useContext(UserDetailContext);
  if (!context) {
    throw new Error('useUser must be used within a UserDetailContext.Provider');
  }
  return context;
};
