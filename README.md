# Good News World — quality-filter update

Configured feeds:
- NASA general RSS
- UN News English RSS
- ScienceDaily Top Science
- ScienceDaily Top Health
- ScienceDaily Top Environment
- Mongabay general RSS

Improvements:
- Per-source success/failure tracking in the header
- Duplicate removal by canonical article link
- Date screening (items must have a parseable date and be no older than 30 days)
- Weighted positive and negative topic terms; an item must have at least 2 positive points and a positive score of at least 2
- Category inference and original publisher link
- Refresh button and 30-minute automatic refresh

Limitations:
- RSS retrieval still uses rss2json's public demo endpoint; availability and rate limits are outside this app's control.
- Keyword scoring is a transparent heuristic, not AI fact-checking or editorial verification. It can miss positive articles and may still include a misleading headline.
- Current location selector is labeled as a region because source defaults are not reliable article-level geolocation.
- Feed descriptions and article titles are displayed with publisher attribution and links; publishers' content rights remain in effect.

To deploy: replace the four files in the root of the existing GitHub repository with these four files and commit the changes. GitHub Pages will rebuild automatically.


## Daily Good News Briefing
The Daily Good News Briefing displays up to five highlights from the existing ranked feed. It uses each publisher's supplied headline and RSS description, with a link to the original article. It does not call a paid AI service and does not independently verify or rewrite article facts. Feed availability and article descriptions depend on the public RSS sources and rss2json demo endpoint.
