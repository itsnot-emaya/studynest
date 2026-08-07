"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
);

type Pack = {
  id: number;
  title: string;
  subject: string;
  level: string;
  type: string;
  price: number;
  rating: number;
  reviews: number;
  pages: number;
  accent: string;
  icon: string;
  tutor: string;
  description: string;
};

const PACKS: Pack[] = [
  {
    id: 1,
    title: "Pure Mathematics — Complete Revision",
    subject: "Mathematics",
    level: "A/L",
    type: "Revision Pack",
    price: 1450,
    rating: 4.9,
    reviews: 128,
    pages: 186,
    accent: "violet",
    icon: "∑",
    tutor: "N. Perera",
    description:
      "Clear theory, worked examples and exam-style questions for every major unit.",
  },
  {
    id: 2,
    title: "Physics Structured Essay Mastery",
    subject: "Physics",
    level: "A/L",
    type: "Past Papers",
    price: 1200,
    rating: 4.8,
    reviews: 96,
    pages: 142,
    accent: "blue",
    icon: "⚛",
    tutor: "S. Wijesinghe",
    description:
      "Ten years of structured essays with marking schemes and tutor explanations.",
  },
  {
    id: 3,
    title: "ICT Database & Networking Notes",
    subject: "ICT",
    level: "A/L",
    type: "Study Notes",
    price: 950,
    rating: 4.9,
    reviews: 84,
    pages: 118,
    accent: "mint",
    icon: "⌘",
    tutor: "K. Fernando",
    description:
      "Visual, syllabus-mapped notes for databases, networking and web technologies.",
  },
  {
    id: 4,
    title: "Chemistry Organic Reactions Map",
    subject: "Chemistry",
    level: "A/L",
    type: "Quick Guide",
    price: 750,
    rating: 4.7,
    reviews: 62,
    pages: 64,
    accent: "orange",
    icon: "⌬",
    tutor: "D. Silva",
    description:
      "A concise reaction map, mechanisms and memory aids for rapid revision.",
  },
  {
    id: 5,
    title: "English Literature Model Answers",
    subject: "English",
    level: "O/L",
    type: "Answer Guide",
    price: 890,
    rating: 4.8,
    reviews: 75,
    pages: 102,
    accent: "rose",
    icon: "Aa",
    tutor: "A. Jayawardena",
    description:
      "High-scoring model answers with annotations, themes and quotation banks.",
  },
  {
    id: 6,
    title: "Accounting Practice Question Bank",
    subject: "Accounting",
    level: "A/L",
    type: "Question Bank",
    price: 1100,
    rating: 4.6,
    reviews: 51,
    pages: 156,
    accent: "gold",
    icon: "%",
    tutor: "R. Gunasekara",
    description:
      "Graded practice from fundamentals to full timed-paper challenges.",
  },
];

const money = (n: number) => `LKR ${n.toLocaleString()}`;

const BASE_PATH = "/studynest";
const publicPath = (path = "/") =>
  `${BASE_PATH}${path === "/" ? "/" : path}`;

type View = "home" | "store" | "subjects" | "resource" | "library" | "admin";

type AdminCategory = { id: number; name: string; subcategories: string[]; courses: number };
type AdminCourse = { id: number; title: string; category: string; lessons: number; price: number; status: "Published" | "Draft" };
type AdminFile = { id: number; name: string; type: string; size: string; course: string };

const viewFromPath = (): View => {
  if (typeof window === "undefined") return "home";
  const path = window.location.pathname.replace(new RegExp(`^${BASE_PATH}`), "") || "/";
  if (path.startsWith("/marketplace")) return "store";
  if (path.startsWith("/subjects")) return "subjects";
  if (path.startsWith("/resource")) return "resource";
  if (path.startsWith("/library")) return "library";
  if (path.startsWith("/admin")) return "admin";
  return "home";
};

export default function Home() {
  const [view, setView] = useState<View>(viewFromPath);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All subjects");
  const [cart, setCart] = useState<number[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [preview, setPreview] = useState<Pack | null>(null);
  const [infoPage, setInfoPage] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [packs, setPacks] = useState(PACKS);
  const [adminTab, setAdminTab] = useState("Overview");
  const [adminModal, setAdminModal] = useState<"course" | "category" | "file" | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([
    { id: 1, name: "Mathematics", subcategories: ["Pure Mathematics", "Applied Mathematics", "Statistics"], courses: 8 },
    { id: 2, name: "Science", subcategories: ["Physics", "Chemistry", "Biology"], courses: 12 },
    { id: 3, name: "Technology", subcategories: ["ICT", "Engineering Technology", "Science for Technology"], courses: 7 },
    { id: 4, name: "Commerce", subcategories: ["Accounting", "Business Studies", "Economics"], courses: 9 },
    { id: 5, name: "Languages", subcategories: ["English", "Sinhala", "Tamil"], courses: 6 },
  ]);
  const [courses, setCourses] = useState<AdminCourse[]>([
    { id: 1, title: "A/L Pure Mathematics Masterclass", category: "Mathematics", lessons: 24, price: 4500, status: "Published" },
    { id: 2, title: "Physics Structured Essay Bootcamp", category: "Science", lessons: 18, price: 3800, status: "Published" },
    { id: 3, title: "ICT Database & Networking", category: "Technology", lessons: 14, price: 2900, status: "Draft" },
  ]);
  const [adminFiles, setAdminFiles] = useState<AdminFile[]>([
    { id: 1, name: "pure-maths-revision-2026.pdf", type: "PDF", size: "8.4 MB", course: "Pure Mathematics" },
    { id: 2, name: "physics-lesson-01.mp4", type: "Video", size: "124 MB", course: "Physics Bootcamp" },
    { id: 3, name: "ict-practice-files.zip", type: "Archive", size: "32 MB", course: "ICT Database & Networking" },
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Mathematics");
  const [newSubcategories, setNewSubcategories] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [libraryIds, setLibraryIds] = useState<number[]>([]);
  const [resourceId, setResourceId] = useState(() => {
    if (typeof window === "undefined") return 1;
    return Number(new URLSearchParams(window.location.search).get("id")) || 1;
  });
  const filtered = useMemo(
    () =>
      packs.filter(
        (p) =>
          (subject === "All subjects" || p.subject === subject) &&
          `${p.title} ${p.subject} ${p.type}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [packs, query, subject],
  );
  const cartPacks = cart
    .map((id) => packs.find((p) => p.id === id))
    .filter(Boolean) as Pack[];
  const add = (id: number) => {
    setCart((c) => (c.includes(id) ? c : [...c, id]));
    setNotice("Added to your cart");
    setTimeout(() => setNotice(""), 1800);
  };
  const isAdmin = user?.app_metadata?.role === "admin";
  const selectedResource = packs.find((p) => p.id === resourceId) ?? packs[0];

  const navigate = (path: string, nextView: View) => {
    window.history.pushState({}, "", publicPath(path));
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openResource = (p: Pack) => {
    setResourceId(p.id);
    navigate(`/resource?id=${p.id}`, "resource");
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".reveal, section > div, .product, .subject-directory button");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("in-view"));
    }, { threshold: 0.08 });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [view, adminTab]);

  const createCategory = async () => {
    if (!newTitle.trim()) return;
    const category = { id: Date.now(), name: newTitle.trim(), subcategories: newSubcategories.split(",").map((x) => x.trim()).filter(Boolean), courses: 0 };
    setCategories((current) => [...current, category]);
    const { error } = await supabase.from("course_categories").insert({ name: category.name, subcategories: category.subcategories });
    setNewTitle(""); setNewSubcategories(""); setAdminModal(null); setNotice(error ? "Category added to this session — database setup is still required for permanent saving" : "Category created successfully");
  };
  const createCourse = async () => {
    if (!newTitle.trim()) return;
    const course: AdminCourse = { id: Date.now(), title: newTitle.trim(), category: newCategory, lessons: 0, price: 0, status: "Draft" };
    setCourses((current) => [...current, course]);
    const { error } = await supabase.from("courses").insert({ title: course.title, category: course.category, status: "draft", price: 0 });
    setNewTitle(""); setAdminModal(null); setAdminTab("Courses"); setNotice(error ? "Course draft added to this session — database setup is still required for permanent saving" : "Course draft created — add lessons and pricing next");
  };
  const queueFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const added = Array.from(files).map((file, index) => ({ id: Date.now() + index, name: file.name, type: file.type.includes("video") ? "Video" : file.type.includes("pdf") ? "PDF" : "File", size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, course: newCategory }));
    setAdminFiles((current) => [...added, ...current]); setAdminModal(null); setAdminTab("Files");
    const uploads = await Promise.all(Array.from(files).map((file) => supabase.storage.from("course-files").upload(`${user?.id ?? "admin"}/${Date.now()}-${file.name}`, file, { upsert: false })));
    const failed = uploads.some(({ error }) => error);
    setNotice(failed ? `${added.length} file${added.length > 1 ? "s" : ""} added to this session — connect the course-files storage bucket for permanent uploads` : `${added.length} file${added.length > 1 ? "s" : ""} uploaded successfully`);
  };

  useEffect(() => {
    const onPopState = () => {
      setView(viewFromPath());
      setResourceId(Number(new URLSearchParams(window.location.search).get("id")) || 1);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    supabase
      .from("student_library")
      .select("resource_id")
      .eq("user_id", user.id)
      .then(({ data }) =>
        setLibraryIds((data ?? []).map((row) => row.resource_id)),
      );
  }, [user]);

  const openLibrary = () => {
    if (!user) {
      setAuthOpen(true);
      setAuthMode("signin");
      return;
    }
    navigate("/library", "library");
  };
  const signInWithGoogle = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${BASE_PATH}/` },
    });
    if (error) setAuthError(error.message);
  };
  const submitAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    if (password.length < 8) {
      setAuthError("Your password must contain at least 8 characters.");
      setAuthLoading(false);
      return;
    }
    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}${BASE_PATH}/`,
        },
      });
      if (error) setAuthError(error.message);
      else if (data.user) {
        await supabase
          .from("profiles")
          .upsert({
            id: data.user.id,
            email,
            full_name: fullName,
            avatar_url: null,
          });
        setNotice("Check your email to confirm your StudyNest account");
        setAuthOpen(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setAuthError(error.message);
      else {
        setAuthOpen(false);
        setNotice("Welcome back to StudyNest");
      }
    }
    setAuthLoading(false);
  };
  const signOut = async () => {
    await supabase.auth.signOut();
    setLibraryIds([]);
    navigate("/", "home");
    setNotice("You have signed out");
  };

  return (
    <main>
      {notice && <div className="toast">✓ {notice}</div>}
      <header className="nav">
        <button className="brand" onClick={() => navigate("/", "home")}>
          <span className="brandmark">S</span>
          <span className="brand-copy">
            <span className="brand-name">Study<span>Nest</span></span>
            <small>by Methzz</small>
          </span>
        </button>
        <nav>
          <button
            className={view === "store" ? "active" : ""}
            onClick={() => navigate("/marketplace", "store")}
          >
            Marketplace
          </button>
          <button
            className={view === "subjects" ? "active" : ""}
            onClick={() => navigate("/subjects", "subjects")}
          >
            Subjects
          </button>
          <button onClick={() => { navigate("/", "home"); setTimeout(() => document.getElementById("programmes")?.scrollIntoView({ behavior: "smooth" }), 50); }}>
            Programmes
          </button>
          <button
            className={view === "library" ? "active" : ""}
            onClick={openLibrary}
          >
            My Library
          </button>
        </nav>
        <div className="nav-actions">
          <button
            className="search-btn"
            aria-label="Search"
            onClick={() => {
                  navigate("/marketplace", "store");
            }}
          >
            ⌕
          </button>
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            Bag <b>{cart.length}</b>
          </button>
          {user ? (
            <div className="account-menu">
              <button
                className="avatar"
                title={user.email}
                onClick={openLibrary}
              >
                {(user.user_metadata?.full_name || user.email || "U")
                  .slice(0, 2)
                  .toUpperCase()}
              </button>
              <div>
                <b>{user.user_metadata?.full_name || "Student"}</b>
                <small>{user.email}</small>
                {isAdmin && (
                  <button onClick={() => navigate("/admin", "admin")}>
                    Admin dashboard
                  </button>
                )}
                <button onClick={signOut}>Sign out</button>
              </div>
            </div>
          ) : (
            <button className="signin-btn" onClick={() => setAuthOpen(true)}>
              Sign in
            </button>
          )}
        </div>
      </header>

      {view === "home" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">Built for Sri Lankan students</div>
              <h1>
                Study smarter.
                <br />
                <em>Score higher.</em>
              </h1>
              <p>
                Trusted notes, past-paper solutions and revision packs made by
                experienced tutors—everything you need for exam day.
              </p>
              <div className="hero-actions">
                <button
                  className="primary"
                  onClick={() => navigate("/marketplace", "store")}
                >
                  Explore study packs <span>→</span>
                </button>
                <button
                  className="text-btn"
                  onClick={() => openResource(packs[0])}
                >
                  See how it works <span>▶</span>
                </button>
              </div>
              <div className="proof">
                <div className="faces">
                  <span>NP</span>
                  <span>SW</span>
                  <span>KF</span>
                </div>
                <div>
                  <b>
                    4.9 <i>★★★★★</i>
                  </b>
                  <small>from 2,400+ students</small>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="orb one" />
              <div className="orb two" />
              <div className="paper p-back">
                <span>ICT</span>
                <b>
                  Database
                  <br />
                  Essentials
                </b>
                <small>STUDY NOTES • 2026</small>
              </div>
              <div className="paper p-front">
                <span className="mini-brand">STUDYNEST</span>
                <div className="formula">f(x) = ax² + bx + c</div>
                <b>Pure Mathematics</b>
                <small>Complete Revision Guide</small>
                <div className="paper-footer">
                  AL • 2026 <span>186 PAGES</span>
                </div>
              </div>
              <div className="float-card">
                <strong>✓</strong>
                <span>
                  <b>Syllabus aligned</b>
                  <small>Updated for 2026</small>
                </span>
              </div>
            </div>
          </section>

          <section className="subjects" id="subjects">
            <div className="section-head">
              <div>
                <span>Browse by subject</span>
                <h2>Find exactly what you need</h2>
              </div>
              <button onClick={() => navigate("/subjects", "subjects")}>
                View all subjects →
              </button>
            </div>
            <div className="subject-row">
              {[
                ["∑", "Mathematics", "32 resources"],
                ["⚛", "Physics", "24 resources"],
                ["⌬", "Chemistry", "28 resources"],
                ["⌘", "ICT", "19 resources"],
                ["Aa", "English", "16 resources"],
                ["%", "Accounting", "21 resources"],
              ].map(([i, s, c]) => (
                <button
                  key={s}
                  onClick={() => {
                    setSubject(s);
                    navigate("/subjects", "subjects");
                  }}
                >
                  <span>{i}</span>
                  <b>{s}</b>
                  <small>{c}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="catalog home-catalog" id="catalog">
            <div className="section-head">
              <div>
                <span>Top resources</span>
                <h2>Popular with students</h2>
              </div>
              <div className="filters">
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  {[
                    "All subjects",
                    "Mathematics",
                    "Physics",
                    "ICT",
                    "Chemistry",
                    "English",
                    "Accounting",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <label className="search">
                  ⌕{" "}
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search resources"
                  />
                </label>
              </div>
            </div>
            <div className="product-grid">
              {filtered.slice(0, 3).map((p) => (
                <article className="product" key={p.id}>
                  <button
                    className={`cover ${p.accent}`}
                    onClick={() => openResource(p)}
                  >
                    <span className="cover-brand">STUDYNEST</span>
                    <i>{p.icon}</i>
                    <b>{p.subject}</b>
                    <small>
                      {p.type} • {p.level} 2026
                    </small>
                    <span className="pages">{p.pages} pages</span>
                  </button>
                  <div className="product-body">
                    <div className="rating">
                      ★ {p.rating} <span>({p.reviews})</span>
                    </div>
                    <h3>{p.title}</h3>
                    <p>By {p.tutor}</p>
                    <div>
                      <strong>{money(p.price)}</strong>
                      <button onClick={() => add(p.id)}>
                        {cart.includes(p.id) ? "✓ Added" : "Add to bag"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="empty">No resources match that search yet.</div>
            )}
          </section>

          <section className="education-hub" id="programmes">
            <div className="section-head">
              <div><span>One learning platform</span><h2>From school to university and beyond</h2></div>
              <p>Explore structured learning paths, academic programmes and skills that prepare you for exams, higher education and careers.</p>
            </div>
            <div className="pathway-tabs">
              <button className="active">University programmes</button><button>School education</button><button>Certificates</button><button>Career skills</button>
            </div>
            <div className="programme-grid">
              {[
                ["AI", "Computing & Artificial Intelligence", "Diplomas, degrees and practical pathways in AI, software engineering, data science and cybersecurity.", "12 programmes"],
                ["EN", "Engineering & Technology", "Build foundations in robotics, electronics, mechanical systems and modern engineering technology.", "9 programmes"],
                ["BM", "Business & Management", "Study management, accounting, marketing, entrepreneurship, finance and business analytics.", "11 programmes"],
                ["HS", "Health & Life Sciences", "Explore biology, psychology, health science, laboratory skills and research foundations.", "8 programmes"],
                ["AL", "Advanced Level", "Complete A/L learning pathways for Mathematics, Science, Technology, Commerce and Arts streams.", "42 courses"],
                ["OL", "Ordinary Level", "Syllabus-aligned O/L courses, revision plans, past papers and subject mastery resources.", "36 courses"],
              ].map(([icon,title,description,count]) => (
                <article className="programme-card" key={title}><span>{icon}</span><small>{count}</small><h3>{title}</h3><p>{description}</p><button onClick={() => navigate("/marketplace", "store")}>Explore courses →</button></article>
              ))}
            </div>
          </section>
          <section className="student-journey">
            <div className="journey-copy"><span>YOUR STUDYNEST JOURNEY</span><h2>Learn with a clear path from enrolment to achievement.</h2><p>Choose a programme, follow organised modules, practise with assessments, track your progress and build evidence of your learning.</p><button className="primary" onClick={() => navigate("/marketplace", "store")}>Find your course →</button></div>
            <div className="journey-steps">{[["01","Discover","Compare subjects, programmes and learning levels."],["02","Enrol","Create your account and access your personal learning space."],["03","Learn","Complete lessons, videos, readings, quizzes and assignments."],["04","Achieve","Track progress and earn completion recognition."]].map(([n,t,d])=><div key={n}><b>{n}</b><span><strong>{t}</strong><small>{d}</small></span></div>)}</div>
          </section>
          <section className="academic-services">
            <div className="section-head"><div><span>Student services</span><h2>Support for every stage of learning</h2></div></div>
            <div>{[["⌕","Course guidance","Find the right subject, level or academic pathway."],["▤","Admissions information","Understand entry requirements, enrolment and course schedules."],["♙","Academic support","Get help with study planning, resources and assessments."],["◇","Digital library","Access notes, past papers, reference materials and downloads."],["✓","Certificates","Receive completion recognition for eligible programmes."],["↗","Career pathways","Connect learning choices with future study and career goals."]].map(([i,t,d])=><article key={t}><span>{i}</span><h3>{t}</h3><p>{d}</p><button onClick={()=>setInfoPage(t)}>Learn more →</button></article>)}</div>
          </section>
          <section className="benefits">
            <div>
              <span>✓</span>
              <b>Expert-created</b>
              <small>Prepared by experienced tutors</small>
            </div>
            <div>
              <span>↯</span>
              <b>Instant access</b>
              <small>Download right after checkout</small>
            </div>
            <div>
              <span>↻</span>
              <b>Free updates</b>
              <small>Always get the latest edition</small>
            </div>
            <div>
              <span>♙</span>
              <b>Student support</b>
              <small>We are here when you need us</small>
            </div>
          </section>
          <section className="newsletter">
            <div>
              <span>Exam season, simplified</span>
              <h2>Your next grade starts here.</h2>
              <p>
                Join thousands of students learning with clear, focused
                resources.
              </p>
            </div>
            <button
              className="light"
              onClick={() =>
                  navigate("/marketplace", "store")
              }
            >
              Browse all resources →
            </button>
          </section>
        </>
      )}

      {view === "store" && (
        <section className="marketplace-page">
          <div className="page-hero compact-hero">
            <span>THE STUDYNEST MARKETPLACE</span>
            <h1>Everything you need to prepare with confidence.</h1>
            <p>Browse tutor-created notes, revision packs, past-paper solutions and focused question banks.</p>
          </div>
          <div className="catalog standalone-catalog">
            <div className="section-head">
              <div><span>All resources</span><h2>Explore the collection</h2></div>
              <div className="filters">
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {["All subjects", "Mathematics", "Physics", "ICT", "Chemistry", "English", "Accounting"].map((x) => <option key={x}>{x}</option>)}
                </select>
                <label className="search">⌕ <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search resources" /></label>
              </div>
            </div>
            <div className="results-meta"><b>{filtered.length} resources</b><span>Digital PDF • Instant access</span></div>
            <div className="product-grid">
              {filtered.map((p) => (
                <article className="product" key={p.id}>
                  <button className={`cover ${p.accent}`} onClick={() => openResource(p)}>
                    <span className="cover-brand">STUDYNEST</span><i>{p.icon}</i><b>{p.subject}</b>
                    <small>{p.type} • {p.level} 2026</small><span className="pages">{p.pages} pages</span>
                  </button>
                  <div className="product-body"><div className="rating">★ {p.rating} <span>({p.reviews})</span></div><h3>{p.title}</h3><p>By {p.tutor}</p><div><strong>{money(p.price)}</strong><button onClick={() => add(p.id)}>{cart.includes(p.id) ? "✓ Added" : "Add to bag"}</button></div></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {view === "subjects" && (
        <section className="subjects-page">
          <div className="page-hero"><span>BROWSE BY SUBJECT</span><h1>Choose a subject. Build your exam plan.</h1><p>Each collection is organised around the Sri Lankan syllabus and the way students actually revise.</p></div>
          <div className="subject-directory">
            {[ ["∑","Mathematics","Algebra, calculus, statistics and pure mathematics"], ["⚛","Physics","Mechanics, electricity, waves and structured essays"], ["⌬","Chemistry","Organic, inorganic and physical chemistry"], ["⌘","ICT","Databases, networking, programming and web technology"], ["Aa","English","Literature, language, essays and model answers"], ["%","Accounting","Financial accounting and graded practice"] ].map(([i,s,d]) => (
              <button key={s} onClick={() => { setSubject(s); navigate("/marketplace", "store"); }}><span>{i}</span><div><b>{s}</b><p>{d}</p><small>View resources →</small></div></button>
            ))}
          </div>
        </section>
      )}

      {view === "resource" && selectedResource && (
        <section className="resource-page">
          <div className="breadcrumbs"><button onClick={() => navigate("/marketplace", "store")}>Marketplace</button><span>›</span><span>{selectedResource.subject}</span><span>›</span><b>{selectedResource.title}</b></div>
          <div className="resource-detail">
            <div className={`detail-cover ${selectedResource.accent}`}><span className="cover-brand">STUDYNEST</span><i>{selectedResource.icon}</i><b>{selectedResource.subject}</b><small>{selectedResource.type} • {selectedResource.level} 2026</small></div>
            <div className="detail-copy"><span className="badge">SYLLABUS-ALIGNED DIGITAL RESOURCE</span><h1>{selectedResource.title}</h1><div className="rating">★ {selectedResource.rating} <span>{selectedResource.reviews} verified student reviews</span></div><p className="lead">{selectedResource.description}</p><div className="detail-facts"><div><b>{selectedResource.pages}</b><small>Pages</small></div><div><b>PDF</b><small>Format</small></div><div><b>2026</b><small>Edition</small></div><div><b>Lifetime</b><small>Access</small></div></div><ul><li>✓ Complete syllabus coverage</li><li>✓ Step-by-step worked examples</li><li>✓ Exam-style practice questions</li><li>✓ Free future updates</li></ul><div className="purchase-box"><div><small>One-time purchase</small><strong>{money(selectedResource.price)}</strong></div><button className="primary" onClick={() => add(selectedResource.id)}>{cart.includes(selectedResource.id) ? "✓ Added to bag" : "Add to bag →"}</button></div></div>
          </div>
        </section>
      )}

      {view === "library" && user && (
        <section className="dashboard-page">
          <div className="dash-title">
            <span>STUDENT DASHBOARD</span>
            <h1>My Library</h1>
            <p>
              Signed in as {user.email}. Your purchased resources are ready
              whenever you are.
            </p>
          </div>
          {libraryIds.length ? (
            <div className="library-grid">
              {packs
                .filter((p) => libraryIds.includes(p.id))
                .map((p, i) => (
                  <article className="library-card" key={p.id}>
                    <div className={`library-cover ${p.accent}`}>{p.icon}</div>
                    <div>
                      <small>
                        {p.subject} • {p.type}
                      </small>
                      <h3>{p.title}</h3>
                      <div className="progress">
                        <span style={{ width: `${[72, 38, 91][i % 3]}%` }} />
                      </div>
                      <p>{[72, 38, 91][i % 3]}% viewed</p>
                      <button
                        onClick={() =>
                          setNotice("Your secure download is being prepared…")
                        }
                      >
                        ↓ Download PDF
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          ) : (
            <div className="library-empty">
              <span>◇</span>
              <h2>Your library is ready</h2>
              <p>Resources you purchase will appear here automatically.</p>
              <button className="primary" onClick={() => navigate("/marketplace", "store")}>
                Browse study packs
              </button>
            </div>
          )}
          <div className="support-box">
            <div>
              <b>Need help with a resource?</b>
              <p>
                Our student support team usually replies within one working day.
              </p>
            </div>
            <button onClick={() => setNotice("Support request opened")}>
              Contact support
            </button>
          </div>
        </section>
      )}

      {view === "admin" && isAdmin && (
        <section className="admin">
          <aside>
            <div className="admin-label"><span className="admin-logo">S</span><div>STUDYNEST<small>Education OS</small></div></div>
            {["Overview", "Courses", "Categories", "Resources", "Files", "Orders", "Students", "Analytics", "Settings"].map((x) => (
              <button
                className={adminTab === x ? "selected" : ""}
                onClick={() => setAdminTab(x)}
                key={x}
              >
                <span>
                  {({ Overview: "⌂", Courses: "◫", Categories: "⌘", Resources: "▣", Files: "⇧", Orders: "▤", Students: "♙", Analytics: "↗", Settings: "⚙" } as Record<string,string>)[x]}
                </span>
                {x}
              </button>
            ))}
            <button onClick={() => navigate("/", "home")} className="back-store">
              ← Back to store
            </button>
          </aside>
          <div className="admin-main">
            <div className="admin-top">
              <div>
                <span>STUDYNEST ADMIN</span>
                <h1>{adminTab}</h1>
              </div>
              <div className="admin-actions">
                <button className="icon-action" onClick={() => setAdminModal("file")}>⇧ Upload</button>
                <button className="primary" onClick={() => setAdminModal("course")}>＋ New course</button>
              </div>
            </div>
            {adminTab === "Overview" && (
              <>
                <div className="stats">
                  <div>
                    <span>Total revenue</span>
                    <b>LKR 428,650</b>
                    <small>↑ 12.4% this month</small>
                  </div>
                  <div>
                    <span>Orders</span>
                    <b>386</b>
                    <small>↑ 8.1% this month</small>
                  </div>
                  <div>
                    <span>Students</span>
                    <b>2,418</b>
                    <small>↑ 126 new</small>
                  </div>
                  <div>
                    <span>Resources</span>
                    <b>{packs.length}</b>
                    <small>All active</small>
                  </div>
                </div>
                <div className="admin-panels">
                  <div>
                    <div className="panel-head">
                      <h3>Recent orders</h3>
                      <button onClick={() => setAdminTab("Orders")}>
                        View all
                      </button>
                    </div>
                    <table>
                      <tbody>
                        {[
                          ["#SN-2048", "Kasun Perera", "LKR 1,450", "Paid"],
                          ["#SN-2047", "Amaya Silva", "LKR 2,150", "Paid"],
                          ["#SN-2046", "Tharindu Jay", "LKR 950", "Pending"],
                          ["#SN-2045", "Nethmi Fernando", "LKR 1,200", "Paid"],
                        ].map((r) => (
                          <tr key={r[0]}>
                            {r.map((c, i) => (
                              <td
                                key={c}
                                className={i === 3 ? c.toLowerCase() : ""}
                              >
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="quick">
                    <h3>Quick actions</h3>
                    <button onClick={() => setAdminTab("Resources")}>
                      ▣ Manage resources <span>→</span>
                    </button>
                    <button onClick={() => setAdminModal("course")}>
                      ◫ Create a course <span>→</span>
                    </button>
                    <button onClick={() => setAdminModal("file")}>
                      ⇧ Upload learning files <span>→</span>
                    </button>
                    <button onClick={() => setAdminTab("Orders")}>
                      ▤ View transactions <span>→</span>
                    </button>
                    <button onClick={() => setAdminTab("Students")}>
                      ♙ Manage students <span>→</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            {adminTab === "Courses" && (
              <div className="admin-workspace">
                <div className="workspace-toolbar"><div><h3>Courses</h3><p>Build complete learning programmes with modules, lessons and downloadable materials.</p></div><button className="primary" onClick={() => setAdminModal("course")}>＋ Create course</button></div>
                <div className="course-admin-grid">
                  {courses.map((course) => <article className="course-admin-card" key={course.id}>
                    <div className="course-thumb"><span>{course.category.slice(0,2).toUpperCase()}</span><i>⋮</i></div>
                    <div className="course-card-copy"><span className={course.status === "Published" ? "published" : "pending"}>{course.status}</span><h3>{course.title}</h3><p>{course.category}</p><div className="course-meta"><span>{course.lessons} lessons</span><b>{course.price ? money(course.price) : "Price not set"}</b></div><div className="course-progress"><span style={{width: course.status === "Published" ? "100%" : "42%"}} /></div><div className="card-actions"><button onClick={() => setNotice(`Opening course builder for ${course.title}`)}>Edit curriculum</button><button>•••</button></div></div>
                  </article>)}
                  <button className="new-course-card" onClick={() => setAdminModal("course")}><span>＋</span><b>Create another course</b><small>Add lessons, videos, PDFs, quizzes and pricing</small></button>
                </div>
              </div>
            )}
            {adminTab === "Categories" && (
              <div className="admin-workspace">
                <div className="workspace-toolbar"><div><h3>Categories & subcategories</h3><p>Organise every course and resource into a clear academic structure.</p></div><button className="primary" onClick={() => setAdminModal("category")}>＋ Add category</button></div>
                <div className="category-admin-list">
                  {categories.map((cat) => <article key={cat.id}><div className="category-symbol">{cat.name.slice(0,2).toUpperCase()}</div><div className="category-info"><h3>{cat.name}</h3><div>{cat.subcategories.map((sub) => <span key={sub}>{sub}</span>)}</div></div><b>{cat.courses}<small>courses</small></b><button onClick={() => setNotice(`Editing ${cat.name}`)}>Edit</button><button className="more-btn">•••</button></article>)}
                </div>
              </div>
            )}
            {adminTab === "Files" && (
              <div className="admin-workspace">
                <div className="workspace-toolbar"><div><h3>Media & file library</h3><p>Manage PDFs, videos, worksheets, presentations, audio and course attachments.</p></div><button className="primary" onClick={() => setAdminModal("file")}>⇧ Upload files</button></div>
                <button className="upload-zone" onClick={() => setAdminModal("file")}><span>⇧</span><b>Drop learning materials here</b><small>PDF, MP4, DOCX, PPTX, ZIP, images and audio</small></button>
                <div className="file-grid">{adminFiles.map((file) => <article key={file.id}><span className={`file-icon ${file.type.toLowerCase()}`}>{file.type === "Video" ? "▶" : file.type === "PDF" ? "PDF" : "FILE"}</span><div><b>{file.name}</b><small>{file.course} • {file.size}</small></div><button>•••</button></article>)}</div>
              </div>
            )}
            {adminTab === "Analytics" && (
              <div className="admin-workspace"><div className="workspace-toolbar"><div><h3>Learning analytics</h3><p>Understand enrolments, completion and the resources students value most.</p></div><select><option>Last 30 days</option><option>This year</option></select></div><div className="analytics-grid"><div className="chart-card"><h3>Course engagement</h3><div className="bar-chart">{[48,72,56,91,66,84,74].map((h,i)=><span key={i} style={{height:`${h}%`}}><i>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}</i></span>)}</div></div><div className="completion-card"><h3>Completion rate</h3><div className="ring"><b>78%</b><small>average</small></div><p>↑ 6.2% from last month</p></div></div></div>
            )}
            {adminTab === "Settings" && (
              <div className="admin-workspace settings-grid"><section><h3>Marketplace settings</h3><label>Store name<input defaultValue="StudyNest" /></label><label>Support email<input defaultValue="support@studynest.lk" /></label><label>Default currency<select defaultValue="LKR"><option>LKR</option><option>USD</option></select></label><button className="primary" onClick={() => setNotice("Settings saved")}>Save changes</button></section><section><h3>Content controls</h3><label className="switch-row"><span><b>Student reviews</b><small>Allow verified buyers to review courses</small></span><input type="checkbox" defaultChecked /></label><label className="switch-row"><span><b>Course certificates</b><small>Issue certificates after completion</small></span><input type="checkbox" defaultChecked /></label><label className="switch-row"><span><b>Maintenance mode</b><small>Temporarily hide the public marketplace</small></span><input type="checkbox" /></label></section></div>
            )}
            {adminTab === "Resources" && (
              <div className="manage-list">
                <div className="panel-head">
                  <h3>All study resources</h3>
                  <span>{packs.length} published</span>
                </div>
                {packs.map((p) => (
                  <div className="manage-row" key={p.id}>
                    <div className={`tiny-cover ${p.accent}`}>{p.icon}</div>
                    <div>
                      <b>{p.title}</b>
                      <small>
                        {p.subject} • {money(p.price)}
                      </small>
                    </div>
                    <span className="published">Published</span>
                    <button onClick={() => setNotice(`Editing ${p.title}`)}>
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() =>
                        setPacks((ps) => ps.filter((x) => x.id !== p.id))
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
            {adminTab === "Orders" && (
              <div className="manage-list">
                <div className="panel-head">
                  <h3>Transaction history</h3>
                  <button onClick={() => setNotice("CSV report prepared")}>
                    Export CSV
                  </button>
                </div>
                {["2048", "2047", "2046", "2045", "2044", "2043"].map(
                  (x, i) => (
                    <div className="order-row" key={x}>
                      <b>#SN-{x}</b>
                      <span>
                        {
                          [
                            "Kasun Perera",
                            "Amaya Silva",
                            "Tharindu Jay",
                            "Nethmi Fernando",
                            "Dinuka Senal",
                            "Sajini Dewmi",
                          ][i]
                        }
                      </span>
                      <span>Aug {7 - i}, 2026</span>
                      <strong>
                        {money([1450, 2150, 950, 1200, 1840, 750][i])}
                      </strong>
                      <i className={i === 2 ? "pending" : "paid"}>
                        {i === 2 ? "Pending" : "Paid"}
                      </i>
                    </div>
                  ),
                )}
              </div>
            )}
            {adminTab === "Students" && (
              <div className="manage-list">
                <div className="panel-head">
                  <h3>Student accounts</h3>
                  <label className="search">
                    ⌕ <input placeholder="Search students" />
                  </label>
                </div>
                {[
                  "Kasun Perera",
                  "Amaya Silva",
                  "Tharindu Jay",
                  "Nethmi Fernando",
                  "Dinuka Senal",
                ].map((x, i) => (
                  <div className="student-row" key={x}>
                    <span className="student-avatar">
                      {x
                        .split(" ")
                        .map((a) => a[0])
                        .join("")}
                    </span>
                    <div>
                      <b>{x}</b>
                      <small>
                        {x.toLowerCase().replace(" ", ".")}@gmail.com
                      </small>
                    </div>
                    <span>{[4, 7, 2, 5, 3][i]} purchases</span>
                    <i>Active</i>
                    <button>•••</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {adminModal && (
        <div className="overlay admin-modal-overlay" onMouseDown={() => setAdminModal(null)}>
          <section className="admin-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setAdminModal(null)}>×</button>
            {adminModal === "course" && <>
              <span className="badge">COURSE BUILDER</span><h2>Create a new course</h2><p>Start with the essentials. You can add modules, lessons, quizzes and files after creating the draft.</p>
              <label>Course title<input value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} placeholder="e.g. 2026 A/L Physics Complete Course" /></label>
              <div className="form-row"><label>Category<select value={newCategory} onChange={(e)=>setNewCategory(e.target.value)}>{categories.map((c)=><option key={c.id}>{c.name}</option>)}</select></label><label>Learning level<select><option>A/L</option><option>O/L</option><option>Grade 6–9</option><option>Professional</option></select></label></div>
              <label>Short description<textarea placeholder="What will students learn in this course?" /></label>
              <div className="builder-steps"><span className="active">1 Course info</span><span>2 Curriculum</span><span>3 Pricing</span><span>4 Publish</span></div>
              <button className="primary modal-submit" onClick={createCourse}>Create draft & continue →</button>
            </>}
            {adminModal === "category" && <>
              <span className="badge">CONTENT STRUCTURE</span><h2>Add a category</h2><p>Create a main subject area, then add its related streams or topics as subcategories.</p>
              <label>Category name<input value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} placeholder="e.g. Humanities" /></label>
              <label>Subcategories<textarea value={newSubcategories} onChange={(e)=>setNewSubcategories(e.target.value)} placeholder="History, Geography, Political Science" /></label><small className="field-note">Separate subcategories with commas.</small>
              <button className="primary modal-submit" onClick={createCategory}>Create category</button>
            </>}
            {adminModal === "file" && <>
              <span className="badge">MEDIA LIBRARY</span><h2>Upload learning materials</h2><p>Add one or multiple files and assign them to a course or category.</p>
              <label>Assign to<select value={newCategory} onChange={(e)=>setNewCategory(e.target.value)}>{courses.map((c)=><option key={c.id}>{c.title}</option>)}{categories.map((c)=><option key={c.id}>{c.name}</option>)}</select></label>
              <label className="file-picker"><input type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,image/*,video/*,audio/*" onChange={(e)=>queueFiles(e.target.files)} /><span>⇧</span><b>Choose files to upload</b><small>PDF, video, presentations, documents, audio, images or ZIP files</small></label>
              <div className="upload-note">Files are added to your course media library and can be attached to lessons.</div>
            </>}
          </section>
        </div>
      )}

      <footer className="mega-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="brand"><span className="brandmark">S</span><span className="brand-copy"><span className="brand-name">Study<span>Nest</span></span><small>by Methzz</small></span></div>
            <p>A modern learning platform for university and school education—courses, academic resources and student support in one place.</p>
            <div className="social-links"><a href="https://www.instagram.com/methsinduuuu/" target="_blank" rel="noreferrer">Instagram</a><a href="http://www.linkedin.com/in/methsindu-yapa" target="_blank" rel="noreferrer">LinkedIn</a><span>GitHub coming soon</span></div>
          </div>
          <div><b>Study</b><button onClick={() => navigate("/marketplace","store")}>All courses</button><button onClick={() => navigate("/subjects","subjects")}>Subjects</button><button onClick={() => { navigate("/","home"); setTimeout(()=>document.getElementById("programmes")?.scrollIntoView({behavior:"smooth"}),50); }}>Programmes</button><button onClick={openLibrary}>My learning</button></div>
          <div><b>University</b><button onClick={()=>setInfoPage("Admissions")}>Admissions</button><button onClick={()=>setInfoPage("Faculties")}>Faculties</button><button onClick={()=>setInfoPage("Entry requirements")}>Entry requirements</button><button onClick={()=>setInfoPage("Academic calendar")}>Academic calendar</button></div>
          <div><b>Student support</b><button onClick={()=>setInfoPage("Help centre")}>Help centre</button><button onClick={()=>setInfoPage("Student services")}>Student services</button><a href="mailto:methsinduyapa2000@gmail.com">Contact us</a><button onClick={()=>setInfoPage("Accessibility")}>Accessibility</button></div>
          <div><b>Policies</b><button onClick={()=>setInfoPage("Terms of use")}>Terms of use</button><button onClick={()=>setInfoPage("Privacy policy")}>Privacy policy</button><button onClick={()=>setInfoPage("Cookie policy")}>Cookie policy</button><button onClick={()=>setInfoPage("Refund policy")}>Refund policy</button><button onClick={()=>setInfoPage("Copyright policy")}>Copyright policy</button></div>
          <div className="creator-card"><span>CREATED BY</span><h3>Methsindu Yapa</h3><p>Creator of StudyNest · AI & Robotics student building accessible digital education experiences.</p><a href="mailto:methsinduyapa2000@gmail.com">methsinduyapa2000@gmail.com</a><a href="tel:+94762321886">+94 76 232 1886</a><a href="https://wa.me/94762321886" target="_blank" rel="noreferrer">WhatsApp creator →</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 StudyNest by Methzz. All rights reserved.</span><span>Made in Sri Lanka · Secure authentication · Student-first learning</span></div>
      </footer>

      {infoPage && (
        <div className="overlay info-overlay" onMouseDown={() => setInfoPage(null)}>
          <section className="info-modal" onMouseDown={(e)=>e.stopPropagation()}>
            <button className="close" onClick={()=>setInfoPage(null)}>×</button>
            <span className="badge">STUDYNEST INFORMATION</span><h2>{infoPage}</h2>
            {infoPage.includes("Privacy") ? <><p>StudyNest respects your privacy. Account information is used to provide authentication, learning access and student support. We do not sell personal information.</p><h3>Information we use</h3><p>Name, email, learning activity and transaction records may be processed only to operate and improve the platform. Authentication is securely provided through Supabase.</p><h3>Your choices</h3><p>You may request access, correction or deletion of eligible personal information by contacting the creator.</p></> :
            infoPage.includes("Terms") ? <><p>By using StudyNest, you agree to use courses and learning materials lawfully and only for their intended educational purpose.</p><h3>Accounts and content</h3><p>Keep account details secure. Course files, lessons and downloads may not be resold, republished or shared without written permission.</p><h3>Platform availability</h3><p>Features may be improved or updated as the platform develops. Specific course details and eligibility should be confirmed before enrolment.</p></> :
            infoPage.includes("Refund") ? <><p>Digital products and immediately accessible course materials are generally non-refundable after access or download. Duplicate payments and verified technical failures will be reviewed fairly.</p><p>Contact us with the order reference within seven days so we can investigate.</p></> :
            infoPage.includes("Cookie") ? <><p>StudyNest uses essential browser storage and authentication cookies to keep accounts secure, remember sessions and provide core learning features.</p><p>Optional analytics may be added later with appropriate notice and controls.</p></> :
            infoPage.includes("Copyright") ? <><p>StudyNest branding, original course structures and platform content are protected. Tutor and third-party materials remain the property of their respective owners.</p><p>Report suspected infringement to methsinduyapa2000@gmail.com.</p></> :
            <><p>StudyNest is developing this service as part of its university and school learning ecosystem.</p><p>For programme guidance, admissions information, accessibility assistance or academic support, contact Methsindu Yapa at <a href="mailto:methsinduyapa2000@gmail.com">methsinduyapa2000@gmail.com</a> or call <a href="tel:+94762321886">+94 76 232 1886</a>.</p><div className="info-actions"><a href="mailto:methsinduyapa2000@gmail.com">Email support</a><a href="https://wa.me/94762321886" target="_blank" rel="noreferrer">WhatsApp</a></div></>}
            <small className="policy-note">Last updated: August 2026 · StudyNest by Methzz</small>
          </section>
        </div>
      )}

      {preview && (
        <div className="overlay" onMouseDown={() => setPreview(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setPreview(null)}>
              ×
            </button>
            <div className={`modal-cover ${preview.accent}`}>
              <span>{preview.icon}</span>
              <b>{preview.subject}</b>
              <small>
                {preview.type} • {preview.level}
              </small>
            </div>
            <div className="modal-copy">
              <span className="badge">PREVIEW</span>
              <h2>{preview.title}</h2>
              <div className="rating">
                ★ {preview.rating}{" "}
                <span>({preview.reviews} student reviews)</span>
              </div>
              <p>{preview.description}</p>
              <ul>
                <li>✓ Syllabus-aligned lessons</li>
                <li>✓ Step-by-step worked examples</li>
                <li>✓ Printable, high-quality PDF</li>
                <li>✓ Free future updates</li>
              </ul>
              <div className="modal-buy">
                <strong>{money(preview.price)}</strong>
                <button
                  className="primary"
                  onClick={() => {
                    add(preview.id);
                    setPreview(null);
                  }}
                >
                  {cart.includes(preview.id)
                    ? "Already in bag"
                    : "Add to bag →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {authOpen && (
        <div className="overlay" onMouseDown={() => setAuthOpen(false)}>
          <section className="auth-modal" onMouseDown={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setAuthOpen(false)}>×</button>
            <div className="auth-brand"><span className="brandmark">S</span><b>StudyNest</b></div>
            <span className="badge">STUDENT ACCOUNT</span>
            <h2>{authMode === "signin" ? "Welcome back" : "Create your account"}</h2>
            <p>{authMode === "signin" ? "Sign in to access your purchased study resources." : "Join StudyNest and keep all your learning resources in one secure place."}</p>
            <button className="google-btn" onClick={signInWithGoogle}><strong>G</strong> Continue with Google</button>
            <div className="auth-divider"><span>or continue with email</span></div>
            <form onSubmit={submitAuth}>
              {authMode === "signup" && <label>Full name<input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" autoComplete="name" /></label>}
              <label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
              <label>Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete={authMode === "signin" ? "current-password" : "new-password"} /></label>
              {authError && <div className="auth-error">{authError}</div>}
              <button className="auth-submit" disabled={authLoading}>{authLoading ? "Please wait…" : authMode === "signin" ? "Sign in" : "Create account"}</button>
            </form>
            <p className="auth-switch">{authMode === "signin" ? "New to StudyNest?" : "Already have an account?"} <button onClick={() => { setAuthMode(authMode === "signin" ? "signup" : "signin"); setAuthError(""); }}>{authMode === "signin" ? "Create an account" : "Sign in"}</button></p>
            <small className="auth-note">By continuing, you agree to our Terms and Privacy Policy.</small>
          </section>
        </div>
      )}

      {cartOpen && (
        <div
          className="overlay drawer-overlay"
          onMouseDown={() => setCartOpen(false)}
        >
          <aside className="drawer" onMouseDown={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <h2>
                Your bag <span>{cart.length}</span>
              </h2>
              <button onClick={() => setCartOpen(false)}>×</button>
            </div>
            {cartPacks.length ? (
              <>
                <div className="cart-items">
                  {cartPacks.map((p) => (
                    <div key={p.id}>
                      <div className={`tiny-cover ${p.accent}`}>{p.icon}</div>
                      <span>
                        <b>{p.title}</b>
                        <small>{p.subject} • PDF</small>
                        <strong>{money(p.price)}</strong>
                      </span>
                      <button
                        onClick={() =>
                          setCart((c) => c.filter((x) => x !== p.id))
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="total">
                  <span>Total</span>
                  <b>{money(cartPacks.reduce((s, p) => s + p.price, 0))}</b>
                </div>
                <button
                  className="checkout"
                  onClick={() => {
                    if (!user) {
                      setCartOpen(false);
                      setAuthOpen(true);
                      return;
                    }
                    setCart([]);
                    setCartOpen(false);
                    navigate("/library", "library");
                    setNotice(
                      "Order completed — resources added to your library",
                    );
                  }}
                >
                  Complete demo checkout →
                </button>
                <p className="secure">⌾ Secure access • Instant PDF delivery</p>
              </>
            ) : (
              <div className="cart-empty">
                <span>◇</span>
                <h3>Your bag is empty</h3>
                <p>
                  Explore our study packs and find your next exam advantage.
                </p>
                <button className="primary" onClick={() => setCartOpen(false)}>
                  Browse resources
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
