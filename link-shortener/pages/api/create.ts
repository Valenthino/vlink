
/* import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { url } = req.body
    const slug = Math.random().toString(36).substring(2, 8)

    const { data, error } = await supabase
      .from('urls')
      .insert([
        { original_url: url, slug }
      ])
      .select()

    if (error) throw error

    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`
    res.status(200).json({ shortUrl })
  } catch (error) {
    console.error('Error creating short URL:', error)
    res.status(500).json({ message: 'Error creating short URL' })
  }
} */

// pages/api/create.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Utility function to generate a random slug of 6 alphanumeric characters.
const generateSlug = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

// API handler to create a new short link.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  // Basic URL validation.
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // Initialize Supabase client (server-side) using your environment variables.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase credentials are not set' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Generate a slug (in production you might check for collisions).
  const slug = generateSlug();

  // Insert the new link into the "links" table.
  const { error: insertError } = await supabase
    .from('links')
    .insert([{ slug, url }]);

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  // Return the generated slug.
  return res.status(200).json({ slug });
}
