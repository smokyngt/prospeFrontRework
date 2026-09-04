import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  company: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  phone: z
    .string()
    .regex(/^[0-9+\s()-]*$/, 'Numéro de téléphone invalide')
    .optional(),
  subject: z.enum(['information', 'partnership', 'support', 'other']),
  message: z.string().min(5, 'Le message doit contenir au moins 5 caractères'),
});

export const onRequestPost = async ({ request }: { request: Request }) => {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ success: false, errors: parsed.error.issues }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Contact API error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Erreur interne' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
