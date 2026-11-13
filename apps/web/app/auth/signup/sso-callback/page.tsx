'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SSOCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Wait for Clerk to complete the OAuth flow, then redirect
    const timer = setTimeout(() => {
      const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
      router.push(redirectUrl);
    }, 2000); // Give Clerk 2 seconds to complete

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#101827',
      color: '#F6F2EA'
    }}>
      <p>Completing sign up...</p>
    </div>
  );
}
