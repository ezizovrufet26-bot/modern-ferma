import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Settings, User, Bell, Shield, Smartphone, HardDrive, HelpCircle, HeartPulse, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import LanguageSelector from '@/components/LanguageSelector';
import SettingsClientWrapper from '@/components/SettingsClientWrapper';

export default async function SettingsPage() {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <SettingsClientWrapper session={session} />
  );
}
