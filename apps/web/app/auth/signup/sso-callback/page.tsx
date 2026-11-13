'use client';

import { useClerk } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SSOCallback() {
  const { session } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (session) {
      const redirectUrl = searchParams.get('redirect_url') || '/dashboard';
      router.push(redirectUrl);
    }
  }, [session, router, searchParams]);

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
