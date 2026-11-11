/// Verified against the nine real app/**/page.tsx routes. APIs are not screens.
class NativeRouteSpec {
  const NativeRouteSpec(this.webPath, this.nativePage, this.file);
  final String webPath, nativePage, file;
}

const nativeRouteMap = [
  NativeRouteSpec(
    '/',
    'NativeLandingPage',
    'lib/native/pages/landing_page.dart',
  ),
  NativeRouteSpec('/constat', 'ReportEditor', 'lib/reports/editor.dart'),
  NativeRouteSpec('/join', 'NativeJoinPage', 'lib/native/pages/join_page.dart'),
  NativeRouteSpec(
    '/session/[id]',
    'NativeSessionPage',
    'lib/native/pages.dart',
  ),
  NativeRouteSpec(
    '/account',
    'NativeAccountPage',
    'lib/native/pages/account_page.dart',
  ),
  NativeRouteSpec(
    '/guide',
    'NativeGuidePage',
    'lib/native/pages/guide_page.dart',
  ),
  NativeRouteSpec(
    '/pricing',
    'NativePricingPage',
    'lib/native/pages/pricing_page.dart',
  ),
  NativeRouteSpec(
    '/feedback',
    'NativeFeedbackPage',
    'lib/native/pages/feedback_page.dart',
  ),
  NativeRouteSpec(
    '/admin',
    'NativeAdminPage',
    'lib/native/pages/admin_page.dart',
  ),
];
