import Link from 'next/link';

/** Product-accurate privacy policy. Replace CONTACT_EMAIL and OPERATOR_NAME before production launch. */
const OPERATOR_NAME = 'MindTune';
const CONTACT_EMAIL = 'chiraagv62@gmail.com';

export function PrivacyPolicyContent() {
  return (
    <>
      <p className="lead text-zinc-300">
        This Privacy Policy explains what information we collect when you use {OPERATOR_NAME}, how we use it, who we
        share it with, and the choices you have. We wrote it in plain language so you can understand it without a law
        degree, but it is still a legal document. If anything here conflicts with applicable law, the law wins.
      </p>

      <h2>1. Who we are</h2>
      <p>
        {OPERATOR_NAME} is a web application that helps you turn rough ideas into clearer AI prompts. The service is
        operated by the entity named on this site (replace <strong>{CONTACT_EMAIL}</strong> with your official operator
        name and contact details when you launch publicly).
      </p>
      <p>
        Questions about privacy? Email us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-400 hover:text-sky-300">
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <h2>2. What {OPERATOR_NAME} does (and why that matters for privacy)</h2>
      <p>When you use the product, we typically process:</p>
      <ul>
        <li>
          <strong>Prompt text</strong> you type, paste, or speak (voice is converted to text in your browser when you use
          the microphone).
        </li>
        <li>
          <strong>Optimized results</strong>: rewritten prompts, explanations, and change summaries produced by AI
          models.
        </li>
        <li>
          <strong>Session and history data</strong>: recent runs, Q&amp;A about a tuned prompt, and items you save to
          your library.
        </li>
        <li>
          <strong>Share links</strong>: If you create a share link, a read-only copy of that optimization may be viewed
          by anyone with the link, without signing in.
        </li>
        <li>
          <strong>Account information</strong>: email, username, profile details, and authentication data managed
          through our auth provider.
        </li>
      </ul>

      <h2>3. Information we collect</h2>

      <h3>3.1 Information you provide</h3>
      <ul>
        <li>Account registration data (for example email address and username).</li>
        <li>Prompts and any text you submit for optimization or follow-up Q&amp;A.</li>
        <li>Library titles, collection names, and saved prompt content you choose to store.</li>
        <li>Settings you configure (such as preferred optimization mode or AI provider).</li>
        <li>Communications you send us (support or feedback emails).</li>
      </ul>

      <h3>3.2 Information collected automatically</h3>
      <ul>
        <li>
          <strong>Usage and log data</strong>: timestamps, session identifiers, optimization mode, provider name, model
          name, and technical metadata about requests (for example prompt length). We use this to run Recent prompts,
          history, and basic analytics about how the service is used.
        </li>
        <li>
          <strong>Device and browser data</strong>: IP address, browser type, and similar technical information in
          server logs and auth sessions. This helps us secure the service and troubleshoot issues.
        </li>
        <li>
          <strong>Local storage in your browser</strong>: preferences, optional API keys you enter (see BYOK below),
          cookie consent choices, and similar client-side settings.
        </li>
      </ul>

      <h3>3.3 Sign-in with Google</h3>
      <p>
        If you choose Google sign-in, Google processes your authentication according to Google&apos;s policies. We
        receive account identifiers and profile information Google shares with us (such as email and name) to create and
        maintain your {OPERATOR_NAME} account.
      </p>

      <h2>4. Bring Your Own Key (BYOK)</h2>
      <p>
        You may optionally paste API keys for third-party AI providers (such as Google Gemini, OpenAI, Anthropic, or
        Groq) in Settings. When you use BYOK:
      </p>
      <ul>
        <li>
          Keys are stored in <strong>your browser&apos;s local storage</strong>, scoped to your account identifier on
          that device. They are sent to our servers only when you run an optimization with that provider so we can call
          the provider on your behalf.
        </li>
        <li>
          We do not publish your keys in share links or show them to other users. You are responsible for keeping keys
          confidential and rotating them if compromised.
        </li>
        <li>
          If you use server-configured keys (when the operator provides them), those keys are held by the operator, not
          in your browser.
        </li>
      </ul>

      <h2>5. How we use your information</h2>
      <p>We use personal data and prompt content to:</p>
      <ul>
        <li>Provide, maintain, and improve the optimizer, library, recent history, Q&amp;A, and share features.</li>
        <li>Authenticate you and protect accounts from abuse.</li>
        <li>Generate share links you request and display shared content to link visitors.</li>
        <li>Respond to support requests and enforce our Terms.</li>
        <li>Comply with legal obligations and protect our rights and users&apos; safety.</li>
        <li>
          Measure product usage <strong>only if you consent</strong> to optional analytics cookies (see Section 9).
        </li>
      </ul>
      <p>
        <strong>We do not sell your personal information.</strong> We do not use your private library or account prompts
        to train our own AI models unless we explicitly tell you otherwise in a future update.
      </p>

      <h2>6. AI providers and third parties</h2>
      <p>
        To optimize prompts, text you submit is sent to the AI provider you select (or the default provider). Those
        companies process data under their own terms and privacy policies. You should review:
      </p>
      <ul>
        <li>Google (Gemini)</li>
        <li>OpenAI</li>
        <li>Anthropic</li>
        <li>Groq</li>
      </ul>
      <p>We also use service providers that help us run the app, including:</p>
      <ul>
        <li>
          <strong>Supabase</strong>: authentication, database storage for accounts, optimization logs, saved prompts, and
          Q&amp;A history.
        </li>
        <li>
          <strong>Hosting infrastructure</strong> (for example Vercel or similar): serves the website and API routes.
        </li>
      </ul>
      <p>
        These providers process data on our instructions and for the purposes described in this policy. We require
        appropriate safeguards where applicable.
      </p>

      <h2>7. Share links and public content</h2>
      <p>
        When you create a <strong>share link</strong>, anyone with that link can view the shared optimization (such as
        original prompt, optimized prompt, explanation, and changes) without logging in. Treat share links like
        unlisted URLs: do not include secrets, personal data you would not want public, or confidential business
        information. You are responsible for who you send links to.
      </p>

      <h2>8. Retention and deletion</h2>
      <ul>
        <li>
          <strong>Saved library items</strong>: kept until you delete them in the Library or delete your account.
        </li>
        <li>
          <strong>Recent / optimization history</strong>: kept in your account until you delete individual entries or your
          account.
        </li>
        <li>
          <strong>Share links</strong>: may remain available until the operator removes them or the underlying record is
          deleted. Contact us if you need a share link taken down.
        </li>
        <li>
          <strong>Account deletion</strong>: you can delete your account from Settings. This is intended to remove your
          profile and associated app data subject to backup and legal retention limits.
        </li>
      </ul>

      <h2>9. Cookies and similar technologies</h2>
      <ul>
        <li>
          <strong>Essential</strong>: required for sign-in, security, and core functionality (including storing your cookie
          preference).
        </li>
        <li>
          <strong>Analytics (optional)</strong>: only if you accept analytics in the cookie banner. We use a consent flag
          in local storage; analytics events run only when you opt in and when an analytics ID is configured by the
          operator.
        </li>
      </ul>
      <p>
        You can change preferences via the cookie banner or by clearing site data in your browser (note: this may sign
        you out).
      </p>

      <h2>10. Your rights and choices</h2>
      <p>Depending on where you live, you may have rights to:</p>
      <ul>
        <li>Access, correct, or delete personal data we hold about you.</li>
        <li>Object to or restrict certain processing.</li>
        <li>Withdraw consent where processing is consent-based (such as optional analytics).</li>
        <li>Export your data (contact us for assistance).</li>
        <li>Lodge a complaint with a supervisory authority.</li>
      </ul>
      <p>
        To exercise rights, email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-400 hover:text-sky-300">
          {CONTACT_EMAIL}
        </a>
        . We may need to verify your identity.
      </p>

      <h2>11. Security</h2>
      <p>
        We use reasonable technical and organizational measures (encryption in transit, access controls, authenticated
        APIs, and provider security features). No online service is 100% secure; use a strong password, protect your
        device, and do not share API keys or share links carelessly.
      </p>

      <h2>12. Children</h2>
      <p>
        {OPERATOR_NAME} is not directed at children under 13 (or the minimum age in your country). We do not knowingly
        collect personal information from children. Contact us if you believe a child has provided data and we will take
        appropriate steps.
      </p>

      <h2>13. International users</h2>
      <p>
        Your data may be processed in countries where we or our providers operate (including the United States and other
        regions where Supabase or AI providers host infrastructure). Those countries may have different data protection
        laws than your home country. Where required, we rely on appropriate transfer mechanisms.
      </p>

      <h2>14. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the new version on this page and update the
        &quot;Last updated&quot; date. Material changes may be communicated in-app or by email where appropriate.
        Continued use after changes means you accept the updated policy.
      </p>

      <h2>15. Related documents</h2>
      <p>
        Please also read our{' '}
        <Link href="/terms" className="text-sky-400 hover:text-sky-300">
          Terms and conditions
        </Link>
        , which govern your use of the service.
      </p>
    </>
  );
}
