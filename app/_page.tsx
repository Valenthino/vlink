import { headers } from "next/headers";

export default async function Index() {
  const headersList = headers();
  const host = headersList.get("host") || "";

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <div className="w-full">
        <div className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                URL Shortener
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                A modern URL shortening service built with Next.js and MongoDB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
