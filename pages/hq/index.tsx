import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HQIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/hq/home');
  }, [router]);
  
  return null;
}
