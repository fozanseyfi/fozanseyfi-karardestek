export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">EPC Karar Destek</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            GES &amp; RES projeleri için akıllı teklif karşılaştırma
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
