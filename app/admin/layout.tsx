/**
 * Minimal /admin shell — only ensures the URL space exists.
 * The real authenticated shell (sidebar, top bar, guards) lives in
 * app/admin/(authenticated)/layout.tsx so that /admin/login can be
 * unauthenticated without falling into a guard loop.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
