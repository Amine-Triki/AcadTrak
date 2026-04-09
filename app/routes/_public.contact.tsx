import type { Route } from "./+types/_public.home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AcadTrak | Contact Us" },
    {
      name: "description",
      content:
        "Get in touch with AcadTrak! Have questions or feedback? We'd love to hear from you.",
    },
  ];
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="container mx-auto py-8">
      <h2>Contact Us</h2>
      <p>Have questions or feedback? We'd love to hear from you!</p>
    </div>
  );
}
