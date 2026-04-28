'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import axios from '@/lib/axiosInstance';
import { useRouter, usePathname } from 'next/navigation';

const protectedRoutes = [
  '/blog',
  '/blog/my-blogs',
  '/blog/create-blog',
  '/blog/all-blogs',
  '/press-releases',
  '/press-releases/create-press-release',
];

const publicOnlyRoutes = ['/login'];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicOnlyRoute = publicOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const setAccessToken = (token) => {
    sessionStorage.setItem('access_token', token);
    setIsAuthenticated(true);
  };

  const checkAuthStatus = async () => {
    try {
      const res = await axios.get('/user/me');

      setUser(res.data.data.user);
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        return false;
      }
      return false;
    }
  };

  const logoutHandler = async () => {
    try {
      await axios.post(
        '/user/logout',
        {},
        {
          withCredentials: true,
          headers: { 'X-Logout-Request': 'true' },
        }
      );
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsAuthenticated(false);
      sessionStorage.removeItem('access_token');
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const isAuth = await checkAuthStatus();

      setIsAuthenticated(isAuth);

      // Redirect logic
      if (isProtectedRoute && !isAuth) {
        console.log(
          'Redirecting to login: protected route without authentication'
        );
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      if (isPublicOnlyRoute && isAuth) {
        console.log(
          'Redirecting to home: authenticated user accessing public-only route'
        );
        router.push('/');
        return;
      }

      setLoading(false);
    };

    initAuth();
  }, [isProtectedRoute, isPublicOnlyRoute, pathname, router]);

  // Show loading spinner only during initial auth check for protected routes
  if (loading && isProtectedRoute) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setAccessToken, // Add this back
        logoutHandler,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
