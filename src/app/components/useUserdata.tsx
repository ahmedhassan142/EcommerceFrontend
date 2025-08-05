// hooks/useUserData.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useUserData = (userId?: string) => {
  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.AUTH_SERVICE_URL}/api/auth/basic/${userId}`
        );
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Failed to load user data');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};