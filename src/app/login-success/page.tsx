import { Suspense } from "react";
import LoginSuccessClient from "@/components/LoginSuccessClient";

export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Cargando...</div>}>
      <LoginSuccessClient />
    </Suspense>
  );
}
