'use client';
import TermsOfService from '@/views/legal/TermsOfService';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return <TermsOfService onBack={() => router.push('/')} />;
}
