/**
 * Each exercise's page on Kinetic.place, where creators license videos of it for apps, as
 * `links.page` on the exercise routes.
 *
 * The exercise's ID alone is the page's permanent address: the site sends it on to the page's own,
 * named in the language. So the link needs no slug rules, and it keeps working whatever an
 * exercise is called later. Exercises here are in English, so the link is the English page.
 */
const SITE = 'https://kinetic.place';

export function withPage<T extends { id: string }>(exercise: T): T & { links: { page: string } } {
  return { ...exercise, links: { page: `${SITE}/exercises/${exercise.id}` } };
}
