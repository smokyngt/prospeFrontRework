'use client';

import DOMPurify from 'isomorphic-dompurify';
import { CalendarDays, Check, Copy, Send } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uiLanguage } from '@/features/landing/lib/theme';

import { PhoneInput } from './phone-input';

type ContactFormData = {
  company: string;
  email: string;
  message?: string;
  name: string;
  phone?: string;
  subject: string;
};

type BusySlot = { end: string; start: string };
type AvailabilityPayload = { data?: { busy?: BusySlot[] } };
type CalendarEventPayload = {
  data?: { eventId?: string; htmlLink?: string; meetLink?: string };
};
type ApiErrorPayload = {
  error?: {
    fields?: Array<{ field: string; message: string }>;
    message?: string;
  };
};

function dateKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

const readApiError = async (response: Response, fallback: string): Promise<string> => {
  const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
  const fields = payload?.error?.fields ?? [];

  if (fields.length) {
    return fields.map((field) => field.message).join(' ');
  }

  return payload?.error?.message ?? fallback;
};

export default function ContactForm() {
  const { i18n, t } = useTranslation();
  const language = uiLanguage(i18n.language);
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';
  const copy = {
    en: {
      available: 'Available slots',
      availableDates: 'Available dates',
      change: 'Change',
      checking: 'Checking...',
      checkSlots: 'Find a slot',
      confirm: 'Confirm this slot',
      consent: 'I agree to receive product updates and tips (optional)',
      copied: 'Copied',
      copyInvite: 'Copy invitation link',
      end: 'End',
      meeting: 'Meeting',
      meetingCta: 'See available 15-minute slots',
      meetingRemove: 'Remove meeting',
      noSlots: 'No available slots were returned for the next few business days.',
      note: 'This will create a 15-minute Google Meet invitation.',
      privacy: 'Privacy Policy',
      schedule: 'Send and schedule',
      scheduling: 'Scheduling...',
      start: 'Start',
      success: 'Meeting scheduled. You will receive the calendar invite by email.',
      unavailable: 'Calendar unavailable. You can still send the message.',
    },
    fr: {
      available: 'Créneaux disponibles',
      availableDates: 'Dates disponibles',
      change: 'Modifier',
      checking: 'Vérification...',
      checkSlots: 'Trouver un créneau',
      confirm: 'Valider ce créneau',
      consent: 'Je souhaite recevoir des actualités et conseils produits (optionnel)',
      copied: 'Copié',
      copyInvite: "Copier le lien d'invitation",
      end: 'Fin',
      meeting: 'Rendez-vous',
      meetingCta: 'Voir les créneaux disponibles',
      meetingRemove: 'Retirer le rendez-vous',
      noSlots: "Aucun créneau disponible n'a été renvoyé pour les prochains jours ouvrés.",
      note: 'Cela créera une invitation Google Meet de 15 minutes.',
      privacy: 'Politique de confidentialité',
      schedule: 'Envoyer et planifier',
      scheduling: 'Planification...',
      start: 'Début',
      success: "Rendez-vous planifié. Vous recevrez l'invitation calendrier par email.",
      unavailable: 'Calendrier indisponible. Vous pouvez toujours envoyer le message.',
    },
  }[language];

  const [form, setForm] = useState<ContactFormData>({
    company: '',
    email: '',
    message: '',
    name: '',
    phone: '',
    subject: '',
  });
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [busy, setBusy] = useState<BusySlot[]>([]);
  const [rangeStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(9, 0, 0, 0);
    return date.toISOString().slice(0, 16);
  });
  const [rangeEnd] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 8);
    date.setHours(18, 0, 0, 0);
    return date.toISOString().slice(0, 16);
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsVisible, setSlotsVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [meetLink, setMeetLink] = useState('');
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
    'w-full border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-300 dark:border-neutral-800 dark:bg-neutral-950';

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const checkAvailability = async () => {
    setIsChecking(true);
    setStatus('');
    setSelectedDate('');
    setSelectedSlot('');
    setSlotsVisible(false);
    try {
      const response = await fetch('/api/workspace/calendar/availability', {
        body: JSON.stringify({
          end: new Date(rangeEnd).toISOString(),
          start: new Date(rangeStart).toISOString(),
          timezone: 'Europe/Paris',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, copy.unavailable));
      }

      const result = (await response.json()) as AvailabilityPayload;
      setBusy(result.data?.busy ?? []);
      setSlotsVisible(true);
    } catch (error) {
      setBusy([]);
      setStatus(error instanceof Error ? error.message : copy.unavailable);
    } finally {
      setIsChecking(false);
    }
  };

  const showAvailability = async () => {
    await checkAvailability();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    setStatus('');
    setMeetLink('');

    const safe = {
      company: DOMPurify.sanitize(form.company),
      email: DOMPurify.sanitize(form.email),
      marketingConsent,
      message: DOMPurify.sanitize(form.message ?? ''),
      name: DOMPurify.sanitize(form.name),
      phone: DOMPurify.sanitize(form.phone ?? ''),
      subject: DOMPurify.sanitize(form.subject),
    };

    try {
      if (!selectedSlot) {
        setStatus(
          language === 'fr' ? 'Veuillez sélectionner un créneau.' : 'Please select a time slot.',
        );
        return;
      }

      const start = new Date(selectedSlot);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 15);
      const response = await fetch('/api/workspace/calendar/events', {
        body: JSON.stringify({
          attendees: [safe.email],
          company: safe.company,
          description: safe.message ? `${safe.company}\n${safe.message}` : safe.company,
          email: safe.email,
          end: end.toISOString(),
          locale: language,
          name: safe.name,
          start: start.toISOString(),
          summary: `${t('contact.meeting.title')} - ${safe.company || safe.name}`,
          timezone: 'Europe/Paris',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, t('contact.form.status_send_error')));
      }

      const payload = ((await response.json()) as CalendarEventPayload).data;
      setMeetLink(payload?.meetLink ?? payload?.htmlLink ?? '');
      setCopiedInvite(false);
      setStatus(copy.success);

      setForm({
        company: '',
        email: '',
        name: '',
        phone: '',
        subject: '',
      });
      setMarketingConsent(false);
      setSelectedSlot('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t('contact.form.status_send_error'));
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
    <form className="space-y-3" onSubmit={handleSubmit}>
      <section>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className={fieldClass}
            maxLength={60}
            name="name"
            onChange={handleChange}
            placeholder={t('contact.form.name_placeholder')}
            required
            type="text"
            value={form.name}
          />
          <input
            className={fieldClass}
            maxLength={80}
            name="company"
            onChange={handleChange}
            placeholder={t('contact.form.company_placeholder')}
            required
            type="text"
            value={form.company}
          />
          <input
            className={fieldClass}
            maxLength={120}
            name="email"
            onChange={handleChange}
            placeholder={t('contact.form.email_placeholder')}
            required
            type="email"
            value={form.email}
          />
          <PhoneInput
            onChange={(phone) => setForm((current) => ({ ...current, phone }))}
            value={form.phone ?? ''}
          />
        </div>
      </section>

      <section>
        <Select
          onValueChange={(value) => setForm((current) => ({ ...current, subject: value }))}
          value={form.subject}
        >
          <SelectTrigger className="w-full rounded-none border border-neutral-200 bg-white px-4 py-2.5 text-sm dark:border-neutral-800 dark:bg-neutral-950">
            <SelectValue placeholder={t('contact.form.subject_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="information">{t('contact.form.subject_information')}</SelectItem>
            <SelectItem value="partnership">{t('contact.form.subject_partnership')}</SelectItem>
            <SelectItem value="other">{t('contact.form.subject_other')}</SelectItem>
            <SelectItem value="api">{t('contact.form.subject_api')}</SelectItem>
            <SelectItem value="virtual-partner">
              {t('contact.form.subject_virtual_partner')}
            </SelectItem>
          </SelectContent>
        </Select>
        <textarea
          aria-label={t('contact.form.message_placeholder')}
          className={`${fieldClass} mt-2.5 max-h-40 min-h-20 resize-y`}
          maxLength={1000}
          name="message"
          onChange={handleChange}
          placeholder={t('contact.form.message_placeholder')}
          value={form.message ?? ''}
        />
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
          <CalendarDays className="h-4 w-4 text-orange-500" />
          {copy.meeting}
        </h3>

        {selectedSlot ? (
          <button
            className="inline-flex w-full items-center justify-between gap-2 border border-orange-300 bg-orange-50 px-4 py-2.5 text-left text-sm font-semibold text-orange-800 transition-colors hover:border-orange-400 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200"
            onClick={() => setDialogOpen(true)}
            type="button"
          >
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-orange-500" />
              {new Date(selectedSlot).toLocaleDateString(locale, {
                day: 'numeric',
                month: 'short',
                weekday: 'short',
              })}{' '}
              &middot;{' '}
              {new Date(selectedSlot).toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-xs font-medium underline underline-offset-2">{copy.change}</span>
          </button>
        ) : (
          <button
            className="inline-flex w-full items-center justify-center gap-2 border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition-colors hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
            disabled={isChecking}
            onClick={() => {
              setDialogOpen(true);
              void showAvailability();
            }}
            type="button"
          >
            <CalendarDays className="h-4 w-4" />
            {isChecking ? copy.checking : copy.meetingCta}
          </button>
        )}

        {selectedSlot ? (
          <p className="mt-2 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <Check className="h-3.5 w-3.5 text-orange-500" />
            {copy.note}
          </p>
        ) : null}

        <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-orange-500" />
                {copy.meeting}
              </DialogTitle>
            </DialogHeader>

            {isChecking ? (
              <p className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
                {copy.checking}
              </p>
            ) : slotsVisible && availableDates.length ? (
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    {copy.availableDates}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {availableDates.map(({ date, key }) => {
                      const selected = selectedDate === key;

                      return (
                        <button
                          key={key}
                          className={
                            selected
                              ? 'border border-orange-500 bg-orange-50 px-3 py-2 text-left text-sm font-semibold text-orange-700 dark:border-orange-400 dark:bg-orange-500/15 dark:text-orange-200'
                              : 'border border-neutral-200 bg-white px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:border-orange-200 hover:text-orange-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300'
                          }
                          onClick={() => {
                            setSelectedDate(key);
                            setSelectedSlot('');
                          }}
                          type="button"
                        >
                          {date.toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                            weekday: 'short',
                          })}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDateSlots.length ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      {copy.available}
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
                                ? 'border border-orange-500 bg-orange-50 px-3 py-2 text-left text-sm font-semibold text-orange-700 dark:border-orange-400 dark:bg-orange-500/15 dark:text-orange-200'
                                : 'border border-neutral-200 bg-white px-3 py-2 text-left text-sm font-medium text-neutral-600 hover:border-orange-200 hover:text-orange-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300'
                            }
                            onClick={() => setSelectedSlot(iso)}
                            type="button"
                          >
                            {slot.toLocaleTimeString(locale, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <button
                  className="inline-flex w-full items-center justify-center gap-2 bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={!selectedSlot}
                  onClick={() => setDialogOpen(false)}
                  type="button"
                >
                  <Check className="h-4 w-4" />
                  {copy.confirm}
                </button>
              </div>
            ) : slotsVisible ? (
              <p className="border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
                {copy.noSlots}
              </p>
            ) : null}
          </DialogContent>
        </Dialog>
      </section>

      <div className="space-y-2.5 border-t border-neutral-200 pt-4 dark:border-neutral-800">
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
            {copy.consent}
          </label>
        </div>

        <p className="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
          {language === 'fr'
            ? 'Vos données servent à traiter votre demande et planifier un rendez-vous via Google Calendar, conformément à notre'
            : 'Your data is used to handle your request and schedule a meeting via Google Calendar, per our'}{' '}
          <a
            className="text-orange-600 underline underline-offset-2 hover:text-orange-700 dark:text-orange-400"
            href="/privacy"
            rel="noopener noreferrer"
            target="_blank"
          >
            {copy.privacy}
          </a>
          .
        </p>
      </div>

      <button
        className="inline-flex w-full items-center justify-center gap-2 bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        disabled={isSending}
        type="submit"
      >
        <Send className="h-4 w-4" />
        {isSending ? copy.scheduling : copy.schedule}
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
            {language === 'fr' ? "Ouvrir l'invitation" : 'Open invitation'}
          </a>
          <button
            className="inline-flex items-center justify-center gap-2 border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:border-orange-300 hover:text-orange-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
            onClick={copyInvitationLink}
            type="button"
          >
            <Copy className="h-4 w-4" />
            {copiedInvite ? copy.copied : copy.copyInvite}
          </button>
        </div>
      ) : null}
    </form>
  );
}
