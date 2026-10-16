# Owner photos

Drop photos here (JPEG or WebP, ideally 2000 px on the long edge), then point a content entry at them:

```ts
// content/states.ts
cover: { src: '/photos/meghalaya-cover.jpg', alt: 'Morning mist over the East Khasi Hills', credit: '© Mistrail', scene: 'hills' },
```

- `alt` describes the photo for screen readers. Every photo needs one.
- `scene` stays as the fallback illustration.
- `next/image` resizes and serves WebP/AVIF automatically, so you don't need to make smaller copies.
- `npm run validate:content` fails if a file is missing, or if a remote photo has no `credit`.
