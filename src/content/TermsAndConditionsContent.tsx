import Link from 'next/link';

const OPERATOR_NAME = 'MindTune';
const CONTACT_EMAIL = 'legal@example.com';

export function TermsAndConditionsContent() {
  return (
    <>
      <p className="lead text-zinc-300">
        These Terms and Conditions (&quot;Terms&quot;) are the rules for using {OPERATOR_NAME}. By creating an account,
        signing in, or using the service, you agree to these Terms. If you do not agree, do not use {OPERATOR_NAME}.
      </p>

      <h2>1. About the service</h2>
      <p>
        {OPERATOR_NAME} is an online prompt optimization tool. You submit text (typed or spoken), choose a mode
        (Developer, Beginner, or Step-by-step), and the service uses third-party AI models to suggest improved prompts,
        explanations, and edit summaries. Features may include recent history, a personal library, follow-up Q&amp;A,
        share links, and optional voice input in supported browsers.
      </p>
      <p>
        We may change, suspend, or discontinue features at any time. We try to give reasonable notice for major changes
        when practical.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be old enough to form a binding contract where you live (typically at least 13 or 16, depending on
        jurisdiction) and not barred from using the service under applicable law. If you use {OPERATOR_NAME} on behalf
        of an organization, you represent that you have authority to bind that organization to these Terms.
      </p>

      <h2>3. Your account</h2>
      <ul>
        <li>You are responsible for activity under your account and for keeping credentials secure.</li>
        <li>Provide accurate registration information and keep it up to date in Settings.</li>
        <li>Notify us promptly at {CONTACT_EMAIL} if you suspect unauthorized access.</li>
        <li>
          You may delete your account from Settings. Deletion is intended to remove your profile and associated data,
          subject to backups and legal retention requirements.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the service for illegal, harmful, harassing, or fraudulent purposes.</li>
        <li>
          Submit content that violates others&apos; rights (copyright, privacy, trade secrets) or that contains malware,
          spam, or excessive automated traffic.
        </li>
        <li>Attempt to break, probe, or overload the service or other users&apos; accounts.</li>
        <li>Reverse engineer or scrape the service except where law explicitly permits.</li>
        <li>Misrepresent AI output as human-written where that misrepresentation is deceptive or unlawful.</li>
        <li>Circumvent usage limits, authentication, or provider restrictions.</li>
      </ul>
      <p>We may suspend or terminate access if we reasonably believe you violated these rules or pose a risk to the service or others.</p>

      <h2>5. Your content and prompts</h2>
      <p>
        You retain ownership of prompts and other content you submit. To operate the service, you grant us a
        non-exclusive, worldwide, royalty-free license to host, process, transmit, display, and store your content
        solely to provide and improve {OPERATOR_NAME} (including generating optimizations, saving to your library,
        showing history, and creating share links you request).
      </p>
      <p>
        You represent that you have the rights to submit your content and that doing so does not violate any law or
        third-party agreement.
      </p>

      <h2>6. AI output and disclaimers</h2>
      <p>
        <strong>AI-generated text can be wrong, incomplete, biased, or unsafe.</strong> Optimized prompts and
        explanations are suggestions only. You, not {OPERATOR_NAME}, decide whether and how to use them.
      </p>
      <ul>
        <li>Review all output before using it in production systems, medical, legal, financial, or safety-critical contexts.</li>
        <li>Do not rely on the service as professional advice.</li>
        <li>You are responsible for compliance with policies of any platform or API you use optimized prompts on.</li>
      </ul>
      <p>
        The service is provided on an <strong>&quot;as is&quot; and &quot;as available&quot;</strong> basis without warranties of any kind,
        whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement,
        to the fullest extent permitted by law.
      </p>

      <h2>7. Third-party AI providers and API keys</h2>
      <p>
        Optimizations are performed using third-party providers (such as Google, OpenAI, Anthropic, or Groq). Your use
        of those providers is also subject to their terms and policies. You must comply with their acceptable use rules
        and billing terms.
      </p>
      <p>
        If you supply your own API keys (BYOK), you are responsible for key security, provider charges, and compliance.
        We are not liable for provider outages, rate limits, model changes, or data handling by those companies beyond
        what we control.
      </p>

      <h2>8. Share links</h2>
      <p>
        Share links create a read-only view of a specific optimization. Anyone with the link may access that content
        without an account. You are solely responsible for what you share and who receives links. Do not share sensitive
        or confidential information unless you accept that risk.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        The {OPERATOR_NAME} name, logo, interface, and underlying software (excluding your content) are owned by the
        operator or its licensors. You may not copy, modify, or distribute our branding or code except as allowed by law
        or written permission.
      </p>

      <h2>10. Privacy</h2>
      <p>
        Our{' '}
        <Link href="/privacy" className="text-sky-400 hover:text-sky-300">
          Privacy Policy
        </Link>{' '}
        explains how we collect and use personal data. It is incorporated into these Terms by reference.
      </p>

      <h2>11. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the operator and its affiliates, officers, employees, and suppliers
        will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of
        profits, data, goodwill, or business opportunities, arising from your use of the service.
      </p>
      <p>
        Our total liability for any claim relating to the service is limited to the greater of (a) the amount you paid
        us for the service in the twelve months before the claim, or (b) one hundred US dollars (USD $100), except where
        liability cannot be limited under applicable law.
      </p>

      <h2>12. Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless the operator from claims, damages, and expenses (including reasonable
        legal fees) arising from your content, your use of the service, your violation of these Terms, or your violation
        of third-party rights or provider terms.
      </p>

      <h2>13. Termination</h2>
      <p>
        You may stop using the service at any time. We may suspend or terminate your access for violations, risk, legal
        requirements, or discontinuation of the product. Sections that by nature should survive (disclaimers, liability
        limits, indemnity, governing law) will survive termination.
      </p>

      <h2>14. Governing law and disputes</h2>
      <p>
        <strong>Replace this section before launch</strong> with the governing law and dispute resolution approach for
        your business (for example the laws of your country or state, courts or arbitration venue). Until then, parties
        should attempt good-faith resolution by contacting{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-400 hover:text-sky-300">
          {CONTACT_EMAIL}
        </a>
        .
      </p>

      <h2>15. Changes to these Terms</h2>
      <p>
        We may update these Terms. We will post the revised version on this page and update the &quot;Last updated&quot; date.
        Material changes may be notified in-app or by email. Continued use after the effective date constitutes acceptance
        unless law requires a different process.
      </p>

      <h2>16. Contact</h2>
      <p>
        Questions about these Terms:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-400 hover:text-sky-300">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </>
  );
}
