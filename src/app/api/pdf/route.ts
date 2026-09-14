export async function POST() {
  return new Response(JSON.stringify({ message: "PDF generation not yet implemented" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
