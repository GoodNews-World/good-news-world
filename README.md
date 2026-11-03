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


## World Map (source coverage)
The map section visualizes the publisher-feed regions currently configured in `app.js` and lets visitors filter stories by those regions. It intentionally does not infer the country where an individual article's event occurred. The current feeds label NASA as United States and UN News, ScienceDaily, and Mongabay as International; country-level story mapping should wait until article location metadata is reliably available. The map illustration is local SVG and requires no paid map API or external map tiles.


## Expanded RSS sources
This build adds six sources to the existing NASA, UN News, ScienceDaily (three topic feeds), and Mongabay sources:
- Good News Network
- Positive News
- Reasons to be Cheerful
- Our World in Data
- Happy Eco News
- Fix The News

All sources are requested through the existing public rss2json demo endpoint. Feed uptime, CORS/parser compatibility, and free-demo limits can vary. The quality filter still screens headlines and feed descriptions using keywords; more sources can increase volume but do not make the screening AI-powered or independently fact-checked. Region labels are broad publisher/source labels, not verified article locations.


## Interactive rotating globe
The map panel uses the open-source Globe.gl library loaded from its public CDN and a public Earth texture. It rotates automatically, supports drag-to-rotate and scroll-to-zoom, and shows a publisher-feed marker for the United States. The adjacent region buttons filter stories by the source labels currently available in RSS feeds. They do not represent verified event locations. The globe requires an internet connection to load its JavaScript library and texture; there is no API key or paid map subscription.


## Colorful and user-friendly visual refresh
This version adds a brighter turquoise, sky-blue, green, sunshine-yellow and coral-inspired palette; clearer visual hierarchy; softer card styling; more visible focus states for keyboard users; and reduced-motion support. It preserves the feed, category filters, Top 10, briefing and interactive globe. No paid service or API key is added.
