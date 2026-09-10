# Progress Report and Certificate Generator

A comprehensive Next.js web application for generating progress reports and certificates for students. Features include admin configuration, level/sub-level management, subject tracking, co-curricular activities, and PDF certificate generation.

## Features

- 📊 **Progress Reports** - Generate detailed student progress reports
- 🎓 **Certificate Generation** - Create customizable certificates in PDF format
- 👤 **Admin Panel** - Manage levels, sub-levels, subjects, and academy settings
- 🏆 **Co-Curricular Activities** - Track and manage student activities
- 📁 **Drag & Drop** - Intuitive file management interface
- 🎨 **Responsive Design** - Works seamlessly on desktop and tablet devices

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The app auto-updates as you edit files in `src/app/`.

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main application
│   ├── add/               # Add/upload page
│   └── admin/             # Admin configuration panel
├── components/            # Reusable React components
├── lib/                   # Utility functions
└── data/
    └── drafts/            # Temporary draft files (gitignored)
```

## Usage

### For Users
1. Navigate to the main page to upload student data
2. Configure progress reports and certificates
3. Generate and download PDF files

### For Admins
1. Go to `/admin` to configure:
   - Academy/organization name
   - Education levels and sub-levels
   - Subjects
   - Co-curricular activities
2. Save changes to persist configuration

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) - React framework with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Tailwind CSS](https://tailwindcss.com)

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository on Vercel
3. Deploy with one click

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.