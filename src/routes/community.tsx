import { ScoreRing } from "@/components/SessionResult";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useImmersive } from "@/hooks/useImmersive";
import deskSetupImg from "@/assets/demo-desk-setup.svg";
import stretchBreakImg from "@/assets/demo-stretch-break.svg";
import parkWalkImg from "@/assets/demo-park-walk.svg";
import teamStretchImg from "@/assets/demo-team-stretch.svg";
import { Figure } from "@/components/ExerciseIntro";
import type { Motion } from "@/lib/exercise-guides";
import { cn } from "@/lib/utils";
import {
  Heart, MessageCircle, Share2, BadgeCheck, Send, X, ChevronLeft, ChevronRight, Eye, Play, Pause, MessagesSquare, Sparkles, PenLine,
  Facebook, Twitter, Linkedin, MessageSquare, Link2, ImageIcon, Smile,
  Search, SlidersHorizontal, Check, Hash, Flame, Clock3, Layers,
} from "lucide-react";

const FILTERS = ["All Feeds", "Expert Advice", "Milestone", "Question", "Posture Tip", "Success Story"];
const POPULAR_TAGS = ["#poscura", "#progress", "#desklife", "#wellness", "#mobility", "#posture", "#stretch", "#neckpain"];
type SortKey = "recent" | "popular";
import { toast } from "sonner";

export const Route = createFileRoute("/community")({ component: CommunityPage });

type Comment = { id: string; user: string; time: string; text: string; likes?: number; liked?: boolean; replies?: Comment[]; image?: string };
type Post = {
  id: string; user: string; handle: string; time: string;
  verified?: boolean; pinned?: boolean; category: string; text: string;
  hashtags?: string[]; likes: number; comments: number; shares: number;
  liked?: boolean; thread?: Comment[];
  /** photos attached to the post (grid of up to 4, "+N" on the last tile) */
  images?: string[];
  /** short form-check clip; plays the exercise demo figure */
  video?: { motion: Motion; duration: string };
  views?: number;
  /** a finished workout session shared from its result screen */
  result?: { title: string; score: number };
};

const SEED_POSTS: Post[] = [
  { id: "p0", user: "Poscura Team", handle: "@poscura", time: "1h", verified: true, pinned: true, category: "Expert Advice",
    text: "New feature: Real-time shoulder protraction alerts are now live for Pro members.", hashtags: ["#poscura"],
    likes: 312, comments: 48, shares: 22, thread: [
      { id: "c01", user: "Uyen Tran", time: "40m", text: "Finally! The shoulder alerts caught me twice this morning.", likes: 12, replies: [
        { id: "c01r1", user: "Poscura Team", time: "32m", text: "Love to hear it. You can tune how sensitive they are in Settings → Alerts.", likes: 5 },
      ] },
      { id: "c02", user: "Ben Hughes", time: "25m", text: "Is this coming to the free plan later?", likes: 3 },
    ] },
  { id: "p4", user: "Linh Pham", handle: "@linhp", time: "1h", category: "Milestone",
    text: "Finally sorted my desk after the ergonomics webinar: monitor on an arm at eye level, laptop on a stand, lamp off to the side. Neck feels so much better by 5pm.",
    hashtags: ["#desksetup", "#progress"], images: [deskSetupImg], views: 1840, likes: 204, comments: 3, shares: 12, thread: [
      { id: "c41", user: "Ruby Nguyen", time: "52m", text: "That light is gorgeous. Here's my afternoon reset kit 👇", image: stretchBreakImg, likes: 18, replies: [
        { id: "c41r1", user: "Linh Pham", time: "40m", text: "Stealing the checklist idea!", likes: 4 },
      ] },
      { id: "c42", user: "Dr. Naomi Park", time: "35m", text: "Textbook setup. Top of the screen at eye level is exactly right.", likes: 11 },
    ] },
  { id: "p5", user: "Ruby Nguyen", handle: "@rubyn", time: "3h", category: "Success Story",
    text: "Week 4 recap: walks before work, a 3pm stretch break with the team, and my desk finally set up right. Posture score up from 61 to 84!",
    hashtags: ["#successstory"], images: [parkWalkImg, teamStretchImg, deskSetupImg, stretchBreakImg, parkWalkImg], views: 3120,
    likes: 356, comments: 2, shares: 19, thread: [
      { id: "c51", user: "Ken Ito", time: "2h", text: "The team stretch break is such a good idea. Pitching it at work tomorrow.", likes: 7 },
      { id: "c52", user: "Poscura Team", time: "1h", text: "Huge jump, Ruby. Thanks for sharing your routine with everyone!", likes: 21 },
    ] },
  { id: "p6", user: "Coach Minh", handle: "@coachminh", time: "4h", verified: true, category: "Expert Advice",
    text: "Form check: chin tucks. Keep your eyes level and glide the head straight back, like making a double chin. No nodding.",
    hashtags: ["#formcheck"], video: { motion: "nod", duration: "0:24" }, views: 5210,
    likes: 488, comments: 6, shares: 64, thread: [
      { id: "c61", user: "Uyen Do", time: "3h", text: "I've been nodding this whole time 😅 thank you!", likes: 15, replies: [
        { id: "c61r1", user: "Coach Minh", time: "3h", text: "Super common! Try it with your back against a wall first.", likes: 9 },
        { id: "c61r2", user: "Ruby Nguyen", time: "2h", text: "The wall trick helped me too.", likes: 3 },
        { id: "c61r3", user: "Ben Hughes", time: "2h", text: "Same here, way easier to feel it.", likes: 2 },
        { id: "c61r4", user: "Linh Pham", time: "1h", text: "Doing this during my next break.", likes: 1 },
      ] },
    ] },
  { id: "p1", user: "Alex Kovacs", handle: "@alexk", time: "2h", category: "Milestone",
    text: "Hit a 90 posture score for the first time today after 3 weeks of the neck plan!",
    hashtags: ["#progress"], likes: 142, comments: 18, shares: 6, thread: [
      { id: "c1", user: "Maria S.", time: "1h", text: "Insane progress! What program?", likes: 4, replies: [
        { id: "c1r1", user: "Alex Kovacs", time: "48m", text: "The 4-week neck plan, 2 sessions a day. Chin tucks were the game changer.", likes: 6 },
      ] },
      { id: "c2", user: "Dr. Naomi Park", time: "30m", text: "Great consistency. Keep the sessions short and you'll hold that score.", likes: 9 },
    ] },
  { id: "p2", user: "Maria Santos", handle: "@marias", time: "5h", category: "Question",
    text: "Wall angels at lunch break really help reset shoulders. Anyone else?",
    hashtags: ["#desklife"], likes: 89, comments: 24, shares: 4, thread: [
      { id: "c3", user: "Ken Ito", time: "3h", text: "Every day at 12:30. My upper back thanks me.", likes: 2 },
    ] },
  { id: "p3", user: "Dr. Naomi Park", handle: "@drpark", time: "8h", verified: true, category: "Expert Advice",
    text: "Pair monitoring sessions with a standing desk for an average +18 point posture jump.",
    hashtags: ["#wellness"], likes: 296, comments: 42, shares: 31, thread: [] },
];

const initials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div className="rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </div>
  );
}

function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [draft, setDraft] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState<string>("All Feeds");
  const [sortBy, setSortBy] = useState<SortKey>("recent");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("community:share");
      if (!raw) return;
      sessionStorage.removeItem("community:share");
      const payload = JSON.parse(raw) as any;
      setPosts((ps) => [{
        id: `shared-${Date.now()}`, user: "You", handle: "@you", time: "now",
        category: "Milestone", text: payload.kind === "result" ? "Just finished a session!" : payload.text || "Shared from my session!",
        hashtags: ["#progress"], likes: 0, comments: 0, shares: 0, thread: [],
        result: payload.kind === "result" ? { title: payload.title, score: payload.score } : undefined,
      }, ...ps]);
      toast.success("Shared to Community");
    } catch {}
  }, []);

  const update = (id: string, patch: Partial<Post>) =>
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const toggleLike = (id: string) => {
    const p = posts.find((x) => x.id === id); if (!p) return;
    update(id, { liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) });
  };

  const submitPost = () => {
    if (!draft.trim()) return;
    setPosts((ps) => [{
      id: `u${Date.now()}`, user: "You", handle: "@you", time: "now",
      category: "Posture Tip", text: draft.trim(), likes: 0, comments: 0, shares: 0, thread: [],
    }, ...ps]);
    setDraft("");
    toast.success("Posted!");
  };

  const addComment = (postId: string, text: string, replyTo?: string) => {
    const p = posts.find((x) => x.id === postId); if (!p) return;
    const newC: Comment = { id: `c${Date.now()}`, user: "You", time: "now", text, likes: 0 };
    const thread = replyTo
      ? (p.thread || []).map((c) => (c.id === replyTo ? { ...c, replies: [...(c.replies || []), newC] } : c))
      : [...(p.thread || []), newC];
    update(postId, { thread, comments: p.comments + 1 });
  };

  const toggleCommentLike = (postId: string, commentId: string) => {
    const p = posts.find((x) => x.id === postId); if (!p) return;
    const flip = (c: Comment): Comment =>
      c.id === commentId ? { ...c, liked: !c.liked, likes: (c.likes || 0) + (c.liked ? -1 : 1) } : { ...c, replies: c.replies?.map(flip) };
    update(postId, { thread: (p.thread || []).map(flip) });
  };

  const detail = detailId ? posts.find((p) => p.id === detailId) : undefined;
  if (detail) {
    return (
      <>
        <PostDetail
          post={detail}
          onBack={() => setDetailId(null)}
          onLike={() => toggleLike(detail.id)}
          onShare={() => setSharePost(detail)}
          onComment={(text, replyTo) => addComment(detail.id, text, replyTo)}
          onLikeComment={(cid) => toggleCommentLike(detail.id, cid)}
        />
        {sharePost && (
          <ShareDialog
            post={sharePost}
            onClose={() => setSharePost(null)}
            onShared={(channel) => { update(sharePost.id, { shares: sharePost.shares + 1 }); toast.success(`Shared to ${channel}`); }}
          />
        )}
      </>
    );
  }

  const activeFilterCount =
    (category !== "All Feeds" ? 1 : 0) + (sortBy !== "recent" ? 1 : 0) + selectedTags.length;

  const q = searchQ.trim().toLowerCase();
  let filtered = posts.filter((p) => category === "All Feeds" || p.category === category);
  if (selectedTags.length > 0) {
    filtered = filtered.filter((p) =>
      selectedTags.some((t) =>
        (p.hashtags || []).map((h) => h.toLowerCase()).includes(t.toLowerCase()) ||
        p.text.toLowerCase().includes(t.toLowerCase()),
      ),
    );
  }
  if (q) {
    filtered = filtered.filter((p) =>
      p.text.toLowerCase().includes(q) ||
      p.user.toLowerCase().includes(q) ||
      p.handle.toLowerCase().includes(q) ||
      (p.hashtags || []).some((h) => h.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q),
    );
  }
  if (sortBy === "popular") filtered = [...filtered].sort((a, b) => b.likes - a.likes);

  return (
    <div className="pb-20 fold:mx-auto fold:grid fold:max-w-[980px] fold:grid-cols-[220px_minmax(0,1fr)] land:grid-cols-[240px_minmax(0,1fr)] fold:items-start fold:gap-6 fold:pb-6">
      <CommunitySide
        posts={posts}
        category={category} setCategory={setCategory}
        sortBy={sortBy} setSortBy={setSortBy}
        selectedTags={selectedTags} setSelectedTags={setSelectedTags}
      />
      <div className="space-y-3 fold:col-start-2 fold:row-start-1">
      <div className="sticky top-14 -mx-4 px-4 py-2 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50 space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold flex-1">Community</h1>
          <button
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Search"
            className={`h-9 w-9 rounded-lg border flex items-center justify-center ${
              searchOpen || searchQ
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            <Search className="h-4 w-4" />
          </button>
          <div className="relative fold:hidden">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              aria-label="Filter"
              className={`relative h-9 w-9 rounded-lg border flex items-center justify-center ${
                filterOpen || activeFilterCount > 0
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {filterOpen && (
              <FilterPanel
                category={category} setCategory={setCategory}
                sortBy={sortBy} setSortBy={setSortBy}
                selectedTags={selectedTags} setSelectedTags={setSelectedTags}
                onClose={() => setFilterOpen(false)}
                onReset={() => { setCategory("All Feeds"); setSortBy("recent"); setSelectedTags([]); }}
              />
            )}
          </div>
        </div>
        {searchOpen && (
          <div className="flex items-center gap-2 bg-muted/40 rounded-full px-3 py-1.5 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/50 transition">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search posts, people, hashtags…"
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
            {searchQ && (
              <button onClick={() => setSearchQ("")} aria-label="Clear" className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Inline composer — one row */}
      <div className="glass-card flex items-center gap-2.5 py-2 pl-2.5 pr-2">
        <Avatar name="You" size={32} />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) submitPost(); }}
          placeholder="Share your progress today…"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
        <button aria-label="Add image" className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted/60"><ImageIcon className="h-4 w-4" /></button>
        <button aria-label="Emoji" className="h-8 w-8 shrink-0 rounded-full hidden min-[380px]:flex items-center justify-center text-muted-foreground hover:bg-muted/60"><Smile className="h-4 w-4" /></button>
        <button
          onClick={submitPost}
          disabled={!draft.trim()}
          className="h-8 px-4 shrink-0 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold disabled:opacity-40"
        >
          Post
        </button>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          No posts match your filters.
        </div>
      )}
      <div className="space-y-3">
      {filtered.map((p) => (
        <article key={p.id} className={`glass-card overflow-hidden ${p.pinned ? "border-primary/40 bg-gradient-to-br from-primary/10 to-secondary/5" : ""}`}>
          <header onClick={() => setDetailId(p.id)} className="flex cursor-pointer items-center gap-3 p-3">
            <Avatar name={p.user} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm truncate">{p.user}</span>
                {p.verified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
                {p.pinned && <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-primary/20 text-primary">Pinned</span>}
              </div>
              <div className="text-[11px] text-muted-foreground">{p.time} · {p.category}</div>
            </div>
          </header>
          <p onClick={() => setDetailId(p.id)} className="cursor-pointer px-3 pb-3 text-sm leading-relaxed">
            {p.text} {p.hashtags && <span className="text-primary font-medium">{p.hashtags.join(" ")}</span>}
          </p>
          {(p.images?.length || p.video) && (
            <div className="px-3 pb-3"><PostMedia post={p} onOpen={() => setDetailId(p.id)} /></div>
          )}
          {p.result && (
            <div className="mx-3 mb-3 flex flex-col items-center gap-3 rounded-2xl border border-border bg-[radial-gradient(120%_90%_at_100%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_60%)] bg-background/60 px-4 py-5">
              <ScoreRing score={p.result.score} size={88} stroke={7} />
              <div className="text-center text-[15px] font-semibold">{p.result.title}</div>
            </div>
          )}
          <footer className="flex items-center gap-1 px-2 py-1 border-t border-border/40">
            <button onClick={() => toggleLike(p.id)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${p.liked ? "text-destructive" : "text-muted-foreground"}`}>
              <Heart className={`h-4 w-4 ${p.liked ? "fill-destructive" : ""}`} /> {p.likes}
            </button>
            <button onClick={() => setDetailId(p.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground">
              <MessageCircle className="h-4 w-4" /> {p.comments}
            </button>
            {p.views != null && <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground"><Eye className="h-4 w-4" /> {fmtCount(p.views)}</span>}
            <button onClick={() => setSharePost(p)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground ml-auto">
              <Share2 className="h-4 w-4" /> {p.shares}
            </button>
          </footer>
        </article>
      ))}
      </div>
      </div>


      {sharePost && (
        <ShareDialog
          post={sharePost}
          onClose={() => setSharePost(null)}
          onShared={(channel) => { update(sharePost.id, { shares: sharePost.shares + 1 }); toast.success(`Shared to ${channel}`); }}
        />
      )}
    </div>
  );
}

/** Post details: the post on its own, the full comment thread with one level of replies, and a pinned composer.
 *  Open foldables split it at the hinge: post on the left, conversation on the right. */
function PostDetail({ post, onBack, onLike, onShare, onComment, onLikeComment }: {
  post: Post; onBack: () => void; onLike: () => void; onShare: () => void;
  onComment: (text: string, replyTo?: string) => void; onLikeComment: (commentId: string) => void;
}) {
  useImmersive();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [zoom, setZoom] = useState<{ list: string[]; i: number } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const thread = post.thread || [];
  const total = thread.reduce((n, c) => n + 1 + (c.replies?.length || 0), 0);

  const submit = () => {
    if (!text.trim()) return;
    onComment(text.trim(), replyTo?.id);
    setText(""); setReplyTo(null);
  };
  const reply = (c: Comment) => { setReplyTo(c); inputRef.current?.focus(); };

  return (
    <div data-screen="Post details" className="hinge-split flex min-h-[calc(100dvh-var(--pd-off,104px))] flex-col land:grid-rows-[1fr_auto]">
      {/* ---------- post ---------- */}
      <section className="land:self-start">
        <div className="mb-3 flex items-center gap-2">
          <button onClick={onBack} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] text-foreground/80 transition hover:border-primary/40 hover:text-foreground">
            <ChevronLeft className="h-[18px] w-[18px]" />
          </button>
          <h1 className="text-[17px] font-semibold tracking-tight">Post</h1>
        </div>

        <article className={cn("overflow-hidden rounded-[22px] border bg-card",
          post.pinned ? "border-primary/25 bg-[radial-gradient(120%_80%_at_100%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_60%)]" : "border-white/[0.06]")}>
          <header className="flex items-center gap-3 px-4 pt-4">
            <Avatar name={post.user} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[14.5px] font-semibold">{post.user}</span>
                {post.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                {post.pinned && <span className="rounded-full bg-primary/15 px-1.5 py-px text-[9.5px] font-semibold uppercase tracking-wider text-primary">Pinned</span>}
              </div>
              <div className="text-[12px] text-muted-foreground">{post.handle} · {post.time}</div>
            </div>
            <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[11px] text-muted-foreground">{post.category}</span>
          </header>

          <p className="px-4 pb-4 pt-3 text-[15px] leading-relaxed">
            {post.text} {post.hashtags && <span className="font-medium text-primary">{post.hashtags.join(" ")}</span>}
          </p>

          {(post.images?.length || post.video) && (
            <div className="px-4 pb-4"><PostMedia post={post} large onOpen={(i) => setZoom({ list: post.images || [], i })} /></div>
          )}
          {post.result && (
            <div className="mx-4 mb-4 flex flex-col items-center gap-3 rounded-2xl border border-white/[0.06] bg-background/50 px-4 py-6">
              <ScoreRing score={post.result.score} size={96} stroke={7} />
              <div className="text-center text-[15px] font-semibold">{post.result.title}</div>
            </div>
          )}

          <div className="flex items-center gap-4 border-t border-white/[0.05] px-4 py-2.5 text-[12px] text-muted-foreground">
            <span><b className="font-semibold text-foreground">{post.likes}</b> likes</span>
            <span><b className="font-semibold text-foreground">{total}</b> comments</span>
            <span><b className="font-semibold text-foreground">{post.shares}</b> shares</span>
            {post.views != null && <span className="ml-auto inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{fmtCount(post.views)}</span>}
          </div>
          <div className="grid grid-cols-3 border-t border-white/[0.05]">
            <button onClick={onLike} className={cn("flex h-11 items-center justify-center gap-2 text-[13px] font-medium transition hover:bg-white/[0.03]", post.liked ? "text-destructive" : "text-foreground/80")}>
              <Heart className={cn("h-4 w-4", post.liked && "fill-destructive")} /> Like
            </button>
            <button onClick={() => inputRef.current?.focus()} className="flex h-11 items-center justify-center gap-2 text-[13px] font-medium text-foreground/80 transition hover:bg-white/[0.03]">
              <MessageCircle className="h-4 w-4" /> Comment
            </button>
            <button onClick={onShare} className="flex h-11 items-center justify-center gap-2 text-[13px] font-medium text-foreground/80 transition hover:bg-white/[0.03]">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </article>
      </section>

      {/* ---------- conversation ---------- */}
      {/* fills the rest of the screen so the composer always sits at the bottom, however short the thread */}
      <section className="mt-5 flex flex-1 flex-col land:mt-0">
        <div className="mb-3 flex items-baseline gap-2 land:pt-[38px]">
          <h2 className="text-[14px] font-semibold">Comments & replies</h2>
          <span className="text-[12px] text-muted-foreground">{total}</span>
        </div>

        <div className="flex flex-1 flex-col gap-4 pb-4">
          {thread.length === 0 && (
            <div className="flex flex-1 min-h-[220px] flex-col items-center justify-center px-6 text-center">
              <div className="relative">
                <div aria-hidden className="absolute -inset-6 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_28%,transparent),transparent)]" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/[0.08] bg-gradient-to-br from-primary/25 to-secondary/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <MessagesSquare className="h-7 w-7 text-primary" strokeWidth={1.6} />
                </div>
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-card">
                  <Sparkles className="h-3 w-3 text-secondary" />
                </span>
              </div>
              <h3 className="mt-5 text-[15px] font-semibold">Be the first to comment</h3>
              <p className="mt-1 max-w-[260px] text-[12.5px] leading-relaxed text-muted-foreground">Ask a question or share how this worked for you.</p>
              <button onClick={() => inputRef.current?.focus()} className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-4 text-[12.5px] font-medium transition hover:border-primary/50 hover:text-primary">
                <PenLine className="h-3.5 w-3.5" /> Write a comment
              </button>
            </div>
          )}
          {thread.map((c) => (
            <div key={c.id}>
              <CommentRow c={c} onLike={() => onLikeComment(c.id)} onReply={() => reply(c)} onZoom={(src) => setZoom({ list: [src], i: 0 })} />
              {!!c.replies?.length && (
                <div className="ml-[18px] mt-3 space-y-3 border-l border-white/[0.07] pl-[22px]">
                  {(expanded[c.id] ? c.replies : c.replies.slice(0, 2)).map((r) => <CommentRow key={r.id} c={r} small onLike={() => onLikeComment(r.id)} onReply={() => reply(c)} onZoom={(src) => setZoom({ list: [src], i: 0 })} />)}
                  {c.replies.length > 2 && !expanded[c.id] && (
                    <button onClick={() => setExpanded((e) => ({ ...e, [c.id]: true }))} className="inline-flex items-center gap-2 text-[12px] font-medium text-muted-foreground transition hover:text-foreground">
                      <span className="h-px w-5 bg-white/15" />View {c.replies.length - 2} more {c.replies.length - 2 === 1 ? "reply" : "replies"}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

      </section>

      {/* composer: a child of the page (not the comment column) so it stays pinned even when the post is taller than the screen */}
      <div data-pd-bar className="sticky bottom-0 z-10 -mx-4 -mb-6 mt-auto land:col-start-2 land:row-start-2 land:mt-0 border-t border-white/[0.06] bg-background px-4 pb-3 pt-3 shadow-[0_40px_0_0_var(--background)]">
        {replyTo && (
          <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
            <span>Replying to <b className="font-medium text-foreground">{replyTo.user}</b></span>
            <button onClick={() => setReplyTo(null)} aria-label="Cancel reply" className="ml-auto rounded-full p-1 hover:bg-white/[0.05]"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-card py-1.5 pl-1.5 pr-1.5 focus-within:border-primary/40">
          <Avatar name="You" size={30} />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder={replyTo ? `Reply to ${replyTo.user}` : "Write a comment…"}
            className="min-w-0 flex-1 bg-transparent px-1 text-[13.5px] outline-none placeholder:text-muted-foreground"
          />
          <button onClick={submit} disabled={!text.trim()} aria-label="Send"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary text-white transition disabled:opacity-30">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {zoom && <Lightbox list={zoom.list} start={zoom.i} onClose={() => setZoom(null)} />}
    </div>
  );
}

function CommentRow({ c, small, onLike, onReply, onZoom }: { c: Comment; small?: boolean; onLike: () => void; onReply: () => void; onZoom: (src: string) => void }) {
  return (
    <div className="flex gap-2.5">
      <Avatar name={c.user} size={small ? 28 : 34} />
      <div className="min-w-0 flex-1">
        <div className="rounded-[16px] rounded-tl-[6px] bg-white/[0.04] px-3.5 py-2.5">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[13px] font-semibold">{c.user}</span>
            <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
          </div>
          <p className="mt-0.5 text-[13.5px] leading-relaxed text-foreground/90">{c.text}</p>
        </div>
        {c.image && (
          <button onClick={() => onZoom(c.image!)} className="mt-1.5 block w-full max-w-[240px] overflow-hidden rounded-[14px] border border-white/[0.06]">
            <img src={c.image} alt="" className="aspect-square w-full object-cover transition duration-500 hover:scale-[1.03]" />
          </button>
        )}
        <div className="mt-1 flex items-center gap-4 pl-3.5 text-[11.5px] font-medium text-muted-foreground">
          <button onClick={onLike} className={cn("inline-flex items-center gap-1 transition hover:text-foreground", c.liked && "text-destructive hover:text-destructive")}>
            <Heart className={cn("h-3 w-3", c.liked && "fill-destructive")} />{c.likes ? c.likes : "Like"}
          </button>
          <button onClick={onReply} className="transition hover:text-foreground">Reply</button>
        </div>
      </div>
    </div>
  );
}

function ShareDialog({ post, onClose, onShared }: { post: Post; onClose: () => void; onShared: (channel: string) => void }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `${post.user}: ${post.text}`;
  const channels = [
    { name: "Facebook", icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: "X (Twitter)", icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
    { name: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { name: "WhatsApp", icon: MessageSquare, href: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}` },
    { name: "Telegram", icon: Send, href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}` },
  ];

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); toast.success("Link copied"); } catch { toast.error("Failed to copy"); }
    onShared("Copy link");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-5 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 h-8 w-8 rounded-md text-muted-foreground hover:bg-accent/40 flex items-center justify-center">
          <X className="h-4 w-4" />
        </button>
        <h3 className="text-base font-semibold">Share to your social community</h3>
        <p className="text-xs text-muted-foreground mt-1">Choose where you'd like to share this post.</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {channels.map((c) => (
            <a
              key={c.name}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { onShared(c.name); onClose(); }}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/50 px-2 py-4 hover:border-primary/40 hover:bg-accent/40 transition"
            >
              <c.icon className="h-5 w-5 text-primary" />
              <span className="text-[11px] font-medium text-center">{c.name}</span>
            </a>
          ))}
          <button
            onClick={copyLink}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card/50 px-2 py-4 hover:border-primary/40 hover:bg-accent/40 transition"
          >
            <Link2 className="h-5 w-5 text-primary" />
            <span className="text-[11px] font-medium">Copy link</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  category, setCategory, sortBy, setSortBy, selectedTags, setSelectedTags, onClose, onReset,
}: {
  category: string; setCategory: (c: string) => void;
  sortBy: SortKey; setSortBy: (s: SortKey) => void;
  selectedTags: string[]; setSelectedTags: (t: string[]) => void;
  onClose: () => void; onReset: () => void;
}) {
  const toggleTag = (t: string) =>
    setSelectedTags(selectedTags.includes(t) ? selectedTags.filter((x) => x !== t) : [...selectedTags, t]);
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-11 z-50 w-72 max-w-[92vw] glass-card p-4 shadow-xl space-y-4 bg-background">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Filter & Sort</h3>
          <button onClick={onReset} className="text-xs text-primary hover:underline">Reset</button>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Category</div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const active = category === f;
              return (
                <button key={f} onClick={() => setCategory(f)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full transition border ${
                    active ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground"
                  }`}>{f}</button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Sort by</div>
          <div className="grid grid-cols-2 gap-2">
            {(["recent", "popular"] as SortKey[]).map((s) => {
              const active = sortBy === s;
              return (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition border ${
                    active ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground"
                  }`}>{s === "recent" ? "Most Recent" : "Most Popular"}</button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Tags</div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
            {POPULAR_TAGS.map((t) => {
              const active = selectedTags.includes(t);
              return (
                <button key={t} onClick={() => toggleTag(t)}
                  className={`text-xs px-2.5 py-1 rounded-full transition border inline-flex items-center gap-1 ${
                    active ? "bg-primary/15 border-primary/60 text-primary"
                      : "border-border text-muted-foreground"
                  }`}>
                  {active && <Check className="h-3 w-3" />}{t}
                </button>
              );
            })}
          </div>
        </div>
        <button onClick={onClose}
          className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">Apply</button>
      </div>
    </>
  );
}

/** Foldable-only side pane: feeds with counts, sort, trending tags. */
function CommunitySide({
  posts, category, setCategory, sortBy, setSortBy, selectedTags, setSelectedTags,
}: {
  posts: Post[];
  category: string; setCategory: (c: string) => void;
  sortBy: SortKey; setSortBy: (s: SortKey) => void;
  selectedTags: string[]; setSelectedTags: (t: string[]) => void;
}) {
  const count = (f: string) => (f === "All Feeds" ? posts.length : posts.filter((p) => p.category === f).length);
  const tagCount = (t: string) =>
    posts.filter((p) => (p.hashtags || []).some((h) => h.toLowerCase() === t.toLowerCase()) || p.text.toLowerCase().includes(t.toLowerCase())).length;
  const tags = [...POPULAR_TAGS].sort((a, b) => tagCount(b) - tagCount(a));
  const toggleTag = (t: string) =>
    setSelectedTags(selectedTags.includes(t) ? selectedTags.filter((x) => x !== t) : [...selectedTags, t]);
  return (
    <aside className="hidden fold:sticky fold:top-[72px] fold:col-start-1 fold:row-start-1 fold:block fold:space-y-3">
      <section className="glass-card p-2">
        <div className="flex items-center gap-1.5 px-2.5 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <Layers className="h-3.5 w-3.5" /> Feeds
        </div>
        <nav className="space-y-0.5">
          {FILTERS.map((f) => {
            const on = category === f;
            return (
              <button
                key={f}
                onClick={() => setCategory(f)}
                className={cn(
                  "relative flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[13px] transition",
                  on ? "bg-primary/12 font-semibold text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                {on && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-primary" />}
                {f}
                <span className={cn("text-[11px] tabular-nums", on ? "text-primary" : "text-muted-foreground/70")}>{count(f)}</span>
              </button>
            );
          })}
        </nav>
      </section>

      <section className="glass-card p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Sort</div>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted/40 p-1">
          {([["recent", "Recent", Clock3], ["popular", "Popular", Flame]] as const).map(([k, l, I]) => (
            <button
              key={k}
              onClick={() => setSortBy(k)}
              className={cn(
                "flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition",
                sortBy === k ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <I className="h-3.5 w-3.5" /> {l}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"><Hash className="h-3.5 w-3.5" /> Trending</span>
          {selectedTags.length > 0 && (
            <button onClick={() => setSelectedTags([])} className="text-[11px] font-medium text-primary hover:underline">Clear</button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => {
            const on = selectedTags.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition",
                  on ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </section>
    </aside>
  );
}

const fmtCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `${n}`);

/** Photos (1 = wide, 2 = side by side, 3 = one tall + two, 4+ = 2×2 with "+N") or a form-check clip. */
function PostMedia({ post, large, onOpen }: { post: Post; large?: boolean; onOpen: (i: number) => void }) {
  const [playing, setPlaying] = useState(true);
  if (post.video) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,#8fc6e6,#5aa0d0)]">
        <div className={cn("absolute inset-0 flex items-end justify-center", !playing && "[&_*]:[animation-play-state:paused]")}>
          <div className="h-[118%] w-auto">{playing ? <Figure motion={post.video.motion} light /> : <Figure motion={"nod"} light />}</div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
        <button onClick={() => setPlaying((v) => !v)} aria-label={playing ? "Pause" : "Play"}
          className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60">
          {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 translate-x-px fill-current" />}
        </button>
        <span className="absolute bottom-4 right-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white backdrop-blur-md">{post.video.duration}</span>
        <span className="absolute left-3 top-3 rounded-full bg-black/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">Form check</span>
      </div>
    );
  }
  const imgs = post.images || [];
  const tile = (src: string, i: number, cls: string, more = 0) => (
    <button key={i} onClick={() => onOpen(i)} className={cn("group relative overflow-hidden bg-white/[0.04]", cls)}>
      <img src={src} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
      {more > 0 && <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-[22px] font-semibold text-white backdrop-blur-[2px]">+{more}</span>}
    </button>
  );
  if (imgs.length === 1) return <div className="overflow-hidden rounded-2xl border border-white/[0.06]">{tile(imgs[0], 0, cn("block w-full aspect-[3/2]", large && "land:aspect-[16/9]"))}</div>;
  if (imgs.length === 2) return <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-2xl">{imgs.map((src, i) => tile(src, i, "aspect-[4/5]"))}</div>;
  if (imgs.length === 3)
    return (
      <div className="grid aspect-[3/2] grid-cols-[1.4fr_1fr] grid-rows-2 gap-1 overflow-hidden rounded-2xl">
        {tile(imgs[0], 0, "row-span-2")}{tile(imgs[1], 1, "")}{tile(imgs[2], 2, "")}
      </div>
    );
  return (
    <div className={cn("grid grid-cols-2 gap-1 overflow-hidden rounded-2xl", large ? "aspect-[4/3] land:aspect-[16/10]" : "aspect-square")}>
      {imgs.slice(0, 4).map((src, i) => tile(src, i, "", i === 3 ? imgs.length - 4 : 0))}
    </div>
  );
}

function Lightbox({ list, start, onClose }: { list: string[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const go = (d: number) => setI((x) => (x + d + list.length) % list.length);
  return (
    <div onClick={onClose} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <img key={i} src={list[i]} alt="" onClick={(e) => e.stopPropagation()} className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl animate-in fade-in zoom-in-95 duration-200" />
      <button data-lightbox-close aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"><X className="h-4 w-4" /></button>
      {list.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous" className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"><ChevronLeft className="h-5 w-5" /></button>
          <button data-lightbox-next onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next" className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20"><ChevronRight className="h-5 w-5" /></button>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium tabular-nums text-white">{i + 1} / {list.length}</span>
        </>
      )}
    </div>
  );
}
