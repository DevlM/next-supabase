"use client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useCallback, useEffect, useState } from "react";

export default function Animes() {
    const supabase = createClient();
    const [animes, setAnimes] = useState<{ id: string, user_id: string, title: string, note: string | null, top: number }[] | null>();
    const [error, setError] = useState<string | undefined>();
    const [rowError, setRowError] = useState<{ id: string, error: string } | undefined>();
    const [update, setUpdate] = useState<{ id: string, note: string | null, top: number } | undefined>();

    const getData = useCallback(async () => {
        const userRes = await supabase.auth.getUser();
        const { data } = await supabase.from('animes').select().eq('user_id', userRes.data.user?.id)
        setAnimes(data);
    }, [])

    useEffect(() => {
        getData();
    }, [])

    const addAnime = async () => {
        const titleInput = document.getElementsByName('title')[0] as HTMLInputElement;
        const noteInput = document.getElementsByName('note')[0] as HTMLInputElement;
        const topInput = document.getElementsByName('top')[0] as HTMLInputElement;
        if ((animes?.length || 0) >= 10)
            setError("vous pouvez ajouter que 10 animes !")

        if (!titleInput.value || !topInput.value) {
            setError("vous devez spécifier un titre et un top !")
            titleInput.focus();
        } else {
            const findAnime = animes?.find(({ title }) => title.toLowerCase() === titleInput.value.toLowerCase())
            if (findAnime) {
                setError("Un anime avec ce titre est déjà dans votre liste !")
                return;
            }
            const userRes = await supabase.auth.getUser();
            const newTop = parseInt(topInput.value);
            const { data: hasNewTop } = await supabase.from('animes').select().eq('user_id', userRes.data.user?.id).eq('top', newTop).limit(1).single()
            if (hasNewTop) {
                setError("Un anime avec ce top est déjà dans votre liste !")
                return;
            }

            const { error } = await supabase.from('animes').insert({
                user_id: userRes.data.user?.id,
                title: titleInput.value.trim(),
                note: noteInput.value.trim() || null,
                top: newTop
            })

            if (error) {
                setError(error.message);
                return;
            }
            titleInput.value = "";
            noteInput.value = "";
            topInput.value = String(newTop < 10 ? newTop + 1 : newTop);
            setError(undefined);
            getData()
        }
    }

    const removeAnime = async (id: string) => {
        const { error } = await supabase.from('animes').delete().eq('id', id);
        if (error) {
            setRowError({ id, error: error.message })
        } else {
            getData()
        }
    }

    const updateAnime = async (id: string) => {
        const noteInput = document.getElementsByName(`note-${id}`)[0] as HTMLInputElement;
        if (noteInput.value === update?.note)
            // Aucun changement
            return setUpdate(undefined);

        const { error } = await supabase.from('animes').update({
            note: noteInput.value.trim() || null
        }).eq('id', id)
        if (error) {
            setRowError({ id, error: error.message })
        } else {
            getData()
        }

        await updateTop(id)
    }

    const updateTop = async (id: string) => {
        const topInput = document.getElementsByName(`top-${id}`)[0] as HTMLInputElement;
        if (topInput && parseInt(topInput.value) === update?.top)
            // Aucun changement
            return setUpdate(undefined);
        const userRes = await supabase.auth.getUser();
        const newTop = parseInt(topInput.value);
        const { data: oldTopData } = await supabase.from('animes').select().eq('user_id', userRes.data.user?.id).eq('id', id).limit(1).single()
        const { data: hasNewTop } = await supabase.from('animes').select().eq('user_id', userRes.data.user?.id).eq('top', newTop).limit(1).single()
        if (hasNewTop && oldTopData) {
            // Inversion;
            const { error: newTopError } = await supabase.from('animes').update({
                top: newTop
            }).eq('id', id)
            const { error: oldTopError } = await supabase.from('animes').update({
                top: oldTopData.top
            }).eq('id', hasNewTop.id)

            if (newTopError || oldTopError) {
                setRowError({ id, error: newTopError?.message! || oldTopError?.message! })
                return;
            }
        } else {
            const { error } = await supabase.from('animes').update({
                top: newTop
            }).eq('id', id)
            if (error) {
                setRowError({ id, error: error.message })
                return;
            }
        }
        getData();
        setUpdate(undefined);
    }

    return (
        <div className="w-full min-h-[calc(100vh-63.2px)] flex items-center justify-center p-5">
            <div className="space-y-5">
                <section className="space-y-2">
                    <h1>Ajouter un anime</h1>
                    <div className="flex gap-3">
                        <input className="p-2" name="title" placeholder="Nom de l'anime" />
                        <input className="p-2" name="note" placeholder="Note (ex: Trop drôle ! 10/10)" max={128} />
                        <Input className="p-2" name="top" placeholder="ex: 5" type="number" max={10} min={1} defaultValue={(animes?.length || 0) + 1 < 10 ? (animes?.length || 0) + 1 : 10}/>
                        <button className="bg-secondary px-3 py-1 rounded-sm" onClick={addAnime}>Ajouter</button>
                    </div>
                    {error && <p className="text-destructive">{error}</p>}
                </section>
                <section>
                    <h1 className="text-2xl font-semibold">Votre top 10</h1>
                    <div className="flex flex-col gap-3">
                        {animes?.sort((a, b) => a.top - b.top)?.map((anime) => (
                            <div className="bg-secondary/20 hover:bg-secondary/40 shadow-sm p-2 rounded-md flex gap-2">
                                <div className={"flex-1 space-y-1"}>
                                    <div className="flex gap-5">
                                        {update?.id === anime.id ?
                                            <Input
                                                className="w-min"
                                                name={"top-" + anime.id}
                                                autoFocus
                                                placeholder="top"
                                                type="number" max={10} min={1} defaultValue={anime.top}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter')
                                                        updateAnime(anime.id);
                                                }}

                                            /> :
                                            <p className="bg-secondary py-1 px-2 rounded-sm text-xl font-semibold min-w-11 text-center"><span className="text-sm text-muted-foreground">#</span>{anime.top}</p>}
                                        <h2 className="text-xl first-letter:uppercase">{anime.title}</h2>
                                    </div>
                                    {update?.id === anime.id ?
                                        <Input
                                            className="p-2"
                                            name={"note-" + anime.id}
                                            autoFocus
                                            placeholder="note"
                                            defaultValue={update.note || undefined}
                                            max={128}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter')
                                                    updateAnime(anime.id);
                                            }}

                                        /> :
                                        <p className="text-slate-400">{anime.note || "Aucune note ajoutée"}</p>
                                    }
                                    {(rowError?.id === anime.id) && <p className="text-destructive">{rowError.error}</p>}
                                </div>
                                <div className="flex flex-col justify-around gap-1">
                                    <button className="ml-auto w-24 bg-destructive px-3 rounded-sm" onClick={removeAnime.bind(null, anime.id)}>Retirer</button>
                                    {update?.id !== anime.id ?
                                        <button className="ml-auto w-24 bg-muted px-3 rounded-sm" onClick={setUpdate.bind(null, anime)}>Modifier</button> :
                                        <button className="ml-auto w-24 bg-green-600 px-3 rounded-sm" onClick={updateAnime.bind(null, anime.id)}>Enregistrer</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}