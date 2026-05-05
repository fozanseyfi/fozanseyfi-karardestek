export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Children ya kendi tam-ekran düzenini sunar (login, signup) ya da
  // ortalı bir kart içerir. Layout sadece arka planı sağlar.
  return <div className="bg-background min-h-screen">{children}</div>;
}
