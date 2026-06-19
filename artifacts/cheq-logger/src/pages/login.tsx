import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold font-mono tracking-tight text-foreground">
          CHEQ<span className="text-primary">Logger</span>
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Secure cheque register and reporting
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          <Button onClick={login} className="w-full h-11 text-base font-medium">
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
