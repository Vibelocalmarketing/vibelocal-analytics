import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="mb-2 text-3xl font-semibold text-zinc-900">
          Privacy Policy
        </h1>
        <p className="mb-8 text-sm text-zinc-500">Last updated: August 22, 2026</p>

        <div className="flex flex-col gap-6 text-zinc-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              What we collect
            </h2>
            <p>
              When you create an account with VibeLocal Analytics, we collect:
            </p>
            <ul className="mt-2 list-disc pl-6">
              <li>Your email address</li>
              <li>Your name</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              How we use it
            </h2>
            <p>
              We use this information to create and secure your account, let
              you log in, and communicate with you about your account.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              How we store it
            </h2>
            <p>
              Your account data is stored with Supabase, our database and
              authentication provider. Passwords are never stored in plain
              text.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              Cookies
            </h2>
            <p>
              We use a cookie to keep you logged in between visits. We do not
              use cookies for advertising or tracking across other sites.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              Your rights
            </h2>
            <p>
              You can request deletion of your account and all associated
              data at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              Contact
            </h2>
            <p>Questions about this policy: rex@vibelocalmarketing.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
