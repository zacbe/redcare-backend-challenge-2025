export interface IRepository {
  fullName: string;
  htmlUrl: string;
  description: string | null;
  language: string | null;
  stargazers: number;
  forks: number;
  updatedAt: string; // ISO string
  createdAt: string; // ISO string
  score?: number;
}
