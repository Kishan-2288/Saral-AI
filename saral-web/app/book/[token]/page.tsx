import Script from "next/script";
import BookingSession from "@/components/book/BookingSession";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <>
      {/* Razorpay checkout is loaded ONLY on this route (never on marketing pages). */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <BookingSession token={token} />
    </>
  );
}
