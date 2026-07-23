import { AvaHub } from "@/components/features/ava/ava-hub";

export default async function AvaPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <div className="min-h-dvh bg-black">
      <AvaHub token={token ?? ""} />
    </div>
  );
}
