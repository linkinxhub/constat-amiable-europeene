import { requireChatGPTUser } from '../chatgpt-auth';
import { validOpaque } from '@/server/mobile-pairing';
import PairingConfirmation from './pairing-confirmation';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function MobilePairingPage({
  searchParams,
}: {
  searchParams: Promise<{ challenge?: string; lang?: string; return?: string }>;
}) {
  const { challenge, lang, return: target } = await searchParams;
  const language = lang === 'en' || lang === 'de' || lang === 'nl' ? lang : 'fr';
  if (!validOpaque(challenge)) return <PairingConfirmation language={language} />;
  const query = new URLSearchParams({ challenge, lang: language });
  if (target === 'android') query.set('return', 'android');
  const user = await requireChatGPTUser('/mobile-pairing?' + query);
  return <PairingConfirmation language={language} challenge={challenge} account={user.email} androidReturn={target === 'android'} />;
}
