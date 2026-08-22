import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const client = createClient({
  projectId: 'cd3com2c',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

export type Project = {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  coverImage: SanityImageSource;
  gallery?: Array<SanityImageSource & { caption?: string }>;
  vimeoUrl?: string;
  order?: number;
};

export async function getProjectsByCategory(category: string): Promise<Project[]> {
  return client.fetch(
    `*[_type == "project" && category == $category] | order(order asc, title asc)`,
    { category }
  );
}

export async function getAllProjects(): Promise<Project[]> {
  return client.fetch(
    `*[_type == "project"] | order(order asc, title asc)`
  );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return client.fetch(
    `*[_type == "project" && slug.current == $slug][0]`,
    { slug }
  );
}
