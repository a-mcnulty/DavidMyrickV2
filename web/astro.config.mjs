// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  image: {
    domains: ['cdn.sanity.io'],
  },
});
