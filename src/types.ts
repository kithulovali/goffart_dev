export type Profile = {
  public_id: string;
  name: string;
  email: string;
  about: string;
  banner: string;
  contact: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Article = {
  public_id: string;
  name: string;
  content: string;
  connect: string;
  author: string;
  banner: string;
  tags: string;
  youtube_ref: string;
  project?: Pick<Project, 'public_id' | 'title' | 'description' | 'banner' | 'tags' | 'connect' | 'contribute'> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type Project = {
  public_id: string;
  title: string;
  description?: string | null;
  banner?: string | null;
  tags: string;
  connect: string;
  contribute: string;
  created_at?: string | null;
  updated_at?: string | null;
};
