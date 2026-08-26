import BrewDetail from "@/components/brews/brew-detail";
import { brews } from "@/libs/mocks/brews";

export default async function BrewDetailPage({
  params,
}: PageProps<"/brews/[id]">) {
  const { id } = await params;
  const brew = brews.find((brew) => brew.id === id);

  if (!brew) return null;

  return <BrewDetail brew={brew} />;
}
