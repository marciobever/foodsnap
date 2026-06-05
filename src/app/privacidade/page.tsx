'use client';
import PrivacyPolicy from '@/views/legal/PrivacyPolicy';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return <PrivacyPolicy onBack={() => router.push('/')} />;
}
