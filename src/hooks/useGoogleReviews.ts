import { useEffect, useState } from 'react';

interface GoogleReview {
  id: string;
  author_name: string;
  author_photo_url: string;
  rating: number;
  text: string;
  time_description: string;
}

interface GoogleReviewsData {
  rating: number;
  total_reviews: number;
  reviews: GoogleReview[];
}

export function useGoogleReviews() {
  const [data, setData] = useState<GoogleReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_REVIEWS_API_KEY as string;
  const placeId = import.meta.env.VITE_GOOGLE_PLACE_ID as string;

  useEffect(() => {
    if (!apiKey || !placeId) {
      setLoading(false);
      return;
    }

    fetchReviews();
  }, [apiKey, placeId]);

  async function fetchReviews() {
    setLoading(true);
    setError(null);
    try {
      const url = `https://places.googleapis.com/v1/places/${placeId}?fields=rating,userRatingCount,reviews&key=${apiKey}&language=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();

      const reviews: GoogleReview[] = (json.reviews || []).map((r: Record<string, unknown>) => ({
        id: r.authorAttribution && typeof r.authorAttribution === 'object' ? (r.authorAttribution as Record<string, string>).displayName || 'Anonymous' : 'Anonymous',
        author_name: r.authorAttribution && typeof r.authorAttribution === 'object' ? (r.authorAttribution as Record<string, string>).displayName || 'Anonymous' : 'Anonymous',
        author_photo_url: r.authorAttribution && typeof r.authorAttribution === 'object' ? (r.authorAttribution as Record<string, string>).photoUri || '' : '',
        rating: typeof r.rating === 'number' ? r.rating : 5,
        text: r.text && typeof r.text === 'object' ? ((r.text as Record<string, string>).text || '') : (typeof r.text === 'string' ? r.text : ''),
        time_description: typeof r.relativePublishTimeDescription === 'string' ? r.relativePublishTimeDescription : '',
      }));

      setData({
        rating: typeof json.rating === 'number' ? json.rating : 0,
        total_reviews: typeof json.userRatingCount === 'number' ? json.userRatingCount : 0,
        reviews,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    }
    setLoading(false);
  }

  return { data, loading, error };
}
