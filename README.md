# MindTune

**Speak messy. Get precision.**

MindTune is an AI-powered prompt optimiser that transforms rough, unstructured ideas, typed or spoken, into sharp, high-quality prompts. It scores your prompt in real time, explains every change it makes, and saves your full history so you can pick up exactly where you left off.

---

## Features

### Core
- **Voice-to-Prompt**: Click the mic, speak naturally, and MindTune transcribes and tunes your prompt automatically.
- **Live Quality Score**: A circular speedometer scores your optimised prompt from 1 to 100 using RGB colour feedback (red → yellow → green).
- **3 Optimisation Modes**: Developer, Beginner, and Step-by-step. Each mode changes how the AI structures and rewrites your prompt.
- **Streaming Output**: The optimised prompt streams word-by-word, just like ChatGPT.

### Understanding
- **What Changed & Why**: A full breakdown of every edit the AI made, so you can learn prompt engineering as you go.
- **Ask Anything (Q&A)**: A built-in chat lets you ask follow-up questions about your optimised prompt. All conversations are saved.

### Management
- **Full Prompt History**: Every optimised prompt, explanation, change log, and Q&A thread is saved to your account. Click any past session to restore everything.
- **Delete Individual Prompts**: Remove any history entry from the panel.
- **Shareable Links**: Generate a permanent read-only link to share any optimisation with anyone: no account needed to view.

### AI Providers
- **Multiple Providers**: Switch between Gemini 2.5 Flash (default), OpenAI, Anthropic Claude, and Groq/Llama.
- **Bring Your Own Key (BYOK)**: Paste your own API key for any provider. Keys are stored in your browser scoped to your account and never sent to our servers. Includes a built-in key verification test.

### Auth & Account
- **Login / Sign Up**: Secure email and password authentication via Supabase Auth.
- **Username**: Set a unique username at signup, displayed as "Hi, {username}" in the header.
- **Profile Dropdown**: View your registered email and username from the header.
- **Forgot Password**: Sends a reset link to your email. The old password stops working immediately after reset.
- **Delete Account**: Permanently deletes your account, login credentials, and all associated data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + `@tailwindcss/typography` |
| AI SDK | [Vercel AI SDK](https://sdk.vercel.ai/) |
| AI Providers | Google Gemini, OpenAI, Anthropic, Groq |
| Database & Auth | [Supabase](https://supabase.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) |
| Share IDs | [nanoid](https://github.com/ai/nanoid) |
| Voice | Web Speech API (browser-native) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project
- A Google AI (Gemini) API key: or any supported provider key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mindtune.git
cd mindtune
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root of the project:

```env
# Google Gemini (default provider)
GOOGLE_API_KEY=your_google_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: other providers (or users can bring their own keys)
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
# GROQ_API_KEY=
```

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 4. Set up the database

Apply the migrations to your Supabase project. In the Supabase Dashboard, open the **SQL Editor** and run each file in `supabase/migrations/` in order.

The migrations create the following tables:
- `optimization_logs`: stores prompts, scores, explanations, feedback, and share IDs
- `optimization_qa`: stores Q&A conversations per session
- `personal_info`: stores user profiles (email, username)

They also create:
- Row-Level Security (RLS) policies scoped to authenticated users
- Database triggers to cascade deletes across all tables when a user is removed

### 5. Configure Supabase Auth

In your Supabase Dashboard:
1. Go to **Authentication → Settings**
2. Set your **Site URL** (e.g. `http://localhost:3000` or your production URL)
3. Add your app URLs to **Redirect URLs** (e.g. `http://localhost:3000/**`, `https://your-domain.com/**`)
4. Enable **Email** as a sign-in provider
5. Under **Authentication → Providers → Google**, enable Google and save (use Supabase defaults or your own Google OAuth client ID/secret)

#### Google sign-in: show MindTune instead of `*.supabase.co`

Google’s “Choose an account **to continue to** …” line shows the **host that receives the OAuth callback**. With default Supabase Auth, that host is `your-project-ref.supabase.co`, not your app name. The app cannot override that string in code.

**Do both for the best result:**

1. **Google Cloud Console** ([OAuth branding](https://console.cloud.google.com/auth/branding))  
   - App name: **MindTune**  
   - Upload your logo  
   - App home page: your live site (e.g. production `/welcome`)  
   - Privacy policy: `/privacy`  
   - Terms: `/terms`  
   - Submit for verification if Google prompts you (shows name/logo on the consent screen).

2. **Supabase custom domain for Auth** ([docs](https://supabase.com/docs/guides/platform/custom-domains))  
   - Requires a Supabase plan that includes custom domains.  
   - Add something like `auth.yourdomain.com`, complete DNS, activate the domain.  
   - In **Google Cloud → Credentials → your OAuth client**, add redirect URI:  
     `https://auth.yourdomain.com/auth/v1/callback`  
     (keep the existing `https://….supabase.co/auth/v1/callback` until cutover).  
   - Set `NEXT_PUBLIC_SUPABASE_URL=https://auth.yourdomain.com` in `.env` and redeploy.  
   - Google will then show **to continue to auth.yourdomain.com** (use a domain that matches MindTune, e.g. `auth.mindtune.com`).

Until step 2 is done, users will still see the Supabase project URL on that line even if the consent screen title says MindTune.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── optimize/        # Streaming AI optimisation endpoint
│   │   ├── feedback/        # Thumbs up/down + text feedback
│   │   ├── qa/              # Q&A chat endpoint
│   │   ├── qa-history/      # Fetch saved Q&A for a session
│   │   ├── history/         # Fetch recent prompts list
│   │   ├── history/[id]/    # Delete individual prompt
│   │   ├── share/           # Generate shareable link
│   │   ├── verify-key/      # BYOK API key verification
│   │   ├── config/          # Server-side key availability check
│   │   └── auth/
│   │       └── delete-account/  # Permanent account deletion
│   ├── s/[shareId]/         # Read-only shared optimisation page
│   ├── welcome/             # Landing page route
│   └── page.tsx             # Main app entry
├── components/
│   ├── LandingPage.tsx      # Marketing landing page
│   ├── Auth.tsx             # Login / signup / forgot password
│   ├── UpdatePassword.tsx   # Password reset form
│   ├── PromptPerfectApp.tsx # Root app component + auth routing
│   ├── PromptChatBox.tsx    # Prompt input with voice support
│   ├── PromptPerfectForm.tsx # Mode + provider + API key form
│   ├── PromptPerfectActions.tsx # Tune it / Reset buttons
│   ├── PromptPerfectOutputs.tsx # Explanation + changes + Q&A
│   ├── PromptScoreRow.tsx   # Circular quality speedometer
│   ├── PromptQABox.tsx      # Q&A chat interface
│   ├── FeedbackButtons.tsx  # Thumbs up/down + feedback textarea
│   ├── HistoryPanel.tsx     # Slide-in recent prompts panel
│   ├── ShareButton.tsx      # Generate + copy share link
│   ├── SettingsModal.tsx    # Sign out + delete account
│   ├── PromptPerfectHeader.tsx
│   ├── ApiKeyField.tsx      # BYOK key input with test button
│   ├── Select.tsx           # Custom styled dropdown
│   └── ThemeToggle.tsx
├── hooks/
│   ├── useOptimizePrompt.ts # Core optimisation state + API calls
│   ├── useApiConfig.ts      # Server key availability
│   └── useLocalStorageState.ts
└── lib/
    ├── prompts.ts           # System prompts for each mode
    ├── promptScore.ts       # Heuristic 0–100 quality scoring
    ├── providers.ts         # AI provider + model management
    ├── types.ts             # Shared TypeScript types
    └── client/
        └── supabase.ts      # Supabase client singleton
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | Yes (default) | Google Gemini API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `OPENAI_API_KEY` | Optional | OpenAI server key |
| `ANTHROPIC_API_KEY` | Optional | Anthropic server key |
| `GROQ_API_KEY` | Optional | Groq server key |

---

## Deploying to Vercel

1. Push your repository to GitHub
2. Import the project in [Vercel](https://vercel.com/)
3. Add all environment variables from the table above in **Project Settings → Environment Variables**
4. Update your Supabase **Site URL** and **Redirect URLs** to your Vercel deployment URL
5. Deploy

---

## License

MIT
