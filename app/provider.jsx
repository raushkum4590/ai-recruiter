"use client"
import { UserDetailContext } from '@/context/UserDetailContext';
import { supabase } from './../services/superbaseClient';
import React, { useContext, useEffect, useState } from 'react';

function Provider({ children }) {
  const [user, setUser] = useState();
    
  useEffect(() => {
    createNewUser();
  }, [])
    
  const createNewUser = async () => {
    try {
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
