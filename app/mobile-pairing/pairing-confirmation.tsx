'use client';

import { useState } from 'react';

const copy = {
  fr: ['Connecter mes dossiers', 'Confirmez seulement si vous avez créé ce lien dans votre application Accordia.', 'Confirmer et obtenir le code', 'Copiez ce code, puis revenez dans Accordia et collez-le. Gardez-le pour vous.', 'Lien invalide. Créez un nouveau lien dans Accordia.', 'Connexion indisponible. Réessayez ou créez un nouveau lien.', 'Copier le code', 'Code copié'],
  en: ['Connect my reports', 'Confirm only if you created this link in your Accordia app.', 'Confirm and get code', 'Copy this code, return to Accordia and paste it. Keep it to yourself.', 'Invalid link. Create a new link in Accordia.', 'Sign-in unavailable. Retry or create a new link.', 'Copy code', 'Code copied'],
  de: ['Meine Berichte verbinden', 'Bestätigen Sie nur, wenn Sie diesen Link in Ihrer Accordia-App erstellt haben.', 'Bestätigen und Code erhalten', 'Kopieren Sie den Code und fügen Sie ihn in Accordia ein. Geben Sie ihn nicht weiter.', 'Ungültiger Link. Erstellen Sie einen neuen Link in Accordia.', 'Anmeldung nicht verfügbar. Versuchen Sie es erneut oder erstellen Sie einen neuen Link.', 'Code kopieren', 'Code kopiert'],
  nl: ['Mijn dossiers verbinden', 'Bevestig alleen als u deze link in uw Accordia-app hebt aangemaakt.', 'Bevestigen en code ophalen', 'Kopieer de code, keer terug naar Accordia en plak hem. Houd de code voor uzelf.', 'Ongeldige link. Maak een nieuwe link aan in Accordia.', 'Aanmelden niet beschikbaar. Probeer opnieuw of maak een nieuwe link aan.', 'Code kopiëren', 'Code gekopieerd'],
} as const;

export default function PairingConfirmation({ language, challenge, account }: {
  language: keyof typeof copy;
  challenge?: string;
  account?: string;
}) {
  const [title, instruction, confirm, paste, invalid, unavailable, copyCode, copiedCode] = copy[language];
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function issue() {
    if (!challenge || busy || code) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/mobile-pairing', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'error',
        headers: { 'Content-Type': 'application/json', 'x-accordia-request': '1' },
        body: JSON.stringify({ confirm: true, challenge }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('pairing_failed');
      const result = await response.json();
      if (!result || typeof result !== 'object' || !('code' in result) ||
          typeof result.code !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(result.code)) {
        throw new Error('invalid_code');
      }
      setCode(result.code);
    } catch {
      setMessage(unavailable);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main lang={language} style={{ maxWidth: '34rem', margin: 'auto', padding: '1.5rem' }}>
      <h1>{title}</h1>
      {!challenge ? <p>{invalid}</p> : (
        <>
          <p>{instruction}</p>
          <p style={{ overflowWrap: 'anywhere' }}><strong>{account}</strong></p>
          {code ? (
            <>
              <p>{paste}</p>
              <code style={{ overflowWrap: 'anywhere', userSelect: 'all' }}>{code}</code>
              <p><button type="button" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code);
                  setMessage(copiedCode);
                } catch {
                  setMessage(paste);
                }
              }}>{copyCode}</button></p>
            </>
          ) : <button type="button" disabled={busy} onClick={issue}>{confirm}</button>}
          <p role="status">{message}</p>
        </>
      )}
    </main>
  );
}
