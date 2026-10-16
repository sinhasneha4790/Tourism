export type Role = 'traveller' | 'host' | 'admin';
export type ListingStatus = 'draft' | 'pending' | 'approved' | 'rejected';

/** Emails in ADMIN_EMAILS (comma-separated) are always admins, whatever the stored role. */
export function isAdminEmail(email: string | null | undefined, adminEmails: string | undefined): boolean {
  if (!email || !adminEmails) return false;
  const list = adminEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.trim().toLowerCase());
}

export function effectiveRole(stored: Role, email: string | null | undefined, adminEmails: string | undefined): Role {
  return isAdminEmail(email, adminEmails) ? 'admin' : stored;
}

export function canEditListing(user: { id: string; isAdmin: boolean }, listing: { hostId: string }): boolean {
  return user.isAdmin || listing.hostId === user.id;
}

/**
 * Status after a host saves edits: drafts and rejected listings stay editable drafts;
 * edits to a live or pending listing send it back for review.
 */
export function statusAfterHostEdit(current: ListingStatus): ListingStatus {
  if (current === 'approved' || current === 'pending') return 'pending';
  return 'draft';
}

/** Hosts can submit drafts and rejected listings for review. */
export function canSubmitForReview(status: ListingStatus): boolean {
  return status === 'draft' || status === 'rejected';
}
