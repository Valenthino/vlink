// pages/[slug].tsx

import { GetServerSideProps } from 'next';
import clientPromise from '../../lib/db';

// This page is used only for redirection based on the slug.
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Extract the slug from the URL parameters.
  const { slug } = context.params as { slug: string };

  try {
    const client = await clientPromise;
    const db = client.db();

    // Query the "urls" collection for the matching slug.
    const url = await db.collection('urls').findOne({ slug });

    if (!url) {
      // If not found, show a 404 page.
      return { notFound: true };
    }

    // Redirect to the original URL.
    return {
      redirect: {
        destination: url.longUrl,
        permanent: false,
      },
    };
  } catch (error) {
    console.error('Error fetching URL:', error);
    return { notFound: true };
  }
};

export default function SlugPage() {
  // This component will not render as the user is redirected.
  return null;
}
