import dynamic from "next/dynamic";
import { Suspense } from "react";

const LoginSuccessClient = dynamic(() => import("@/components/LoginSuccessClient"), {
  ssr: false,
});

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Cargando...</div>}>
      <LoginSuccessClient />
    </Suspense>
  );
}
