# TODO: Route LinkedIn Bot Configuration Components

The React UI components for the LinkedIn Bot have been successfully created. However, they are currently unmounted generic components. You need to assign them to a public or user-specific route on your `Getsetjob` Next.js application so users can actually log in and fill out the forms.

## Components Created (Located in `components/linkedin-bot`)
1. `LinkedinProfileForm.tsx` - Handles Salary, Basic Info, Notice Period and Cover Letters.
2. `LinkedinSkillsBuilder.tsx` - Dynamically adds user skills (replaces the Python dictionary).
3. `LinkedinExclusions.tsx` - Adds blacklisted keywords and companies to exclude.

## What You Need To Do:
1. Create a route for this configuration page. For example, create a new file named `app/dashboard/linkedin-bot/page.tsx`
2. Import and stack the components into the page like this:

```tsx
import LinkedinProfileForm from "@/components/linkedin-bot/LinkedinProfileForm";
import LinkedinSkillsBuilder from "@/components/linkedin-bot/LinkedinSkillsBuilder";
import LinkedinExclusions from "@/components/linkedin-bot/LinkedinExclusions";

export default function LinkedinBotPage() {
  return (
    <div className="container mx-auto p-8 max-w-2xl bg-white shadow-md rounded">
      <h1 className="text-3xl font-bold mb-6">LinkedIn Bot Configurator</h1>
      
      <LinkedinProfileForm />
      <LinkedinSkillsBuilder />
      <LinkedinExclusions />
    </div>
  );
}
```

3. Ensure this page is accessible by authenticated users only and link it in your site's navigation menu!
