import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase.from('profiles').select().eq('id', user?.id).limit(1).single();

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div>
            <Badge
              variant={"default"}
              className="font-normal pointer-events-none"
            >
              Please update .env.local file with anon key and url
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              variant={"outline"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-in">Se connecter</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={"default"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-up">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }
  return user ? (
    <div className="flex items-center gap-4">
      Salut {profile?.username || error?.message} !
      <Button asChild size="sm" variant={"ghost"}>
        <Link href={"/profil/" + profile.username}>Mon profil</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/dashboard">Modifier mon top</Link>
      </Button>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Déconnexion
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/sign-in">Se connecter</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">S'inscrire</Link>
      </Button>
    </div>
  );
}
