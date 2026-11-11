import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { ArrowLeft, Camera, X, ListChecks } from "lucide-react";
import { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SUPPORT_TYPES, addTicket } from "@/lib/tickets-store";

export const Route = createFileRoute("/support/report")({ component: ReportPage });

function ReportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [supportType, setSupportType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const titleError = touched && title.trim().length < 1;
  const typeError = touched && !supportType;
  const descError = touched && description.trim().length < 10;
  const titleOk = title.trim().length >= 1;
  const typeOk = !!supportType;
  const descOk = description.trim().length >= 10;

  const handlePickFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos: string[] = [];
    let processed = 0;
    const total = files.length;
    for (let i = 0; i < total; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) continue;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          newPhotos.push(reader.result);
        }
        processed++;
        if (processed === total) {
          setPhotos((prev) => [...prev, ...newPhotos]);
        }
      };
      reader.onerror = () => {
        processed++;
        if (processed === total) {
          setPhotos((prev) => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = () => {
    setTouched(true);
    if (!title.trim() || !supportType || description.trim().length < 10) return;
    const t = addTicket({
      title: title.trim(),
      supportType,
      description: description.trim(),
      photos: photos.length ? photos : null,
    });
    router.navigate({ to: "/support/tickets/$id", params: { id: t.id } });
  };

  return (
    <div className="-mx-4 -mt-4 min-h-full flex flex-col">
      <header className="h-14 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border flex items-center px-4 gap-2">
        <button
          onClick={() => router.history.back()}
          aria-label="Back"
          className="h-9 w-9 -ml-2 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-base font-semibold flex-1">Report an Issue</h1>
        <Link
          to="/support/tickets"
          aria-label="My tickets"
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <ListChecks className="h-5 w-5" />
        </Link>
      </header>

      <div className="p-4 flex-1 flex flex-col gap-5 fold:grid fold:grid-cols-2 fold:items-start">
        <div className="contents fold:flex fold:flex-col fold:gap-5">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short summary of your issue"
            maxLength={120}
            className={cn(
              "h-11 rounded-xl",
              titleError && "border-destructive focus-visible:ring-destructive",
              titleOk && "border-emerald-500/70",
            )}
          />
          {titleError && (
            <p className="text-xs text-destructive">Please enter a title.</p>
          )}
        </div>

        {/* Support type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Support Type</label>
          <Select value={supportType} onValueChange={setSupportType}>
            <SelectTrigger
              className={cn(
                "h-11 rounded-xl",
                typeError && "border-destructive focus:ring-destructive",
                typeOk && "border-emerald-500/70",
              )}
            >
              <SelectValue placeholder="Select support type" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {typeError && (
            <p className="text-xs text-destructive">Please choose a support type.</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue in detail..."
            className={cn(
              "min-h-[120px] rounded-xl resize-none",
              descError && "border-destructive focus-visible:ring-destructive",
              descOk && "border-emerald-500/70",
            )}
          />
          {descError && (
            <p className="text-xs text-destructive">
              Please add at least 10 characters describing your issue.
            </p>
          )}
        </div>

        </div>
        <div className="contents fold:flex fold:flex-col fold:gap-5">
        {/* Attached photos */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Attached Photos</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handlePickFiles(e.target.files)}
          />
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border border-border">
                  <img
                    src={src}
                    alt={`Attachment preview ${i + 1}`}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    aria-label="Remove photo"
                    className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-muted/30 transition-colors py-6 flex flex-col items-center justify-center gap-2 text-muted-foreground"
          >
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Camera className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Tap to upload photos</span>
            <span className="text-xs">PNG or JPG up to 5MB each</span>
          </button>
        </div>

        <div className="flex-1 fold:hidden" />

        <button
          onClick={submit}
          className="w-full py-3.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Send
        </button>
        </div>
      </div>
    </div>
  );
}
