import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const [user] = await db
    .select({ name: users.name, email: users.email, image: users.image, cvUrl: users.cvUrl })
    .from(users)
    .where(eq(users.id, session.user.id));

  return <ProfileForm user={user ?? {}} />;
}
