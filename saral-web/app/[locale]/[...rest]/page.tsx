import { notFound } from "next/navigation";

// Any unknown URL lands here and renders the branded 404 inside the locale layout (with a real 404 status).
export default function CatchAll() { notFound(); }
