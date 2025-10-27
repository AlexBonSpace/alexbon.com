export function notFound(): Response {
  return new Response(null, { status: 404 });
}

export function methodNotAllowed(): Response {
  return new Response(null, { status: 405 });
}
