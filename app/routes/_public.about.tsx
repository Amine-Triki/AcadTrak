import type { Route } from "./+types/_public.about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AcadTrak | About Us" },
    {
      name: "description",
      content:
        "Learn more about AcadTrak, our mission, and how we are revolutionizing the learning experience for students and educators alike.",
    },
  ];
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  return (
    <div className="container mx-auto py-8">
      <h2>About Us</h2>
      <p>Welcome to AcadTrak! We are dedicated to providing the best learning experience for students and educators.</p >
    </div>
  );
}
