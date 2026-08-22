import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used for the project page URL — click Generate.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Which section of the site should this appear in?',
      options: {
        list: [
          { title: 'Photography', value: 'photography' },
          { title: 'Music Video', value: 'music-video' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Narrative', value: 'narrative' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subcategory',
      title: 'Type',
      type: 'string',
      description: 'Appears above the title on the tile (e.g. "Feature Film", "Music Video", "2nd Unit Cinematography").',
    }),
    defineField({
      name: 'director',
      title: 'Director',
      type: 'string',
      description: 'Appears below the title on the tile (e.g. "Phillips Brothers").',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      description: 'Poster image — shown while the tile video loads.',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tileVideoUrl',
      title: 'Tile Video',
      type: 'url',
      description: 'Short clip that loops silently in the tile. Paste a Vimeo link (e.g. https://vimeo.com/123456789).',
      validation: (rule) =>
        rule.uri({ scheme: ['https'], allowRelative: false }),
    }),
    defineField({
      name: 'fullVideoUrl',
      title: 'Full Video',
      type: 'url',
      description: 'The complete video shown when the tile is clicked. Paste a Vimeo link.',
      validation: (rule) =>
        rule.uri({ scheme: ['https'], allowRelative: false }),
    }),
    defineField({
      name: 'order',
      title: 'Sort Order',
      type: 'number',
      description: 'Lower numbers appear first. Projects with the same number are sorted by title.',
    }),
  ],
  orderings: [
    {
      title: 'Sort Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'coverImage',
    },
  },
})
