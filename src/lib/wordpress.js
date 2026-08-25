// Points at your WordPress site's WPGraphQL endpoint.
// Change this one line if you ever point this project at a different site.
const WORDPRESS_API_URL = 'https://susanta.com/graphql';


/* =========================================================
   WORDPRESS GRAPHQL FETCH
   ========================================================= */

async function wpFetch(query, variables = {}) {
  const response = await fetch(WORDPRESS_API_URL, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `WordPress API error: ${response.status} ${response.statusText}`
    );
  }

  const result = await response.json();

  if (result.errors?.length) {
    throw new Error(
      result.errors
        .map((error) => error.message)
        .join('; ')
    );
  }

  if (!result.data) {
    throw new Error('WordPress GraphQL returned no data.');
  }

  return result.data;
}


/* =========================================================
   GET ALL POST URIS
   ========================================================= */

export async function getAllPostUris() {
  const data = await wpFetch(`
    {
      posts(first: 100) {
        nodes {
          uri
        }
      }
    }
  `);

  return data.posts.nodes
    .filter((post) => post.uri)
    .map((post) => post.uri);
}


/* =========================================================
   GET ONE NODE BY URI
   ========================================================= */

export async function getNodeByURI(uri) {
  const data = await wpFetch(
    `
      query GetNodeByURI($uri: String!) {

        nodeByUri(uri: $uri) {

          __typename


          # -------------------------------------------------
          # POST
          # -------------------------------------------------

          ... on Post {

            id
            databaseId
            title
            date
            modified
            uri
            excerpt
            content

            author {
              node {
                name
                uri
                avatar {
                  url
                }
              }
            }

            featuredImage {
              node {
                sourceUrl
                altText
                caption
                mediaDetails {
                  width
                  height
                }
              }
            }

            categories {
              nodes {
                name
                uri
              }
            }

            tags {
              nodes {
                name
                uri
              }
            }
          }


          # -------------------------------------------------
          # PAGE
          # -------------------------------------------------

          ... on Page {

            id
            databaseId
            title
            date
            modified
            uri
            content

            featuredImage {
              node {
                sourceUrl
                altText
                caption
                mediaDetails {
                  width
                  height
                }
              }
            }
          }


          # -------------------------------------------------
          # CATEGORY
          # -------------------------------------------------

          ... on Category {

            id
            name
            uri

            posts(first: 100) {

              nodes {

                id
                title
                date
                modified
                uri
                excerpt

                featuredImage {
                  node {
                    sourceUrl
                    altText
                    mediaDetails {
                      width
                      height
                    }
                  }
                }

                categories {
                  nodes {
                    name
                    uri
                  }
                }

                tags {
                  nodes {
                    name
                    uri
                  }
                }
              }
            }
          }


          # -------------------------------------------------
          # TAG
          # -------------------------------------------------

          ... on Tag {

            id
            name
            uri

            posts(first: 100) {

              nodes {

                id
                title
                date
                modified
                uri
                excerpt

                featuredImage {
                  node {
                    sourceUrl
                    altText
                    mediaDetails {
                      width
                      height
                    }
                  }
                }

                categories {
                  nodes {
                    name
                    uri
                  }
                }

                tags {
                  nodes {
                    name
                    uri
                  }
                }
              }
            }
          }

        }
      }
    `,
    { uri }
  );

  return data.nodeByUri;
}


/* =========================================================
   GET ALL CONTENT URIS
   ========================================================= */

export async function getAllContentUris() {
  const data = await wpFetch(`
    {
      posts(first: 100) {
        nodes {
          uri
        }
      }

      pages(first: 100) {
        nodes {
          uri
        }
      }

      categories(first: 100) {
        nodes {
          uri
        }
      }

      tags(first: 100) {
        nodes {
          uri
        }
      }
    }
  `);

  return [
    ...data.posts.nodes,
    ...data.pages.nodes,
    ...data.categories.nodes,
    ...data.tags.nodes,
  ]
    .filter((node) => node.uri)
    .map((node) => node.uri);
}


/* =========================================================
   GET LATEST POSTS
   ========================================================= */

export async function getPosts() {
  const data = await wpFetch(`
    {
      posts(first: 10) {

        nodes {

          id
          databaseId
          title
          uri
          date
          modified
          excerpt
          content

          author {
            node {
              name
              uri
              avatar {
                url
              }
            }
          }

          featuredImage {
            node {
              sourceUrl
              altText
              caption

              mediaDetails {
                width
                height
              }
            }
          }

          categories {
            nodes {
              name
              uri
            }
          }

          tags {
            nodes {
              name
              uri
            }
          }
        }
      }
    }
  `);

  return data.posts.nodes;
}


/* =========================================================
   WORDPRESS NAVIGATION MENU (block-theme Navigation block,
   read via the REST API since block-theme menus aren't
   exposed through WPGraphQL's classic `menus` query)
   ========================================================= */

export async function getNavigationMenu(slug) {
  const response = await fetch(
    `https://susanta.com/wp-json/wp/v2/navigation?slug=${encodeURIComponent(slug)}`
  );

  if (!response.ok) {
    throw new Error(
      `WordPress navigation API error: ${response.status} ${response.statusText}`
    );
  }

  const menus = await response.json();

  if (!Array.isArray(menus) || !menus.length) {
    return [];
  }

  const html = menus[0].content?.rendered || '';

  const matches = [
    ...html.matchAll(
      /<a[^>]+href="([^"]+)"[^>]*>.*?<span[^>]*>(.*?)<\/span>/gs
    ),
  ];

  return matches.map((match) => {

    const originalUrl = match[1];

    let url = originalUrl;

    /*
     * Convert WordPress internal URLs into
     * Astro-relative URLs.
     */

    try {

      const parsedUrl = new URL(originalUrl);

      if (parsedUrl.hostname === 'susanta.com') {

        url = parsedUrl.pathname;

        if (parsedUrl.search) {
          url += parsedUrl.search;
        }

        if (parsedUrl.hash) {
          url += parsedUrl.hash;
        }

        if (!url.endsWith('/')) {
          url += '/';
        }
      }

    } catch {
      // Keep original URL.
    }

    return {
      label: match[2]
        .replace(/<[^>]+>/g, '')
        .trim(),

      url,
    };
  });
}
