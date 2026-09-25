import "./globals.css";

export const metadata = {
  title: "Groundtruth — Natural-language home search",
  description:
    "LLM intent parsing + OpenSearch hybrid retrieval + reranking. A technical demo of AI-powered discovery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
