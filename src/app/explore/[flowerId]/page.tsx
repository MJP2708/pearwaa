import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ENCYCLOPEDIA_FLOWERS, getEncyclopediaFlower } from "@/data/flower-encyclopedia";
import { FlowerDetailClient } from "@/components/flower3d/flower-detail-client";

export function generateStaticParams() {
  return ENCYCLOPEDIA_FLOWERS.map((f) => ({ flowerId: f.id }));
}

type Props = { params: Promise<{ flowerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { flowerId } = await params;
  const flower = getEncyclopediaFlower(flowerId);
  if (!flower) return { title: "Flower not found — Pearwaa" };
  return {
    title: `${flower.commonName} — Pearwaa`,
    description: flower.hanakotoba,
  };
}

export default async function FlowerDetailPage({ params }: Props) {
  const { flowerId } = await params;
  const flower = getEncyclopediaFlower(flowerId);
  if (!flower) notFound();
  return <FlowerDetailClient flower={flower} />;
}
