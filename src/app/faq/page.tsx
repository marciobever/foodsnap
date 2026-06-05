'use client';
import FAQPage from '@/views/FAQPage';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return <FAQPage onBack={() => router.push('/')} />;
}
