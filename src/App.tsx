import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, Route, Routes, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Download,
  ExternalLink,
  FolderKanban,
  House,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from 'lucide-react';
import { SiGithub, SiYoutube } from 'react-icons/si';
import { ContactLink } from './components/ContactLink';
import { TechTags } from './components/TechTags';
import {
  authenticateAdmin,
  clearAdminToken,
  getAdminToken,
  verifyAdminToken,
} from './lib/api';
import {
  createArticle,
  createProfile,
  createProject,
  deleteArticle,
  deleteProfile,
  deleteProject,
  getArticle,
  getProfile,
  getProject,
  listArticles,
  listProfiles,
  listProjects,
  updateArticle,
  updateProfile,
  updateProject,
} from './lib/api';
import type { Article, Profile, Project } from './types';

function usePhoneScreen(): boolean {
  const [isPhoneScreen, setIsPhoneScreen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 700px)');
    const updateScreenSize = () => setIsPhoneScreen(mediaQuery.matches);
    updateScreenSize();
    mediaQuery.addEventListener('change', updateScreenSize);
    return () => mediaQuery.removeEventListener('change', updateScreenSize);
  }, []);

  return isPhoneScreen;
}

function formatDate(value?: string | null): string {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function parseTags(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .flatMap((group) => {
      const hashtags = group.match(/#[^\s,]+/g);
      return hashtags
        ? hashtags.map((tag) => tag.slice(1).trim()).filter(Boolean)
        : [group.trim()].filter(Boolean);
    });
}

async function downloadArticle(article: Article): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const document = new jsPDF();
  const margin = 18;
  const lineHeight = 6;
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  const textWidth = pageWidth - margin * 2;
  let y = margin;

  const writeParagraph = (value: string, fontSize: number, fontStyle: 'normal' | 'bold') => {
    if (!value.trim()) return;
    document.setFont('helvetica', fontStyle);
    document.setFontSize(fontSize);
    const lines = document.splitTextToSize(value, textWidth) as string[];
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        document.addPage();
        y = margin;
      }
      document.text(line, margin, y);
      y += lineHeight;
    }
    y += 3;
  };

  writeParagraph(article.name, 20, 'bold');
  writeParagraph(`By ${article.author}`, 10, 'normal');
  if (article.created_at) {
    writeParagraph(`Published ${formatDate(article.created_at)}`, 10, 'normal');
  }
  y += 4;
  for (const paragraph of article.content.split(/\n+/)) {
    writeParagraph(paragraph, 11, 'normal');
  }

  const filename = article.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'article';
  document.save(`${filename}.pdf`);
}

function App() {
  const isPhoneScreen = usePhoneScreen();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          {isPhoneScreen ? (
            <span className="brand-mark" aria-hidden="true">G</span>
          ) : (
            <NavLink to="/admin" className="brand-mark" aria-label="Admin access" title="Admin access">G</NavLink>
          )}
          <NavLink to="/" className="brand-name">Goffart</NavLink>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/"><House size={15} aria-hidden="true" /> Home</NavLink>
          <NavLink to="/about"><UserRound size={15} aria-hidden="true" /> About</NavLink>
          <NavLink to="/articles"><BookOpen size={15} aria-hidden="true" /> Articles</NavLink>
          <NavLink to="/projects"><FolderKanban size={15} aria-hidden="true" /> Projects</NavLink>
        </nav>
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const [profileData, articleData, projectData] = await Promise.all([
          listProfiles(),
          listArticles(),
          listProjects(),
        ]);
        setProfiles(profileData);
        setArticles(articleData);
        setProjects(projectData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load content.');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const profile = profiles[0] ?? null;
  const featuredArticle = articles[0] ?? null;

  return (
    <div className="portfolio-home">
      {loading ? <LoadingState /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}

      {!loading && !error && (
        <>
          <aside className="profile-column panel">
            {profile ? (
              <>
                <div className="profile-avatar-wrap">
                  {profile.banner ? (
                    <img src={profile.banner} alt={profile.name} className="profile-banner" />
                  ) : (
                    <div className="profile-placeholder">
                      <UserRound size={36} />
                    </div>
                  )}
                </div>

                <div className="profile-meta">
                  <h1>{profile.name}</h1>
                  {profile.about ? <p>{profile.about}</p> : null}
                </div>

                <div className="profile-list">
                  {profile.contact ? <ContactLink value={profile.contact} /> : null}
                </div>
              </>
            ) : (
              <EmptyState title="No profile found" description="Create a profile in the admin panel to populate the portfolio." />
            )}
          </aside>

          <section className="content-column">
            {featuredArticle ? (
              <article className="feature-article card">
                {featuredArticle.banner ? (
                  <img src={featuredArticle.banner} alt={featuredArticle.name} className="feature-image" />
                ) : null}
                <div className="card-body">
                  <div className="eyebrow-row">
                    <span className="eyebrow">Featured article</span>
                    <span className="muted-inline">
                      <CalendarDays size={14} /> {formatDate(featuredArticle.created_at)}
                    </span>
                  </div>
                  <h2>{featuredArticle.name}</h2>
                  {featuredArticle.content ? <p className="lead">{featuredArticle.content}</p> : null}
                  <TechTags tags={parseTags(featuredArticle.tags)} />
                  <div className="card-actions">
                    <NavLink to={`/articles/${featuredArticle.public_id}`} className="primary-link">
                      Read article <ArrowRight size={16} />
                    </NavLink>
                    <NavLink to="/articles" className="secondary-link">
                      View all articles
                    </NavLink>
                  </div>
                </div>
              </article>
            ) : (
              <EmptyState title="No articles yet" description="Publish content from the admin area to populate this column." />
            )}
          </section>

          <aside className="project-column">
            <div className="section-heading">
              <h2>Recent work</h2>
            </div>

            {projects.length ? (
              <div className="stack">
                {projects.slice(0, 5).map((project) => (
                  <article key={project.public_id} className="project-card card">
                    {project.banner ? <img src={project.banner} alt={project.title} className="project-thumb" /> : null}
                    <div className="card-body">
                      <h3>{project.title}</h3>
                      {project.description ? <p>{project.description}</p> : null}
                      <TechTags tags={parseTags(project.tags)} />
                      <div className="card-actions compact">
                        {project.connect ? (
                          <a href={project.connect} target="_blank" rel="noreferrer" className="icon-link">
                            <span className="brand-icon youtube"><SiYoutube size={15} /></span> Watch video
                          </a>
                        ) : null}
                        {project.contribute ? (
                          <a href={project.contribute} target="_blank" rel="noreferrer" className="icon-link">
                            <span className="brand-icon github"><SiGithub size={15} /></span> Contribute to project
                          </a>
                        ) : null}
                        <NavLink to={`/projects/${project.public_id}`} className="primary-link small">
                          Details
                        </NavLink>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState title="No projects" description="Add projects from the admin dashboard." />
            )}
          </aside>
        </>
      )}
    </div>
  );
}

function AboutPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const profiles = await listProfiles();
        setProfile(profiles[0] ?? null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!profile) return <EmptyState title="Profile unavailable" description="The portfolio profile has not been created yet." />;

  return (
    <div className="detail-page">
      <div className="feature-wrap">
        <div className="detail-header">
          <div className="eyebrow">About</div>
          <h1>{profile.name}</h1>
        </div>
        <div className="detail-content">
          <div className="detail-panel">
            <div className="avatar-large">
              {profile.banner ? <img src={profile.banner} alt={profile.name} /> : <UserRound size={46} />}
            </div>
            <div className="bio-block">
              {profile.about ? <p>{profile.about}</p> : null}
            </div>
          </div>

          <div className="detail-meta-box">
            <h2>Contact</h2>
            <ul>
              {profile.contact ? <li><ContactLink value={profile.contact} /></li> : null}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setArticles(await listArticles());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load articles');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="listing-page">
      <div className="section-heading">
        <div className="eyebrow">Writing</div>
        <h1>Articles</h1>
      </div>

      {articles.length ? (
        <div className="listing-grid">
          {articles.map((article) => (
            <article key={article.public_id} className="list-card card">
              {article.banner ? <img src={article.banner} alt={article.name} className="list-image" /> : null}
              <div className="card-body">
                <div className="eyebrow-row">
                  <span className="eyebrow">{formatDate(article.created_at)}</span>
                  <span className="muted-inline"><BookOpen size={14} /> {article.author}</span>
                </div>
                <h2>{article.name}</h2>
                {article.content ? <p>{article.content}</p> : null}
                <TechTags tags={parseTags(article.tags)} />
                {article.project ? (
                  <NavLink className="related-project-link" to={`/projects/${article.project.public_id}`}>
                    <span className="color-icon color-icon-project"><FolderKanban size={15} /></span>
                    Project: {article.project.title}
                    <ArrowRight size={14} />
                  </NavLink>
                ) : null}
                <div className="card-actions">
                  <button type="button" className="secondary-link" onClick={() => downloadArticle(article)}>
                    <Download size={16} /> Download PDF
                  </button>
                  <NavLink to={`/articles/${article.public_id}`} className="primary-link">
                    View details <ArrowRight size={16} />
                  </NavLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No articles yet" description="Add content via the admin panel." />
      )}
    </div>
  );
}

function ArticleDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        setArticle(await getArticle(id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load article');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!article) return <EmptyState title="Article not found" description="This article may have been removed." />;

  return (
    <div className="detail-page article-detail">
      <div className="detail-header">
        <div className="eyebrow">Article</div>
        <h1>{article.name}</h1>
        <div className="detail-topline">
          <span><CalendarDays size={14} /> {formatDate(article.created_at)}</span>
          <span><UserRound size={14} /> {article.author}</span>
        </div>
      </div>

      {article.banner ? <img src={article.banner} alt={article.name} className="hero-image" /> : null}

      <div className="detail-content layout-two-col">
        <div className="content-body">
          {article.content ? <p className="lead">{article.content}</p> : null}
        </div>
        <aside className="detail-sidebar">
          <div className="detail-meta-box">
            <h2>Details</h2>
            <ul>
              {article.connect ? (
                <li>
                  <span className="color-icon color-icon-reference"><ExternalLink size={15} /></span>
                  <a href={article.connect} target="_blank" rel="noreferrer">Reference</a>
                </li>
              ) : null}
              {article.youtube_ref ? (
                <li><span className="brand-icon youtube"><SiYoutube size={15} /></span> <a href={article.youtube_ref} target="_blank" rel="noreferrer">Watch video</a></li>
              ) : null}
              <li>
                <button type="button" className="secondary-link" onClick={() => downloadArticle(article)}>
                  <Download size={15} /> Download PDF
                </button>
              </li>
            </ul>
          </div>
          {article.project ? (
            <div className="related-project-card">
              <div className="eyebrow">Related project</div>
              {article.project.banner ? (
                <img src={article.project.banner} alt="" className="related-project-image" />
              ) : null}
              <h2>{article.project.title}</h2>
              {article.project.description ? <p>{article.project.description}</p> : null}
              <TechTags tags={parseTags(article.project.tags)} />
              <NavLink className="primary-link small" to={`/projects/${article.project.public_id}`}>
                View project <ArrowRight size={14} />
              </NavLink>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setProjects(await listProjects());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load projects');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="listing-page">
      <div className="section-heading">
        <div className="eyebrow">Selected work</div>
        <h1>Projects</h1>
      </div>

      {projects.length ? (
        <div className="listing-grid">
          {projects.map((project) => (
            <article key={project.public_id} className="list-card card">
              {project.banner ? <img src={project.banner} alt={project.title} className="list-image" /> : null}
              <div className="card-body">
                <h2>{project.title}</h2>
                {project.description ? <p>{project.description}</p> : null}
                <TechTags tags={parseTags(project.tags)} />
                <div className="card-actions compact">
                  {project.connect ? <a href={project.connect} target="_blank" rel="noreferrer" className="icon-link"><span className="brand-icon youtube"><SiYoutube size={15} /></span> Watch video</a> : null}
                  {project.contribute ? <a href={project.contribute} target="_blank" rel="noreferrer" className="icon-link"><span className="brand-icon github"><SiGithub size={15} /></span> Contribute to project</a> : null}
                  <NavLink to={`/projects/${project.public_id}`} className="primary-link small">View details</NavLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No projects yet" description="Add projects from the admin panel." />
      )}
    </div>
  );
}

function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        setProject(await getProject(id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load project');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!project) return <EmptyState title="Project not found" description="This project may have been removed." />;

  return (
    <div className="detail-page project-detail">
      <div className="detail-header">
        <div className="eyebrow">Project</div>
        <h1>{project.title}</h1>
      </div>

      {project.banner ? <img src={project.banner} alt={project.title} className="hero-image" /> : null}

      <div className="detail-content layout-two-col">
        <div className="content-body">
          {project.description ? <p className="lead">{project.description}</p> : null}
          <TechTags tags={parseTags(project.tags)} />
        </div>
        <aside className="detail-sidebar">
          <div className="detail-meta-box">
            <h2>Links</h2>
            <ul>
              {project.connect ? (
                <li>
                  <span className="brand-icon youtube"><SiYoutube size={15} /></span>
                  <a href={project.connect} target="_blank" rel="noreferrer">Watch video</a>
                </li>
              ) : null}
              {project.contribute ? (
                <li>
                  <span className="brand-icon github"><SiGithub size={15} /></span>
                  <a href={project.contribute} target="_blank" rel="noreferrer">Contribute to project</a>
                </li>
              ) : null}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AdminPage() {
  const isPhoneScreen = usePhoneScreen();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminAuthorized, setAdminAuthorized] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminToken, setAdminToken] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', email: '', about: '', contact: '' });
  const [profileBanner, setProfileBanner] = useState<File | null>(null);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  const [articleForm, setArticleForm] = useState({ name: '', connect: '', author: '', youtube_ref: '', profile_id: '', project_id: '', content: '', tags: '' });
  const [articleBanner, setArticleBanner] = useState<File | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const [projectForm, setProjectForm] = useState({ title: '', tags: '', connect: '', contribute: '', profile_id: '', description: '' });
  const [projectBanner, setProjectBanner] = useState<File | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (isPhoneScreen) {
      setAdminAuthorized(false);
      setAuthChecking(false);
      setProfiles([]);
      setArticles([]);
      setProjects([]);
      return;
    }

    if (!getAdminToken()) {
      setAuthChecking(false);
      return;
    }
    let active = true;
    void verifyAdminToken()
      .then(() => {
        if (active) setAdminAuthorized(true);
      })
      .catch((authFailure: unknown) => {
        if (active) {
          setAuthError(authFailure instanceof Error ? authFailure.message : 'Admin verification failed.');
        }
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });
    return () => {
      active = false;
    };
  }, [isPhoneScreen]);

  const loadData = async () => {
    try {
      const [nextProfiles, nextArticles, nextProjects] = await Promise.all([
        listProfiles(),
        listArticles(),
        listProjects(),
      ]);
      setProfiles(nextProfiles);
      setArticles(nextArticles);
      setProjects(nextProjects);
      setError(null);
      if (!nextProfiles.length) {
        setProfileForm((previous) => ({ ...previous, profile_id: '' }));
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminAuthorized && !isPhoneScreen) void loadData();
  }, [adminAuthorized, isPhoneScreen]);

  const handleAdminLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      await authenticateAdmin(adminToken);
      setAdminAuthorized(true);
      setAdminToken('');
    } catch (authFailure) {
      setAuthError(authFailure instanceof Error ? authFailure.message : 'Admin verification failed.');
      setAdminToken('');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleAdminLogout = () => {
    clearAdminToken();
    setAdminToken('');
    setAdminAuthorized(false);
    setProfiles([]);
    setArticles([]);
    setProjects([]);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', profileForm.name);
    formData.append('email', profileForm.email);
    if (profileForm.about) formData.append('about', profileForm.about);
    if (profileForm.contact) formData.append('contact', profileForm.contact);
    if (profileBanner) formData.append('banner', profileBanner);

    try {
      if (editingProfileId) {
        await updateProfile(editingProfileId, formData);
      } else {
        await createProfile(formData);
      }
      setProfileForm({ name: '', email: '', about: '', contact: '' });
      setProfileBanner(null);
      setEditingProfileId(null);
      event.currentTarget.reset();
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Profile save failed');
    }
  };

  const handleArticleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('name', articleForm.name);
    formData.append('connect', articleForm.connect);
    formData.append('author', articleForm.author);
    formData.append('youtube_ref', articleForm.youtube_ref);
    formData.append('profile_id', articleForm.profile_id || profiles[0]?.public_id || '');
    formData.append('project_id', articleForm.project_id);
    if (articleForm.content) formData.append('content', articleForm.content);
    if (articleForm.tags) formData.append('tags', articleForm.tags);
    if (articleBanner) formData.append('banner', articleBanner);

    try {
      if (editingArticleId) {
        await updateArticle(editingArticleId, formData);
      } else {
        await createArticle(formData);
      }
      setArticleForm({ name: '', connect: '', author: '', youtube_ref: '', profile_id: '', project_id: '', content: '', tags: '' });
      setArticleBanner(null);
      setEditingArticleId(null);
      event.currentTarget.reset();
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Article save failed');
    }
  };

  const handleProjectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', projectForm.title);
    formData.append('tags', projectForm.tags);
    formData.append('connect', projectForm.connect);
    formData.append('contribute', projectForm.contribute);
    formData.append('profile_id', projectForm.profile_id || profiles[0]?.public_id || '');
    if (projectForm.description) formData.append('description', projectForm.description);
    if (projectBanner) formData.append('banner', projectBanner);

    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, formData);
      } else {
        await createProject(formData);
      }
      setProjectForm({ title: '', tags: '', connect: '', contribute: '', profile_id: '', description: '' });
      setProjectBanner(null);
      setEditingProjectId(null);
      event.currentTarget.reset();
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Project save failed');
    }
  };

  const beginEditProfile = (profile: Profile) => {
    setEditingProfileId(profile.public_id);
    setProfileForm({
      name: profile.name,
      email: profile.email,
      about: profile.about,
      contact: profile.contact,
    });
  };

  const beginEditArticle = (article: Article) => {
    setEditingArticleId(article.public_id);
    setArticleForm({
      name: article.name,
      connect: article.connect,
      author: article.author,
      youtube_ref: article.youtube_ref,
      profile_id: profiles[0]?.public_id ?? '',
      project_id: article.project?.public_id ?? '',
      content: article.content,
      tags: article.tags,
    });
  };

  const beginEditProject = (project: Project) => {
    setEditingProjectId(project.public_id);
    setProjectForm({
      title: project.title,
      tags: project.tags,
      connect: project.connect,
      contribute: project.contribute,
      profile_id: profiles[0]?.public_id ?? '',
      description: project.description ?? '',
    });
  };

  const removeProfile = async (id: string) => {
    if (!window.confirm('Delete this profile?')) return;
    try {
      await deleteProfile(id);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Delete failed');
    }
  };

  const removeArticle = async (id: string) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await deleteArticle(id);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Delete failed');
    }
  };

  const removeProject = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await deleteProject(id);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Delete failed');
    }
  };

  if (isPhoneScreen) {
    return (
      <div className="admin-mobile-unavailable panel">
        <div className="eyebrow">Admin dashboard</div>
        <h1>Unavailable on phones</h1>
        <p>Open this dashboard on a tablet or computer to manage your portfolio.</p>
        <NavLink to="/" className="secondary-link">Return to portfolio</NavLink>
      </div>
    );
  }
  if (authChecking) return <LoadingState />;
  if (!adminAuthorized) {
    return (
      <div className="admin-login panel">
        <div className="eyebrow">Restricted area</div>
        <h1>Admin sign in</h1>
        <p>Enter the admin token configured for this API.</p>
        {authError ? <ErrorState message={authError} /> : null}
        <form className="manager-form" onSubmit={handleAdminLogin}>
          <label>
            Admin token
            <input
              type="password"
              autoComplete="current-password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              required
            />
          </label>
          <button type="submit" className="primary-button" disabled={authSubmitting}>
            {authSubmitting ? 'Verifying…' : 'Sign in'}
          </button>
        </form>
      </div>
    );
  }
  if (loading) return <LoadingState />;

  return (
    <div className="admin-page">
      <div className="section-heading">
        <div className="eyebrow">Control center</div>
        <h1>Admin</h1>
        <button type="button" className="inline-button" onClick={handleAdminLogout}>
          Sign out
        </button>
      </div>

      {error ? <ErrorState message={error} /> : null}

      <div className="admin-summary">
        <div className="summary-card">
          <span>Profiles</span>
          <strong>{profiles.length}</strong>
        </div>
        <div className="summary-card">
          <span>Articles</span>
          <strong>{articles.length}</strong>
        </div>
        <div className="summary-card">
          <span>Projects</span>
          <strong>{projects.length}</strong>
        </div>
      </div>

      <div className="admin-grid">
        <section className="panel admin-panel">
          <div className="panel-header">
            <h2>Profile</h2>
            <button type="button" className="inline-button" onClick={() => setEditingProfileId(null)}>
              <Plus size={14} /> New
            </button>
          </div>
          <form className="manager-form" onSubmit={handleProfileSubmit}>
            <label>
              Name
              <input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} />
            </label>
            <label>
              Email
              <input type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} />
            </label>
            <label>
              About
              <textarea value={profileForm.about} onChange={(event) => setProfileForm({ ...profileForm, about: event.target.value })} />
            </label>
            <label>
              Contact link (email, phone, or social URL)
              <input
                type="text"
                placeholder="Email, phone number, or https://social.example/..."
                value={profileForm.contact}
                onChange={(event) => setProfileForm({ ...profileForm, contact: event.target.value })}
              />
            </label>
            <label>
              Banner image
              <input type="file" accept="image/*" onChange={(event) => setProfileBanner(event.target.files?.[0] ?? null)} />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-button">{editingProfileId ? 'Save profile' : 'Create profile'}</button>
            </div>
          </form>
          <div className="managed-list">
            {profiles.map((profile) => (
              <div key={profile.public_id} className="managed-item">
                <div>
                  <strong>{profile.name}</strong>
                  <small>{profile.email}</small>
                </div>
                <div className="managed-actions">
                  <button type="button" className="icon-button" onClick={() => beginEditProfile(profile)} aria-label={`Edit ${profile.name}`}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="icon-button danger" onClick={() => removeProfile(profile.public_id)} aria-label={`Delete ${profile.name}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel admin-panel">
          <div className="panel-header">
            <h2>Articles</h2>
            <button
              type="button"
              className="inline-button"
              onClick={() => {
                setEditingArticleId(null);
                setArticleForm({ name: '', connect: '', author: '', youtube_ref: '', profile_id: '', project_id: '', content: '', tags: '' });
                setArticleBanner(null);
              }}
            >
              <Plus size={14} /> New
            </button>
          </div>
          <form className="manager-form" onSubmit={handleArticleSubmit}>
            <label>
              Name
              <input value={articleForm.name} onChange={(event) => setArticleForm({ ...articleForm, name: event.target.value })} />
            </label>
            <label>
              Author
              <input value={articleForm.author} onChange={(event) => setArticleForm({ ...articleForm, author: event.target.value })} />
            </label>
            <label>
              Connect
              <input value={articleForm.connect} onChange={(event) => setArticleForm({ ...articleForm, connect: event.target.value })} />
            </label>
            <label>
              YouTube reference
              <input value={articleForm.youtube_ref} onChange={(event) => setArticleForm({ ...articleForm, youtube_ref: event.target.value })} />
            </label>
            <label>
              Profile
              <select value={articleForm.profile_id || profiles[0]?.public_id || ''} onChange={(event) => setArticleForm({ ...articleForm, profile_id: event.target.value })}>
                {profiles.map((profile) => (
                  <option key={profile.public_id} value={profile.public_id}>{profile.name}</option>
                ))}
              </select>
            </label>
            <label>
              Related project (optional)
              <select value={articleForm.project_id} onChange={(event) => setArticleForm({ ...articleForm, project_id: event.target.value })}>
                <option value="">No related project</option>
                {projects.filter((project) => (
                  !articles.some((article) => (
                    article.project?.public_id === project.public_id &&
                    article.public_id !== editingArticleId
                  ))
                )).map((project) => (
                  <option key={project.public_id} value={project.public_id}>{project.title}</option>
                ))}
              </select>
            </label>
            <label>
              Tags
              <input value={articleForm.tags} onChange={(event) => setArticleForm({ ...articleForm, tags: event.target.value })} />
            </label>
            <label>
              Content
              <textarea value={articleForm.content} onChange={(event) => setArticleForm({ ...articleForm, content: event.target.value })} />
            </label>
            <label>
              Banner image
              <input type="file" accept="image/*" onChange={(event) => setArticleBanner(event.target.files?.[0] ?? null)} />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-button">{editingArticleId ? 'Save article' : 'Create article'}</button>
            </div>
          </form>
          <div className="managed-list">
            {articles.map((article) => (
              <div key={article.public_id} className="managed-item">
                <div>
                  <strong>{article.name}</strong>
                  <small>{article.author}</small>
                </div>
                <div className="managed-actions">
                  <button type="button" className="icon-button" onClick={() => beginEditArticle(article)} aria-label={`Edit ${article.name}`}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="icon-button danger" onClick={() => removeArticle(article.public_id)} aria-label={`Delete ${article.name}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel admin-panel">
          <div className="panel-header">
            <h2>Projects</h2>
            <button type="button" className="inline-button" onClick={() => setEditingProjectId(null)}>
              <Plus size={14} /> New
            </button>
          </div>
          <form className="manager-form" onSubmit={handleProjectSubmit}>
            <label>
              Title
              <input value={projectForm.title} onChange={(event) => setProjectForm({ ...projectForm, title: event.target.value })} />
            </label>
            <label>
              Profile
              <select value={projectForm.profile_id || profiles[0]?.public_id || ''} onChange={(event) => setProjectForm({ ...projectForm, profile_id: event.target.value })}>
                {profiles.map((profile) => (
                  <option key={profile.public_id} value={profile.public_id}>{profile.name}</option>
                ))}
              </select>
            </label>
            <label>
              Tags
              <input value={projectForm.tags} onChange={(event) => setProjectForm({ ...projectForm, tags: event.target.value })} />
            </label>
            <label>
              Live demo
              <input value={projectForm.connect} onChange={(event) => setProjectForm({ ...projectForm, connect: event.target.value })} />
            </label>
            <label>
              Repository
              <input value={projectForm.contribute} onChange={(event) => setProjectForm({ ...projectForm, contribute: event.target.value })} />
            </label>
            <label>
              Description
              <textarea value={projectForm.description} onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })} />
            </label>
            <label>
              Banner image
              <input type="file" accept="image/*" onChange={(event) => setProjectBanner(event.target.files?.[0] ?? null)} />
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-button">{editingProjectId ? 'Save project' : 'Create project'}</button>
            </div>
          </form>
          <div className="managed-list">
            {projects.map((project) => (
              <div key={project.public_id} className="managed-item">
                <div>
                  <strong>{project.title}</strong>
                  <small>{project.tags}</small>
                </div>
                <div className="managed-actions">
                  <button type="button" className="icon-button" onClick={() => beginEditProject(project)} aria-label={`Edit ${project.title}`}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="icon-button danger" onClick={() => removeProject(project.public_id)} aria-label={`Delete ${project.title}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function LoadingState() {
  return <div className="status-card">Loading portfolio content…</div>;
}

function ErrorState({ message }: { message: string }) {
  return <div className="status-card error">{message}</div>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default App;
