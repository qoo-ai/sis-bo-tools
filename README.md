# sis-bo-tools

Bookmarklet loader targets used by SIS for back-office helpers.

- `sis.js` : entry point loaded by the bookmark. `ENABLED=false` stops every tool. `VERSION` busts the browser cache of the tools.
- `stock.js` : stock import helper (the final import button is always pressed by a person).

Release: edit the tool, bump `VERSION` in sis.js, then purge `https://purge.jsdelivr.net/gh/qoo-ai/sis-bo-tools@main/sis.js` and `.../stock.js`.
