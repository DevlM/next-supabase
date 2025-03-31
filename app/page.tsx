import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from('profiles').select().limit(10);

  return (
    <>
      <Hero />
      <main className="flex flex-col items-center gap-6 px-4 min-h-[calc(100vh-63.2px)]">
        <h1 className="text-2xl">Visitez les profils des autres membres !</h1>
        <div className="min-w-60 flex flex-col gap-5">
          {profiles?.map((p) => (
            <div className="bg-secondary w-full p-2 flex items-center rounded-md">
              <h2 className="text-xl font-semibold">{p.username}</h2>
              <Button className="ml-auto" variant={'default'}>
                <Link href={`/profil/${p.username}`}>Voir</Link>
              </Button>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
