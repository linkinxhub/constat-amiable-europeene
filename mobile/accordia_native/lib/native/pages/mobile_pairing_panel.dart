part of '../pages.dart';

String pairingText(NativeCopy copy, String key) => const {
  'intro': [
    'Copiez le lien de connexion et ouvrez-le dans votre navigateur. Confirmez avec votre compte Accordia, puis revenez ici et collez le code.',
    'Copy the sign-in link and open it in your browser. Confirm with your Accordia account, then return here and paste the code.',
    'Kopieren Sie den Anmeldelink in Ihren Browser. Bestätigen Sie mit Ihrem Accordia-Konto und fügen Sie den Code hier ein.',
    'Kopieer de aanmeldlink naar uw browser. Bevestig met uw Accordia-account en plak de code hier.',
  ],
  'link': ['Copier le lien', 'Copy link', 'Link kopieren', 'Link kopiëren'],
  'copied': ['Lien copié', 'Link copied', 'Link kopiert', 'Link gekopieerd'],
  'code': ['Code de connexion', 'Sign-in code', 'Anmeldecode', 'Aanmeldcode'],
  'connect': [
    'Connecter mes dossiers',
    'Connect my reports',
    'Berichte verbinden',
    'Dossiers verbinden',
  ],
  'disconnect': [
    'Déconnecter mes dossiers',
    'Disconnect my reports',
    'Berichte trennen',
    'Dossiers ontkoppelen',
  ],
  'error': [
    'Connexion impossible. Vérifiez le code et le lien utilisé. Si le code a expiré, créez un nouveau lien.',
    'Could not connect. Check the code and the link used. If the code expired, create a new link.',
    'Verbindung fehlgeschlagen. Prüfen Sie Code und Link. Erstellen Sie bei Ablauf einen neuen Link.',
    'Verbinding mislukt. Controleer de code en de link. Maak bij verlopen code een nieuwe link.',
  ],
}[key]![copy.language.index];

class MobilePairingPanel extends StatefulWidget {
  const MobilePairingPanel({
    super.key,
    required this.copy,
    required this.pairing,
    required this.onConnected,
  });
  final NativeCopy copy;
  final MobilePairing pairing;
  final VoidCallback onConnected;

  @override
  State<MobilePairingPanel> createState() => _MobilePairingPanelState();
}

class _MobilePairingPanelState extends State<MobilePairingPanel> {
  final code = TextEditingController();
  bool busy = false;
  bool linked = false;
  String? message;

  @override
  void dispose() {
    code.dispose();
    super.dispose();
  }

  Future<void> run(Future<void> Function() action) async {
    if (busy) return;
    setState(() {
      busy = true;
      message = null;
    });
    try {
      await action();
    } catch (_) {
      if (mounted) setState(() => message = 'error');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    String t(String key) => pairingText(widget.copy, key);
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text(t('intro')),
        const SizedBox(height: 16),
        OutlinedButton(
          onPressed: busy
              ? null
              : () => run(() async {
                  final url = await widget.pairing.begin(
                    widget.copy.language.name,
                  );
                  await Clipboard.setData(ClipboardData(text: url.toString()));
                  if (mounted) {
                    code.clear();
                    setState(() {
                      linked = true;
                      message = 'copied';
                    });
                  }
                }),
          child: Text(t('link')),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: code,
          enabled: linked && !busy,
          obscureText: true,
          autocorrect: false,
          enableSuggestions: false,
          decoration: InputDecoration(labelText: t('code')),
        ),
        const SizedBox(height: 12),
        FilledButton(
          onPressed: !linked || busy
              ? null
              : () => run(() async {
                  await widget.pairing.exchange(code.text.trim());
                  if (mounted) widget.onConnected();
                }),
          child: Text(t('connect')),
        ),
        if (busy) const LinearProgressIndicator(),
        if (message != null)
          Semantics(liveRegion: true, child: Text(t(message!))),
      ],
    );
  }
}
