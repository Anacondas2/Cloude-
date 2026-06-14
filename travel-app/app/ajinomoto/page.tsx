import dynamic from "next/dynamic";

const AjinomotoExperience = dynamic(
  () => import("@/components/ajinomoto/AjinomotoExperience").then(m => m.AjinomotoExperience),
  { ssr: false }
);

export default function AjinomotoPage() {
  return <AjinomotoExperience />;
}
