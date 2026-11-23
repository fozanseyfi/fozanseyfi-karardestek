import type { Metadata } from "next";
import { PlatformsView } from "@/components/common/platforms-view";

export const metadata: Metadata = {
  title: "Platformlarım — KararDestek",
};

export default function PlatformsPage() {
  return <PlatformsView current="karardestek" />;
}
