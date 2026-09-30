import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'subcategory',
  title: 'Subcategory',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Parent Category',
      type: 'string',
      description: 'Which category does this subcategory belong to?',
      options: {
        list: [
          { title: 'Music Video', value: 'music-video' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Narrative', value: 'narrative' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      description: 'Hide this subcategory from the site and from project selection.',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'category',
      hidden: 'hidden',
    },
    prepare({ title, subtitle, hidden }) {
      return {
        title: hidden ? `${title} (hidden)` : title,
        subtitle,
      }
    },
  },
})
