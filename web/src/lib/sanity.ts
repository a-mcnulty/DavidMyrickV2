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

export type VimeoDimensions = {
  width: number;
  height: number;
};

export type Project = {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  subcategory?: string;
  director?: string;
  coverImage: SanityImageSource;
  tileVideoUrl?: string;
  fullVideoUrl?: string;
  order?: number;
  tileVideoDimensions?: VimeoDimensions;
  fullVideoDimensions?: VimeoDimensions;
};

export function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

const dimensionsCache = new Map<string, VimeoDimensions | null>();

async function fetchVimeoDimensions(vimeoUrl: string): Promise<VimeoDimensions | null> {
  if (dimensionsCache.has(vimeoUrl)) return dimensionsCache.get(vimeoUrl)!;
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(vimeoUrl)}`);
    if (!res.ok) { dimensionsCache.set(vimeoUrl, null); return null; }
    const data = await res.json();
    const dims = { width: data.width, height: data.height };
    dimensionsCache.set(vimeoUrl, dims);
    return dims;
  } catch {
    dimensionsCache.set(vimeoUrl, null);
    return null;
  }
}

async function enrichProject(project: Project): Promise<Project> {
  const [tileDims, fullDims] = await Promise.all([
    project.tileVideoUrl ? fetchVimeoDimensions(project.tileVideoUrl) : null,
    project.fullVideoUrl ? fetchVimeoDimensions(project.fullVideoUrl) : null,
  ]);
  return {
    ...project,
    tileVideoDimensions: tileDims ?? undefined,
    fullVideoDimensions: fullDims ?? undefined,
  };
}

async function enrichProjects(projects: Project[]): Promise<Project[]> {
  return Promise.all(projects.map(enrichProject));
}

export async function getProjectsByCategory(category: string): Promise<Project[]> {
  const projects = await client.fetch(
    `*[_type == "project" && category == $category] | order(order asc, title asc)`,
    { category }
  );
  return enrichProjects(projects);
}

export async function getAllProjects(): Promise<Project[]> {
  const projects = await client.fetch(
    `*[_type == "project"] | order(order asc, title asc)`
  );
  return enrichProjects(projects);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const project = await client.fetch(
    `*[_type == "project" && slug.current == $slug][0]`,
    { slug }
  );
  return project ? enrichProject(project) : null;
}
