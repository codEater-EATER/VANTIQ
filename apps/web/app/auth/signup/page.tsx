'use client';

import { SignUp as ClerkSignUp } from '@clerk/nextjs';

export default function SignUp() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#101827',
      color: '#F6F2EA',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <ClerkSignUp 
          appearance={{
            baseTheme: undefined,
            elements: {
              formButtonPrimary: 'bg-[#C6AD83] text-[#101827] hover:bg-[#B39A6B]',
              card: 'bg-[#1A1D24] text-[#F6F2EA]',
              headerTitle: 'text-[#F6F2EA]',
              headerSubtitle: 'text-[#8C7BB8]',
              formFieldLabel: 'text-[#F6F2EA]',
              formFieldInput: 'bg-[#202124] text-[#F6F2EA] border-[#8C7BB8]',
              socialButtonsBlockButton: 'border-[#8C7BB8] text-[#F6F2EA]',
              dividerLine: 'bg-[#8C7BB8]',
              dividerText: 'text-[#8C7BB8]',
              footer: 'text-[#8C7BB8]',
              footerActionLink: 'text-[#8C7BB8] hover:text-[#C6AD83]',
            },
            layout: {
              logoImageUrl: undefined,
              socialButtonsVariant: 'blockButton',
            }
          }}
          path="/auth/signup"
          routing="path"
          signInUrl="/auth/signin"
        />
      </div>
    </div>
  );
}
