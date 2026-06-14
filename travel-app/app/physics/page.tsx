import dynamic from "next/dynamic";

const PhysicsDemo = dynamic(
  () => import("@/components/physics/PhysicsDemo"),
  { ssr: false }
);

export default function PhysicsPage() {
  return <PhysicsDemo />;
}
