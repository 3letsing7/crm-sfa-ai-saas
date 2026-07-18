export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-base font-bold text-primary-foreground">
            M
          </div>
          <p className="text-sm text-muted-foreground">MeilleureVieSales お支払い</p>
        </div>
        {children}
      </div>
    </div>
  );
}
