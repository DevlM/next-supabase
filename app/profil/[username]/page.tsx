import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";



export async function generateMetadata({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const { username } = await params
    const supabase = createClient();
    const { data: profile, error } = await supabase.from('profiles').select().eq('username', username).limit(1).single()
    if (!profile || error)
        return notFound();

    const { data: animes } = await supabase.from('animes').select().eq('user_id', profile.id)

    return {
        title: profile.username,
        description: animes ? `Top 10 Animes de ${profile.username} : ${animes.map((a) => a.title).join(', ')}` : ""
    }
}

export default async function DynamicPage({
    params,
}: {
    params: Promise<{ username: string }>
}) {
    const supabase = createClient();
    const { username } = await params;
    const { data: profile } = await supabase.from('profiles').select().eq('username', username).limit(1).single()
    const { data: animes } = await supabase.from('animes').select().eq('user_id', profile.id)

    return (
        <div className="min-h-[calc(100vh-63.2px)] flex flex-col justify-center items-center p-5">
            <h1 className="text-3xl">{profile.username}</h1>
            <div className="bg-card rounded-sm p-3 min-w-[300px]">
                <h1 className="text-2xl">Top 10 Animes</h1>
                <div className="flex flex-col gap-3">
                    {animes?.sort((a, b) => a.top - b.top)?.map((anime) => (
                        <div className="bg-secondary/20 hover:bg-secondary/40 shadow-sm p-2 rounded-md flex gap-2">
                            <div className="space-y-1">
                                <div className="flex gap-5">
                                    <p className="bg-secondary py-1 px-2 rounded-sm text-xl font-semibold min-w-11 text-center"><span className="text-sm text-muted-foreground">#</span>{anime.top}</p>
                                    <h2 className="text-xl first-letter:uppercase">{anime.title}</h2>
                                </div>

                                <p className="text-slate-400">{anime.note || "Aucune note ajoutée"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
