export type JobOpening = {
  en: {
    description: string;
    impact?: string;
    requirements: string[];
    responsibilities: string[];
    title: string;
  };
  fr: {
    description: string;
    impact?: string;
    requirements: string[];
    responsibilities: string[];
    title: string;
  };
  id: string;
  location: string;
  occupantName?: string;
  postedAt?: string;
  seniority?: string;
  status: 'open' | 'taken';
  team: string;
  type: string;
  workMode: string;
};
