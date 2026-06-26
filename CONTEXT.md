# Users Directory

A React Native app that browses people from the DummyJSON Users API: a
paginated, searchable list and a per-user detail screen.

## Language

**User**:
A person record from the DummyJSON Users API, identified by a stable numeric
`id`. The app's single domain entity.
_Avoid_: person, profile, contact, account

**Users Directory**:
The application itself, and the browsable collection of Users it presents.
_Avoid_: user list (ambiguous with the on-screen list component)

**Full name**:
A User's display name, derived as `firstName + " " + lastName`. The primary
label in both the list row and the detail header.
_Avoid_: name, title

**Summary fields**:
The subset of a User shown in a list row — avatar, full name, and one secondary
field (email). A presentation convention only: the API returns the complete
User in list responses, so "summary" is what we choose to show, not what we
fetch.
_Avoid_: preview, snippet

**Detail fields**:
The richer presentation on the detail screen (address, company, university,
contact info, etc.), drawn from the same complete User object. Distinguished
from Summary fields by presentation, not by a separate API payload.
_Avoid_: full record (the payload is identical to the list's)
