import { useAuth } from "@/lib/local-auth";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f0f0]">
      <Header title="Sign In" showLogout={false} />
      
      <main className="flex-1 px-[142px] py-8 flex items-center justify-center">
        <div className="w-full max-w-[400px] bg-white p-10 rounded-[8px] border border-[#BBBBBB] shadow-sm text-center">
          <h2 className="text-[24px] font-semibold font-['Livvic'] text-[#002f5c] mb-2">
            Welcome to CHEQ Logger
          </h2>
          <p className="text-[#3d3d3d] font-['Mulish'] mb-8">
            Secure cheque register and reporting
          </p>
          <Button onClick={login} className="w-full">
            Sign in
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}