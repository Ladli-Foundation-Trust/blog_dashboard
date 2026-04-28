'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axios from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

const Page = ({ searchParams }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const callbackUrl = searchParams?.callbackUrl;

  //    validation
  const validateForm = ({ email, password }) => {
    const errors = {};

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Enter a valid email address';
    }

    if (!password.trim()) {
      errors.password = 'Password is required';
    } else if (
      !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        password
      )
    ) {
      errors.password =
        'Password must be at least 8 characters long and include a letter, a number, and a symbol';
    }

    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const errors = validateForm({ email, password });
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        '/user/login',
        { email, password },
        { withCredentials: true }
      );      

      sessionStorage.setItem('access_token', res.data.accessToken);

      toast.success('Login successful!');
      window.location.href = callbackUrl || '/';
    } catch (error) {
      console.log(error, 'error-login');

      toast.error(error.response?.data?.message || 'Unable to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-rose-100 text-rose-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
            Ladli Foundation
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Dashboard Sign In
          </h1>
        </div>

        <Card className="w-full border-slate-200 shadow-sm">
          <CardHeader className="space-y-1 border-b border-slate-100 pb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Continue to your workspace
            </h2>
            <p className="text-sm text-slate-600">
              Use your authorized account to manage content.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    className="pl-9"
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs font-medium text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    className="pl-9"
                    required
                  />
                </div>
                {formErrors.password && (
                  <p className="text-xs font-medium text-red-600">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
