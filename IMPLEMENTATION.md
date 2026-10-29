# Junior Website Builder assignment — implementation note draft

**Paste this note into the body of the submission email; do not attach this file.**

Built a responsive, single-page homepage with React and Vite, using the existing CSS design and locally stored imagery. React components render the page sections, and React state controls the mobile navigation and contact form. Small browser-side effects handle the gallery viewer, listing search, scroll reveals, and hero motion. The supplied property, service, portrait, partner, and community gallery photos are used, with a Pahrump home photo for the hero. Every gallery photo opens in a full-screen viewer.

One design decision was to present the Get It Sold content as alternating image-and-copy rows. This gives the three buyer and seller messages a clear reading order and lets the supplied property images support each message without repeating the original page layout. The listing form also adapts across desktop, tablet, and mobile. It opens Ridge Realty Group’s IDX results with supported price, bedroom, bathroom, and sort filters; visitors choose location and property type on IDX because those values depend on account-specific IDs.

The sales figures on the source page refer to 2021 and were preserved rather than replaced with unverified current claims.
