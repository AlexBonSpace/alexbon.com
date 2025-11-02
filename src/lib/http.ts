import notFoundHtml from "@/components/system/not-found.html?raw";

export function notFound(): Response {
  return new Response(notFoundHtml, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export function methodNotAllowed(): Response {
  return new Response(null, { status: 405 });
}
