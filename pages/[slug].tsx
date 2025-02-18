import { GetServerSideProps } from 'next';
import { getOriginalUrl } from '../lib/url-service';

// This page handles the redirection
export default function RedirectPage() {
  // This component won't actually render anything
  // The redirection happens in getServerSideProps
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  try {
    const shortCode = params?.slug as string;

    if (!shortCode) {
      return {
        notFound: true
      };
    }

    // Get the original URL and track the visit
    const originalUrl = await getOriginalUrl(shortCode, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
      referrer: req.headers.referer
    });

    // Permanent redirect (301) to the original URL
    return {
      redirect: {
        destination: originalUrl,
        permanent: true // This helps with SEO and caching
      }
    };
  } catch (error) {
    // If the URL is not found or any other error occurs,
    // return 404 page
    return {
      notFound: true
    };
  }
}; 