# EduOne revision notes

This revision preserves the existing routes and features while applying targeted corrections.

## Changes made
- Added an ordered Uzbekistan region and district/city selector dataset in `src/data/uzbekistanLocations.js`.
- Replaced the free-text city/district field in the organization creation modal with a dependent selector. The district/city field stays disabled until a region is selected and resets when the region changes.
- Kept phone formatting and client-side validation, and added server-side validation for organization slug, Uzbek phone number (when provided), email format (when provided), and field lengths.
- Standardized Super Admin surfaces to a dark sapphire/violet glassmorphism treatment while retaining the existing navigation and wallpaper settings controls.
- Changed dashboard accent colors away from the previous gold/emerald/red mix toward the selected blue/violet palette.
- Reset the organization form after a successful create operation so old field values do not leak into the next creation.

## Verification
- JSX/JS syntax transform check passed for all existing `.jsx` files using the project's installed Sucrase tool.
- `npm run build` could not run because the provided `node_modules` lacks Vite/Rolldown's platform-native optional binding. Reinstall dependencies with `npm install` in a network-enabled environment, then run `npm run build`.
- Backend tests could not run because the environment has Go 1.23.2 while `backend/go.mod` requires Go 1.24, and network access is unavailable to fetch the required toolchain.

## Known limitations
- The district/city data is a maintained-in-code initial dataset and should be verified against an authoritative current Uzbekistan administrative boundary dataset before production use.
- The project backend currently initializes `MemoryStore`; these changes do not convert it to persistent PostgreSQL storage. Do not treat this revision as production-ready until persistent storage and deployment configuration are completed and tested.
