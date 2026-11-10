'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-vantiq-ivory mb-2">Join VANTIQ</h1>
        <p className="text-vantiq-ivory/60">Create your account to get started</p>
      </div>

      <SignUp
        appearance={{
          elements: {
            card: 'bg-vantiq-charcoal border border-vantiq-violet/20',
            headerTitle: 'text-vantiq-ivory',
            headerSubtitle: 'text-vantiq-ivory/60',
            socialButtonsBlockButton: 'bg-vantiq-violet/10 text-vantiq-ivory hover:bg-vantiq-violet/20 border border-vantiq-violet/20',
            dividerLine: 'bg-vantiq-violet/20',
            dividerText: 'text-vantiq-ivory/60',
            formFieldLabel: 'text-vantiq-ivory',
            formFieldInput: 'bg-vantiq-navy border-vantiq-violet/20 text-vantiq-ivory focus:border-vantiq-violet',
            formButtonPrimary: 'bg-vantiq-violet hover:bg-vantiq-violet/90',
            footerActionLink: 'text-vantiq-violet hover:text-vantiq-gold',
          },
        }}
      />
    </div>
  );
}
