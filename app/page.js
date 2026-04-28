import { Button } from "@/components/ui/button";
import {
  FileText,
  Newspaper,
  PenLine,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";

const actionCards = [
  {
    href: "/blog/my-blogs",
    title: "My Blogs",
    description: "Review your submitted blog posts and continue editing drafts.",
    icon: FileText,
  },
  {
    href: "/blog/create-blog",
    title: "Post A Blog",
    description: "Create a new blog with content, image, and SEO metadata.",
    icon: PenLine,
  },
  {
    href: "/press-releases",
    title: "Press Releases",
    description: "Browse releases by theme, initiative, date, and language.",
    icon: Newspaper,
  },
  {
    href: "/press-releases/create-press-release",
    title: "Post A Press Release",
    description: "Publish a new press-release entry for the Ladli website.",
    icon: PlusCircle,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
            Content Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Manage Ladli stories and press coverage
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Create posts, review submissions, and keep the public website updated
            from one focused dashboard.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actionCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                href={card.href}
                key={card.href}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-rose-50 text-rose-700 transition group-hover:bg-rose-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold text-slate-950">
                  {card.title}
                </h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                  {card.description}
                </p>
                <Button className="mt-5 w-full" variant="outline">
                  Open
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
