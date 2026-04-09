import type { Route } from "./+types/_public.home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AcadTrak | Home" },
    {
      name: "description",
      content:
        "Welcome to AcadTrak , your ultimate learning companion! , LMS paltform , create your own learning path , with Amine Triki",
    },
  ];
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="container mx-auto py-8">
      <h2>welcometo AcadTrak</h2>
    </div>
  );
}
