'use client';
import DataDeletion from '@/views/legal/DataDeletion';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  return <DataDeletion onBack={() => router.push('/')} />;
}
