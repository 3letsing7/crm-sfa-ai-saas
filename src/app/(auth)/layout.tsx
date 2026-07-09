export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground">
            M
          </div>
          <h1 className="text-lg font-semibold">MeilleureVieSales</h1>
          <p className="text-sm text-muted-foreground">AI営業活動支援SaaS</p>
        </div>
        {children}
      </div>
    </div>
  );
}
