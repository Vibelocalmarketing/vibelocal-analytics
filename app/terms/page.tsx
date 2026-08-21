import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <h1 className="mb-2 text-3xl font-semibold text-zinc-900">
          Terms of Service
        </h1>
        <p className="mb-8 text-sm text-zinc-500">Last updated: August 22, 2026</p>

        <div className="flex flex-col gap-6 text-zinc-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              Using VibeLocal Analytics
            </h2>
            <p>
              By creating an account, you agree to use VibeLocal Analytics
              only for lawful purposes and to keep your login credentials
              secure.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              Accounts
            </h2>
            <p>
              You&apos;re responsible for the accuracy of the information you
              provide and for all activity under your account. You may
              request deletion of your account at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              Service availability
            </h2>
            <p>
              VibeLocal Analytics is provided &quot;as is,&quot; without
              warranty of any kind. We may change or discontinue features at
              any time.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              Changes to these terms
            </h2>
            <p>
              We may update these terms as the product changes. Continued use
              of the app after an update means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">
              Contact
            </h2>
            <p>Questions about these terms: rex@vibelocalmarketing.com</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
