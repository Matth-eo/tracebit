import { requireUser } from "@/lib/workspace";
import { PageHeading } from "@/components/workspace-ui";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const user = await requireUser();
  return <>
    <PageHeading eyebrow="YOUR ACCOUNT" title="Profile" description="Make yourself at home. Keep your personal details up to date." />
    <section className="panel profile-panel">
      <div className="profile-panel-heading"><span className="avatar profile-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><h2 className="break-words">{user.name}</h2><p className="form-intro">Your personal Tracebit account</p></div></div>
      <ProfileForm name={user.name} email={user.email} />
    </section>
  </>;
}
