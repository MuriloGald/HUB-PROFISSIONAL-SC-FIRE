import { CheckInFlow } from "@/components/features/turmas/check-in-flow";

export default async function CheckInPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <div className="min-h-dvh bg-black flex items-center justify-center p-4">
      <CheckInFlow token={token ?? ""} />
    </div>
  );
}
