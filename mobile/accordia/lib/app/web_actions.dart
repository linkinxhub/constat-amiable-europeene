import '../design/horizon/copy.dart';

enum WebAction { start, join, drafts, reports, account, help }

Uri websiteAction(WebAction action, HorizonLanguage language) => Uri.https(
  'accordia-constat.adil-btp.chatgpt.site',
  switch (action) {
    WebAction.start || WebAction.drafts => '/constat',
    WebAction.join => '/join',
    WebAction.reports || WebAction.account => '/account',
    WebAction.help => '/guide',
  },
  {'lang': language.name},
);
