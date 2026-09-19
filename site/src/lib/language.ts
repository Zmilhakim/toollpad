/**
 * The two languages a token's page and art can be in.
 *
 * On its own, in a file that reads nothing, because the copy that uses it is
 * rendered on the client and `lib/tokens` reaches for the filesystem — a type
 * import is erased, but a module that can only run on a server is not worth
 * putting in a client component's import graph at all.
 */
export type TokenLanguage = "id" | "en";
