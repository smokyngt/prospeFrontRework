"use client";

import DOMPurify from "isomorphic-dompurify";
import { CalendarDays, Check, Copy, Send } from "lucide-react";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { Modal } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContactFormData = {
  company: string;
  email: string;
  message?: string;
  name: string;
  phone?: string;
  subject: string;
};

type BusySlot = { end: string; start: string };
type CalendarAvailabilityPayload = { data?: { busy?: BusySlot[] } };
type CalendarEventPayload = {
  data?: { eventId?: string; htmlLink?: string; meetLink?: string };
};
type ApiErrorPayload = {
  error?: {
    fields?: Array<{ field: string; message: string }>;
    message?: string;
  };
  errors?: Array<{ field: string; message: string }>;
};

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 16);
}

function slotLabel(slot: Date, locale: string): string {
  return slot.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function dateLabel(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    weekday: "short",
  });
}

async function readApiError(
  response: Response,
  fallback: string,
): Promise<string> {
  const payload = (await response
    .json()
    .catch(() => null)) as ApiErrorPayload | null;
  const fields = payload?.error?.fields ?? payload?.errors ?? [];

  if (fields.length) {
    return fields.map((field) => field.message).join(" ");
  }

  return payload?.error?.message ?? fallback;
}

export default function ContactForm() {
  const { i18n, t } = useTranslation();
  const language = i18n.language.startsWith("fr") ? "fr" : "en";
  const locale = language === "fr" ? "fr-FR" : "en-US";

  const [form, setForm] = useState<ContactFormData>({
    company: "",
    email: "",
    message: "",
    name: "",
    phone: "",
    subject: "",
  });
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [busy, setBusy] = useState<BusySlot[]>([]);
  const [rangeStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    return formatDateInput(date);
  });
  const [rangeEnd] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 8);
    date.setHours(18, 0, 0, 0);
    return formatDateInput(date);
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotsVisible, setSlotsVisible] = useState(false);
  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  const [copiedInvite, setCopiedInvite] = useState(false);

  const slots = useMemo(() => {
    const output: Date[] = [];
    const cursor = new Date(rangeStart);
    const end = new Date(rangeEnd);

    cursor.setMinutes(Math.ceil(cursor.getMinutes() / 15) * 15, 0, 0);

    while (cursor < end) {
      const slotEnd = new Date(cursor);
      slotEnd.setMinutes(slotEnd.getMinutes() + 15);
      const day = cursor.getDay();
      const hour = cursor.getHours();
      const overlaps = busy.some(
        (item) => new Date(item.start) < slotEnd && new Date(item.end) > cursor,
      );

      if (day !== 0 && day !== 6 && hour >= 9 && hour < 18 && !overlaps) {
        output.push(new Date(cursor));
      }

      cursor.setMinutes(cursor.getMinutes() + 15);
    }

    return output;
  }, [busy, rangeEnd, rangeStart]);

  const availableDates = useMemo(() => {
    const dates = new Map<string, Date>();

    slots.forEach((slot) => {
      const key = dateKey(slot);

      if (!dates.has(key)) {
        dates.set(key, slot);
      }
    });

    return Array.from(dates, ([key, date]) => ({ date, key }));
  }, [slots]);

  const selectedDateSlots = useMemo(
    () => slots.filter((slot) => dateKey(slot) === selectedDate),
    [selectedDate, slots],
  );

  useEffect(() => {
    if (!slotsVisible || selectedDate || !availableDates.length) {
      return;
    }

    setSelectedDate(availableDates[0].key);
  }, [availableDates, selectedDate, slotsVisible]);

  const fieldClass =
    "w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-300 dark:border-neutral-800 dark:bg-neutral-950";

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const checkAvailability = async () => {
    setIsChecking(true);
    setStatus("");
    setSelectedDate("");
    setSelectedSlot("");
    setSlotsVisible(false);
    try {
      const response = await fetch("/api/workspace/calendar/availability", {
        body: JSON.stringify({
          end: new Date(rangeEnd).toISOString(),
          start: new Date(rangeStart).toISOString(),
          timezone: "Europe/Paris",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, t("contact.form.unavailable")),
        );
      }

      const result = (await response.json()) as CalendarAvailabilityPayload;
      setBusy(result.data?.busy ?? []);
      setSlotsVisible(true);
    } catch (error) {
      setBusy([]);
      setStatus(
        error instanceof Error ? error.message : t("contact.form.unavailable"),
      );
    } finally {
      setIsChecking(false);
    }
  };

  const openMeetingModal = () => {
    setMeetingModalOpen(true);
    void checkAvailability();
  };

  const selectSlot = (iso: string) => {
    setSelectedSlot(iso);
    setMeetingModalOpen(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    setStatus("");
    setMeetLink("");

    const safe = {
      company: DOMPurify.sanitize(form.company),
      email: DOMPurify.sanitize(form.email),
      marketingConsent,
      message: DOMPurify.sanitize(form.message ?? ""),
      name: DOMPurify.sanitize(form.name),
      phone: DOMPurify.sanitize(form.phone ?? ""),
      subject: DOMPurify.sanitize(form.subject),
    };

    try {
      if (!selectedSlot) {
        setStatus(t("contact.form.selectSlot"));
        return;
      }

      const start = new Date(selectedSlot);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 15);
      const response = await fetch("/api/workspace/calendar/events", {
        body: JSON.stringify({
          attendees: [safe.email],
          company: safe.company,
          description: safe.message
            ? `${safe.company}\n${safe.message}`
            : safe.company,
          email: safe.email,
          end: end.toISOString(),
          name: safe.name,
          start: start.toISOString(),
          summary: `${t("contact.meeting.title")} - ${
            safe.company || safe.name
          }`,
          timezone: "Europe/Paris",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, t("contact.form.statusSendError")),
        );
      }

      const payload = ((await response.json()) as CalendarEventPayload).data;
      setMeetLink(payload?.meetLink ?? payload?.htmlLink ?? "");
      setCopiedInvite(false);
      setStatus(t("contact.form.success"));

      setForm({
        company: "",
        email: "",
        name: "",
        phone: "",
        subject: "",
      });
      setMarketingConsent(false);
      setSelectedSlot("");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : t("contact.form.statusSendError"),
      );
    } finally {
      setIsSending(false);
    }
  };

  const copyInvitationLink = async () => {
    if (!meetLink) {
      return;
    }

    await navigator.clipboard.writeText(meetLink);
    setCopiedInvite(true);
    window.setTimeout(() => setCopiedInvite(false), 1800);
  };

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      <p className="border-l-2 border-orange-500 pl-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
        {t("contact.form.intro")}
      </p>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          {t("contact.form.details")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={fieldClass}
            maxLength={60}
            name="name"
            onChange={handleChange}
            placeholder={t("contact.form.namePlaceholder")}
            required
            type="text"
            value={form.name}
          />
          <input
            className={fieldClass}
            maxLength={80}
            name="company"
            onChange={handleChange}
            placeholder={t("contact.form.companyPlaceholder")}
            required
            type="text"
            value={form.company}
          />
          <input
            className={fieldClass}
            maxLength={120}
            name="email"
            onChange={handleChange}
            placeholder={t("contact.form.emailPlaceholder")}
            required
            type="email"
            value={form.email}
          />
          <input
            className={fieldClass}
            maxLength={30}
            name="phone"
            onChange={handleChange}
            placeholder={t("contact.form.phonePlaceholder")}
            type="tel"
            value={form.phone}
          />
        </div>
      </section>

      <section>
        <Select
          onValueChange={(value) =>
            setForm((current) => ({ ...current, subject: value }))
          }
          value={form.subject}
        >
          <SelectTrigger className="w-full rounded-none border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-950">
            <SelectValue placeholder={t("contact.form.subjectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="information">
              {t("contact.form.subjectInformation")}
            </SelectItem>
            <SelectItem value="partnership">
              {t("contact.form.subjectPartnership")}
            </SelectItem>
            <SelectItem value="other">
              {t("contact.form.subjectOther")}
            </SelectItem>
            <SelectItem value="api">{t("contact.form.subjectApi")}</SelectItem>
            <SelectItem value="virtual-partner">
              {t("contact.form.subjectVirtualPartner")}
            </SelectItem>
          </SelectContent>
        </Select>
        <textarea
          aria-label={t("contact.form.messagePlaceholder")}
          className={`${fieldClass} mt-3 max-h-56 min-h-32 resize-y`}
          maxLength={1000}
          name="message"
          onChange={handleChange}
          placeholder={t("contact.form.messagePlaceholder")}
          value={form.message ?? ""}
        />
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          <CalendarDays className="h-4 w-4 text-orange-500" />
          {t("contact.form.meeting")}
        </h3>
        <button
          className="inline-flex w-full items-center justify-center gap-2 border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
          disabled={isChecking}
          onClick={openMeetingModal}
          type="button"
        >
          <CalendarDays className="h-4 w-4" />
          {isChecking
            ? t("contact.form.checking")
            : selectedSlot
              ? `${dateLabel(new Date(selectedSlot), locale)} · ${slotLabel(new Date(selectedSlot), locale)}`
              : t("contact.form.meetingCta")}
        </button>
        {selectedSlot ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <Check className="h-3.5 w-3.5 text-orange-500" />
            {t("contact.form.note")}
          </p>
        ) : null}

        <Modal
          onClose={() => setMeetingModalOpen(false)}
          open={meetingModalOpen}
          title={t("contact.form.meeting")}
        >
          {isChecking ? (
            <p className="py-4 text-center text-sm text-neutral-500">
              {t("contact.form.checking")}
            </p>
          ) : slotsVisible && availableDates.length ? (
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {t("contact.form.availableDates")}
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {availableDates.map(({ date, key }) => {
                    const selected = selectedDate === key;

                    return (
                      <button
                        key={key}
                        className={
                          selected
                            ? "border border-orange-500 bg-orange-50 px-3 py-2 text-left text-sm font-semibold text-orange-700 dark:border-orange-400 dark:bg-orange-500/15 dark:text-orange-200"
                            : "border border-neutral-200 bg-white px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:border-orange-200 hover:text-orange-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                        }
                        onClick={() => {
                          setSelectedDate(key);
                          setSelectedSlot("");
                        }}
                        type="button"
                      >
                        {dateLabel(date, locale)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDateSlots.length ? (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    {t("contact.form.available")}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-4">
                    {selectedDateSlots.map((slot) => {
                      const iso = slot.toISOString();
                      const selected = selectedSlot === iso;

                      return (
                        <button
                          key={iso}
                          className={
                            selected
                              ? "border border-orange-500 bg-orange-50 px-3 py-2 text-left text-sm font-semibold text-orange-700 dark:border-orange-400 dark:bg-orange-500/15 dark:text-orange-200"
                              : "border border-neutral-200 bg-white px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:border-orange-200 hover:text-orange-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                          }
                          onClick={() => selectSlot(iso)}
                          type="button"
                        >
                          {slotLabel(slot, locale)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : slotsVisible ? (
            <p className="border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
              {t("contact.form.noSlots")}
            </p>
          ) : null}
        </Modal>
      </section>

      <div className="space-y-4 border-t border-neutral-200 pt-5 dark:border-neutral-800">
        <div className="flex items-start gap-3">
          <input
            checked={marketingConsent}
            className="mt-0.5 h-4 w-4 shrink-0 accent-orange-500"
            id="marketing-consent"
            onChange={(e) => setMarketingConsent(e.target.checked)}
            type="checkbox"
          />
          <label
            className="text-xs leading-5 text-neutral-500 dark:text-neutral-400"
            htmlFor="marketing-consent"
          >
            {t("contact.form.consent")}
          </label>
        </div>

        <div className="rounded border border-neutral-200 bg-neutral-50 px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/50">
          <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
            {t("contact.form.privacyNotice")}{" "}
            <a
              className="text-orange-600 underline underline-offset-2 hover:text-orange-700 dark:text-orange-400"
              href="/privacy"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("contact.form.privacy")}
            </a>
            {t("contact.form.privacyComplaint")}
          </p>
        </div>
      </div>

      <button
        className="inline-flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-3 text-sm font-semibold text-[var(--pf-on-accent)] transition-colors hover:bg-orange-600 disabled:opacity-50"
        disabled={isSending}
        type="submit"
      >
        <Send className="h-4 w-4" />
        {isSending ? t("contact.form.scheduling") : t("contact.form.schedule")}
      </button>

      {status ? (
        <p className="border border-neutral-200 bg-white px-4 py-3 text-center text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
          {status}
        </p>
      ) : null}
      {meetLink ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            className="block border border-orange-200 bg-orange-50 px-4 py-3 text-center text-sm font-semibold text-orange-700"
            href={meetLink}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("contact.form.openInvite")}
          </a>
          <button
            className="inline-flex items-center justify-center gap-2 border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:border-orange-300 hover:text-orange-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
            onClick={copyInvitationLink}
            type="button"
          >
            <Copy className="h-4 w-4" />
            {copiedInvite
              ? t("contact.form.copied")
              : t("contact.form.copyInvite")}
          </button>
        </div>
      ) : null}
    </form>
  );
}
