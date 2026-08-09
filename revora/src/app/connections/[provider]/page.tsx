"use client";

import { useParams } from "next/navigation";
import { Shell } from "@/components/shell";
import { ProviderDetail } from "@/components/provider-detail";

export default function ProviderPage() {
  const params = useParams();
  const provider = params.provider as string;
  return (
    <Shell>
      <ProviderDetail provider={provider} />
    </Shell>
  );
}
