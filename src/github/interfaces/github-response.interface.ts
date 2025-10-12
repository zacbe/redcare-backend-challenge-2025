export interface IGithubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Array<{
    full_name: string;
    html_url: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
    created_at: string;
  }>;
}
