// Mock data for Career UI (replace with Supabase later)
export interface Application {
  id: string;
  title: string;
  company: string;
  location?: string;
  status: 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Rejected' | 'Ghosted';
  appliedDate: string; // ISO date string
}

export interface Resume {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
}

export interface Profile {
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

export const mockApplications: Application[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'ABC Corp',
    location: 'Remote',
    status: 'Applied',
    appliedDate: '2024-03-12',
  },
  {
    id: '2',
    title: 'Junior Developer',
    company: 'XYZ Inc',
    location: 'San Francisco, CA',
    status: 'Interview',
    appliedDate: '2024-03-10',
  },
  {
    id: '3',
    title: 'Web Developer',
    company: 'Acme',
    location: 'New York, NY',
    status: 'Ghosted',
    appliedDate: '2024-03-08',
  },
];

export const mockResume: Resume = {
  personal: {
    name: 'Alyssa Jade',
    email: 'alyssa@example.com',
    phone: '+1 555 123 4567',
    location: 'Los Angeles, CA',
  },
  summary: 'Passionate frontend engineer with AI experience.',
  skills: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'AI/ML'],
  experience: [
    {
      title: 'Frontend Engineer',
      company: 'TechCo',
      startDate: '2022-01-01',
      endDate: '2024-01-01',
      description: 'Built UI components using React and Tailwind.',
    },
  ],
  education: [
    {
      school: 'University of Example',
      degree: 'B.S. Computer Science',
      startDate: '2018-08-01',
      endDate: '2022-05-01',
    },
  ],
  projects: [
    {
      name: 'Portfolio Site',
      description: 'Personal portfolio built with Next.js.',
      technologies: ['Next.js', 'Tailwind', 'Vercel'],
      url: 'https://example.com',
    },
  ],
};

export const mockProfile: Profile = {
  name: 'Alyssa Jade Merjilla',
  email: 'alyssa@example.com',
  avatarUrl: '/img/icon.png',
  bio: 'Frontend AI Engineer with a passion for building beautiful UIs.',
};
