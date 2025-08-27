import { defineConfig } from "sanity"
import { deskTool } from "sanity/desk"
import { visionTool } from "@sanity/vision"

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "m7o2mv1n"
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"

export default defineConfig({
  name: "default",
  title: "Medusa Blog",
  projectId,
  dataset,
  plugins: [
    deskTool(),
    visionTool(),
  ],
  schema: {
    types: [
      {
        name: "post",
        title: "Post",
        type: "document",
        fields: [
          {
            name: "title",
            title: "Title",
            type: "string",
          },
          {
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
              source: "title",
              maxLength: 96,
            },
          },
          {
            name: "author",
            title: "Author",
            type: "reference",
            to: { type: "author" },
          },
          {
            name: "mainImage",
            title: "Main image",
            type: "image",
            options: {
              hotspot: true,
            },
          },
          {
            name: "categories",
            title: "Categories",
            type: "array",
            of: [{ type: "reference", to: { type: "category" } }],
          },
          {
            name: "publishedAt",
            title: "Published at",
            type: "datetime",
          },
          {
            name: "excerpt",
            title: "Excerpt",
            type: "text",
          },
          {
            name: "body",
            title: "Body",
            type: "blockContent",
          },
          {
            name: "status",
            title: "Status",
            type: "string",
            options: {
              list: [
                { title: "Draft", value: "draft" },
                { title: "Published", value: "published" },
              ],
            },
            initialValue: "draft",
          },
        ],
        orderings: [
          {
            title: "Published at, New",
            name: "publishedAtDesc",
            by: [{ field: "publishedAt", direction: "desc" }],
          },
        ],
        preview: {
          select: {
            title: "title",
            author: "author.name",
            media: "mainImage",
          },
          prepare(selection: any) {
            const { author } = selection
            return { ...selection, subtitle: author && `by ${author}` }
          },
        },
      },
      {
        name: "author",
        title: "Author",
        type: "document",
        fields: [
          {
            name: "name",
            title: "Name",
            type: "string",
          },
          {
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
              source: "name",
              maxLength: 96,
            },
          },
          {
            name: "image",
            title: "Image",
            type: "image",
            options: {
              hotspot: true,
            },
          },
          {
            name: "bio",
            title: "Bio",
            type: "array",
            of: [
              {
                title: "Block",
                type: "block",
                styles: [{ title: "Normal", value: "normal" }],
                lists: [],
              },
            ],
          },
        ],
        preview: {
          select: {
            title: "name",
            media: "image",
          },
        },
      },
      {
        name: "category",
        title: "Category",
        type: "document",
        fields: [
          {
            name: "title",
            title: "Title",
            type: "string",
          },
          {
            name: "description",
            title: "Description",
            type: "text",
          },
        ],
      },
      {
        name: "blockContent",
        title: "Block Content",
        type: "array",
        of: [
          {
            title: "Block",
            type: "block",
            styles: [
              { title: "Normal", value: "normal" },
              { title: "H1", value: "h1" },
              { title: "H2", value: "h2" },
              { title: "H3", value: "h3" },
              { title: "H4", value: "h4" },
              { title: "Quote", value: "blockquote" },
            ],
            lists: [
              { title: "Bullet", value: "bullet" },
              { title: "Numbered", value: "number" },
            ],
            marks: {
              decorators: [
                { title: "Strong", value: "strong" },
                { title: "Emphasis", value: "em" },
              ],
              annotations: [
                {
                  title: "URL",
                  name: "link",
                  type: "object",
                  fields: [
                    {
                      title: "URL",
                      name: "href",
                      type: "url",
                    },
                  ],
                },
              ],
            },
          },
          {
            type: "image",
            options: { hotspot: true },
          },
        ],
      },
    ],
  },
})
