'use client';

import Image from 'next/image';
import { useActionState, useRef } from 'react';
import { removeListingPhoto, uploadListingPhoto } from '@/app/marketplace-actions';
import type { FormState } from '@/app/actions';
import type { ListingPhoto } from '@/lib/db/schema';
import { Field, FormMessage, inputCls } from '@/components/forms/fields';

const initial: FormState = { ok: false, message: '' };

export function PhotoManager({ listingId, photos, uploadsEnabled, max }: { listingId: string; photos: ListingPhoto[]; uploadsEnabled: boolean; max: number }) {
  const [state, action, pending] = useActionState(uploadListingPhoto, initial);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-5">
      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {photos.map((p) => (
            <li key={p.url} className="flex flex-col gap-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-teal-soft">
                <Image src={p.url} alt={p.alt} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover" />
              </div>
              <form action={removeListingPhoto}>
                <input type="hidden" name="id" value={listingId} />
                <input type="hidden" name="url" value={p.url} />
                <button type="submit" className="text-sm font-bold text-terracotta underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-3">No photos yet. Guests book more when they can see the place — add at least three.</p>
      )}

      {uploadsEnabled ? (
        photos.length < max && (
          <form
            ref={formRef}
            action={async (fd) => {
              await action(fd);
              formRef.current?.reset();
            }}
            className="grid gap-3 rounded-2xl border border-dashed border-line p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <input type="hidden" name="id" value={listingId} />
            <Field id="photo-file" label="Photo (JPEG, PNG or WebP, up to 4 MB)">
              <input id="photo-file" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required className="text-sm" />
            </Field>
            <Field id="photo-alt" label="Describe the photo">
              <input id="photo-alt" name="alt" required className={inputCls} placeholder="e.g. Bedroom with a valley view" />
            </Field>
            <button type="submit" disabled={pending} className="h-12 rounded-full bg-teal px-6 font-extrabold text-white disabled:opacity-60">
              {pending ? 'Uploading…' : 'Upload'}
            </button>
            <div className="sm:col-span-3">
              <FormMessage ok={state.ok} message={state.message} />
            </div>
          </form>
        )
      ) : (
        <p className="rounded-2xl bg-amber-bg p-4 text-sm text-amber-ink">
          Photo uploads switch on once the site owner connects Vercel Blob storage. Until then your listing shows an illustration.
        </p>
      )}
    </div>
  );
}
