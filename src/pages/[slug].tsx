import { GetServerSideProps } from 'next';
import clientPromise from '@/lib/db';

// This page handles the redirection
export default function RedirectPage() {
  // This component won't actually render anything
  // The redirection happens in getServerSideProps
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const slug = params?.slug as string;

    const url = await db.collection('urls').findOne({ slug });

    if (!url) {
      return {
        notFound: true,
      };
    }

    return {
      redirect: {
        destination: url.longUrl,
        permanent: false,
      },
    };
  } catch (error) {
    console.error('Error fetching URL:', error);
    return {
      notFound: true,
    };
  }
}; 