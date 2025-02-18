// pages/[slug].tsx

import { GetServerSideProps } from 'next';
import { createClient } from '@supabase/supabase-js';

// This page is used only for redirection based on the slug.
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Extract the slug from the URL parameters.
  const { slug } = context.params as { slug: string };

  // Initialize the Supabase client (server-side).
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { notFound: true };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Query the "links" table for the matching slug.
  const { data, error } = await supabase
    .from('links')
    .select('url')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    // If not found or an error occurs, show a 404 page.
    return { notFound: true };
  }

  // Redirect to the original URL.
  return {
    redirect: {
      destination: data.url,
      permanent: false,
    },
  };
};

export default function SlugPage() {
  // This component will not render as the user is redirected.
  return null;
}
