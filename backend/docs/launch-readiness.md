# Sanjeevani launch-readiness review

## Completed in this pass

Sanjeevani now sets security-focused response headers including `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and production HSTS. Express fingerprinting is disabled, JSON/urlencoded request bodies are limited to 1 MB, and research files continue through the private object-upload path.

Research uploads now require PDF, TXT, DOC, or DOCX content with matching extension and MIME type and a maximum size of 10 MB. The server validates the browser-side presign request and the assessment mutation, while the client shows upload progress. Protected procedures use the existing Manus-authenticated context and owner-scoped database checks.

The public document shell includes a description, theme color, robots directive, Open Graph title/description, Twitter summary metadata, and language attribution. `robots.txt` allows only the public landing route to be crawled, and `sitemap.xml` lists that route. A mobile screenshot was reviewed after the hardening pass. Unit coverage now includes upload validation and the Supabase adapter’s fail-closed behavior; the current test suite passes 14 tests across 6 files.

## Deliberately not added

Supabase authentication/database migration is deferred by explicit user request. The existing Manus OAuth and database integration remain the active application boundary. Live RAG/RDKit processing remains external and is not simulated. Maps, directions, fake reviews, fake team photography, local-business schema, and unrelated marketing content are not appropriate for this clinical research platform and were not added.

A canonical URL was not hardcoded because the deployed custom domain is not yet known; this avoids publishing an incorrect canonical origin. A social-share image was not fabricated because the project has no approved logo or brand image, and the user explicitly requested no logos.

## Still required before a production launch

A full dependency audit, browser-based keyboard audit, final accessibility pass for every icon-only action, route-specific page titles, a confirmed canonical URL, bundle-size optimization, and production security review remain advisable. Live scientific screening still requires a deployed and authenticated RAG/RDKit service with an approved corpus, tenant isolation, source governance, and result validation.

## Secret-audit evidence

On 15 August 2026, a pattern audit was run across `/home/ubuntu/sanjeevani` and `/home/ubuntu/sanjeevani-github-export`, excluding dependency internals, lockfiles, source maps, and `.git` metadata. It searched for common API-key prefixes, AWS access-key patterns, private-key blocks, and literal assignments for sensitive project keys. No matches were found. The generated `dist` tree contained only public assets and the server bundle; no secret-pattern match was found in the audited files. This is a pattern audit, not a substitute for a formal secret-scanning service.
