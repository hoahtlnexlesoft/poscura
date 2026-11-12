import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Heart, MessageCircle, Share2, BadgeCheck, Send, X,
  Facebook, Twitter, Linkedin, MessageSquare, Link2, ImageIcon, Smile,
  Search, SlidersHorizontal, Check,
} from "lucide-react";

const FILTERS = ["All Feeds", "Expert Advice", "Milestone", "Question", "Posture Tip", "Success Story"];
const POPULAR_TAGS = ["#poscura", "#progress", "#desklife", "#wellness", "#mobility", "#posture", "#stretch", "#neckpain"];
type SortKey = "recent" | "popular";
import { toast } from "sonner";

export const Route = createFileRoute("/community")({ component: CommunityPage });

type Comment = { id: string; user: string; time: string; text: string };
type Post = {
  id: string; user: string; handle: string; time: string;
  verified?: boolean; pinned?: boolean; category: string; text: string;
  hashtags?: string[]; likes: number; comments: number; shares: number;
  liked?: boolean; thread?: Comment[];
};

const SEED_POSTS: Post[] = [
  { id: "p0", user: "Poscura Team", handle: "@poscura", time: "1h", verified: true, pinned: true, category: "Expert Advice",
    text: "New feature: Real-time shoulder protraction alerts are now live for Pro members.", hashtags: ["#poscura"],
    likes: 312, comments: 48, shares: 22, thread: [] },
  { id: "p1", user: "Alex Kovacs", handle: "@alexk", time: "2h", category: "Milestone",
    text: "Hit a 90 posture score for the first time today after 3 weeks of the neck plan!",
    hashtags: ["#progress"], likes: 142, comments: 18, shares: 6, thread: [
      { id: "c1", user: "Maria S.", time: "1h", text: "Insane progress! What program?" },
    ] },
  { id: "p2", user: "Maria Santos", handle: "@marias", time: "5h", category: "Question",
    text: "Wall angels at lunch break really help reset shoulders. Anyone else?",
    hashtags: ["#desklife"], likes: 89, comments: 24, shares: 4, thread: [] },
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
  const [commentPost, setCommentPost] = useState<Post | null>(null);
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
        category: "Milestone", text: payload.text || "Shared from my session!",
        hashtags: ["#progress"], likes: 0, comments: 0, shares: 0, thread: [],
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

  const addComment = (postId: string, text: string) => {
    const p = posts.find((x) => x.id === postId); if (!p) return;
    const newC: Comment = { id: `c${Date.now()}`, user: "You", time: "now", text };
    update(postId, { thread: [...(p.thread || []), newC], comments: p.comments + 1 });
  };

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
    <div className="space-y-3 pb-20 fold:max-w-[680px] fold:mx-auto">
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
          <div className="relative">
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
          <header className="flex items-center gap-3 p-3">
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
          <p className="px-3 pb-3 text-sm leading-relaxed">
            {p.text} {p.hashtags && <span className="text-primary font-medium">{p.hashtags.join(" ")}</span>}
          </p>
          <footer className="flex items-center gap-1 px-2 py-1 border-t border-border/40">
            <button onClick={() => toggleLike(p.id)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${p.liked ? "text-destructive" : "text-muted-foreground"}`}>
              <Heart className={`h-4 w-4 ${p.liked ? "fill-destructive" : ""}`} /> {p.likes}
            </button>
            <button onClick={() => setCommentPost(p)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground">
              <MessageCircle className="h-4 w-4" /> {p.comments}
            </button>
            <button onClick={() => setSharePost(p)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground ml-auto">
              <Share2 className="h-4 w-4" /> {p.shares}
            </button>
          </footer>
        </article>
      ))}
      </div>

      {commentPost && (
        <CommentSheet
          post={posts.find((p) => p.id === commentPost.id)!}
          onClose={() => setCommentPost(null)}
          onAdd={(text) => addComment(commentPost.id, text)}
        />
      )}

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

function CommentSheet({ post, onClose, onAdd }: { post: Post; onClose: () => void; onAdd: (text: string) => void }) {
  const [text, setText] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end" onClick={onClose}>
      <div className="w-full bg-card rounded-t-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold">Comments ({post.comments})</h3>
          <button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {(post.thread || []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first!</p>
          )}
          {(post.thread || []).map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar name={c.user} size={30} />
              <div className="flex-1 bg-muted/40 rounded-2xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs">{c.user}</span>
                  <span className="text-[10px] text-muted-foreground">{c.time}</span>
                </div>
                <p className="text-sm mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 p-3 border-t border-border/50">
          <Avatar name="You" size={30} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="Write a comment…"
            autoFocus
            className="flex-1 bg-muted/40 rounded-full px-4 py-2 text-sm outline-none"
          />
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
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
