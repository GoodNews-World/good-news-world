# Good News World — live RSS prototype

This update replaces the illustrative cards with RSS articles from NASA, UN News, ScienceDaily, and Mongabay. The browser retrieves feeds through the public rss2json demo relay for this prototype.

Limitations: the relay may be rate-limited or unavailable and is not a production service. Positive/negative keyword scoring is a rough topic filter, not fact-checking; false positives and missed stories are possible. Country labels are broad source defaults, not verified article locations. Publisher content rights apply; the app links to original articles and displays short feed descriptions.

Deploy: replace `index.html`, `styles.css`, `app.js`, and `README.md` in the root of the existing GitHub repository with these files, then commit. GitHub Pages will redeploy automatically.
