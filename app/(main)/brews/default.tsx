import BrewList from "@/components/brews/brew-list";
import { brews } from "@/libs/mocks/brews";

export default function BrewsDefault() {
  return <BrewList brews={brews} />;
}
