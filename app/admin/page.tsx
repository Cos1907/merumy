'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth/check');
        if (res.ok) {
          router.push('/admin/dashboard');
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#92D0AA] mx-auto mb-4"></div>
        <p className="text-gray-500">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}





