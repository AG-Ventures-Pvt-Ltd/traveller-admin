import { redirect } from 'next/navigation';

// Root always redirects — auth check is handled by MainLayout
export default function Home() {
    redirect('/dashboard');
}

