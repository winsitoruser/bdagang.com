import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { FaPrint, FaCog } from 'react-icons/fa';

const POSSettingsPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session) {
      // Redirect to hardware settings with a message about the merge
      router.push('/settings/hardware?from=pos');
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 mx-auto border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-700">Mengarahkan ke Pengaturan Hardware...</p>
        <p className="text-sm text-gray-500 mt-2">
          Pengaturan printer dan struk telah dipindahkan ke Pengaturan Hardware
        </p>
      </div>
    </div>
  );
};

export default POSSettingsPage;
