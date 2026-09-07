# PomaaaloStay — CURRENT STATUS

Date of handoff: 2026-09-07

## Repository

Local project:
`C:\BOOKWEB`

Existing Git history should be preserved during migration.

Vercel:
- Project: `bookweb`
- Production URL: `https://bookweb-tan.vercel.app`

Supabase:
- Project name: `Booking Manager Web 2`
- Project ID: `jawcaedeynlbyntjolrg`
- Region: `eu-west-1`

## Latest implementation checkpoint

Revision 3 / Rev2.8 work has established:
- Supabase authentication and operational data
- Home operational overview
- continuous Calendar timeline
- reservation editing and resizing
- conflict rules and persistent conflicts
- property-scoped iCal model
- current Properties UI
- admin-user Edge Function deployment

Latest known test checkpoint:
- 46/46 test files passing
- 123/123 tests passing

Latest known build checkpoint:
- production build passes
- Vite emits a non-blocking JavaScript chunk >500 kB warning

## Needs functional verification

Do not assume these are complete merely because the backend exists:
- People UI real-world create/edit/activation/property-access flow
- end-to-end iCal sync behaviour against real Airbnb/Booking feeds
- full visual responsive verification after subsequent local changes
- any new feature added after this checkpoint

## Safe continuation rule

Before implementing the next feature:
1. inspect repository;
2. inspect current tests;
3. read this handoff and Master Specification;
4. make a small plan;
5. add/update tests first where behaviour changes;
6. implement;
7. run focused tests;
8. run full regression;
9. run production build;
10. visually verify relevant user flow.
