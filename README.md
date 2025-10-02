# SN Chatbot — Vercel‑ready Next.js Starter

A minimal, production‑ready template to deploy an AI coaching bot for Social Capital Academy (SCA) on Vercel. It focuses on social capital building for URM/first‑gen students: approach orientation, conversational skill, and strategic clarity.

## Quick Start (Vercel)

### 1) Scaffold
```bash
npx create-next-app@latest sn-chatbot --typescript --eslint --app --tailwind --src-dir --import-alias "@/*"
cd sn-chatbot
```

### 2) Install dependencies
```bash
npm i openai zod uuid @types/uuid
```

### 3) Set environment variable in Vercel
- Go to Settings → Environment Variables
- Add: `OPENAI_API_KEY=<your OpenAI API key>`

### 4) Run locally
```bash
npm run dev
```

### 5) Deploy
```bash
npx vercel --prod
```

## Features

- **Edge Runtime**: Fast cold starts on Vercel
- **Streaming Responses**: Real-time AI responses
- **Student Profile**: Personalized coaching based on background
- **Local Storage**: Persistent chat history and profile
- **Responsive Design**: Works on mobile and desktop
- **TypeScript**: Full type safety

## System Prompt

The AI coach is specifically designed for URM/first-generation students with:

- **Empathy-first approach**: Validates uncertainty and anxiety
- **Small steps**: Always proposes concrete, achievable actions
- **Equity lens**: Acknowledges barriers without pity
- **Proactive coaching**: Suggests pathways, role-play, and practice

### Priority Areas:
1. **Approach Orientation** — Reduce anxiety, build confidence
2. **Conversational Skill** — Storytelling, questions, follow-up
3. **Strategic Clarity** — Identify interests, map next steps

## Example Student Flows

Try these as first messages during demos:

**A) "I'm not sure what to do next."**
- Expects: normalization → diagnostic questions → pathway proposal

**B) "There's a job fair and I don't know if I should go."**
- Expects: confidence framing → micro-plan → openers → follow-up

**C) "I don't know what to say in an informational interview."**
- Expects: 30-sec intro → smart questions → thank-you note

**D) "I have an interview and I'm nervous."**
- Expects: asset reframing → practice questions → STAR template

## Project Structure

```
src/
├── app/
│   ├── api/chat/route.ts    # Edge API route with streaming
│   ├── globals.css          # Tailwind + custom styles
│   └── page.tsx            # Main page
├── components/
│   ├── Chat.tsx            # Main chat interface
│   └── CoachTips.tsx       # Help text component
└── lib/
    ├── prompt.ts           # System prompt
    └── types.ts            # TypeScript definitions
```

## Technology Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **OpenAI GPT-4o-mini** for AI responses
- **Zod** for request validation
- **UUID** for message IDs
- **Edge Runtime** for fast deployment

## Privacy & Analytics

- Uses only anonymous localStorage by default
- No server-side transcript storage
- Consider Vercel Analytics or PostHog for pilots
- Add consent toggle for server-side storage if needed

## Extending the Coach

Optional enhancements:
- **Role-play mode**: Toggle between interviewer/mentor personas
- **Checklists**: Export micro-plans as downloadable checklists
- **Campus resources**: School-specific links sidebar
- **Badges**: Streaks for thank-yous and event attendance

## License

© 2024 Social Capital Academy — SCA Coach (beta)