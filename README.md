# goffart_dev_platform

Personal website API built with FastAPI.

## Endpoints

The application is exposed as `main:app`. Each resource supports create, list,
fetch-by-public-ID, partial update, and delete operations:

| Resource | Route |
| --- | --- |
| Profiles | `/api/profiles` |
| Articles | `/api/articles` |
| Projects | `/api/projects` |

Use `POST` to create, `GET` to list or fetch one item, `PATCH` to update a
subset of fields, and `DELETE` to remove an item. List endpoints return all
matching records by default and accept an optional `offset` and `limit` query
parameter (`limit` maximum: 100) when you want a page. Article and project
creation require a `profile_id` containing the public UUID of an existing
profile. An article may include an optional `project_id` containing the public
UUID of a project; article responses include that linked project. Each project
can be linked to at most one article, and deleting an article clears its project
link. `offset` is the number of records to skip, so start with `offset=0`;
for example, `/api/profiles?offset=0&limit=10` returns the first page.

## Frontend development

This repository includes a Vite + React + TypeScript portfolio frontend for the API above.

```bash
npm install
cp .env.example .env.local
npm run dev -- --host 0.0.0.0
```

The frontend proxies API calls through Vite to the FastAPI app on `http://localhost:8001` and provides the public portfolio pages plus the `/admin` dashboard.
Technology tags may be entered as comma-separated values or as space-separated
hashtags (for example, `#arduino #python`). Recognized technologies link to
their official websites; unrecognized tags link to a search for official
documentation.
Article downloads are generated as PDF files in the browser. The public profile
uses its `contact` value as the clickable contact link; enter an email address,
phone number, or social/website URL to receive a matching icon and destination.

## Admin access

Portfolio read endpoints remain public so the website can display content.
Creating, editing, and deleting profiles, articles, and projects requires the
admin bearer token. Set `ADMIN_API_TOKEN` in the backend environment to a
random secret with at least 32 characters; for example, generate one with
`python -c "import secrets; print(secrets.token_urlsafe(32))"`. Do not expose
this setting through a `VITE_` variable or commit it to source control.
It can be set in `.env` or `.env.local`; the latter is loaded by the backend
and is ignored by Git.

Open `/admin` and sign in with that token. The browser keeps it in
`sessionStorage` for the current tab session and sends it only with write
requests. In production, serve the site and API over HTTPS.

## Form and banner image uploads

Create and partial-update endpoints accept `multipart/form-data`, so submit
each resource's text fields and its optional `banner` image in one request.
Article forms may include `project_id`; send an empty value to clear an existing
project link during a partial update.
Configure the `CLOUDINARY_URL` environment variable (for example in `.env`)
before including a banner image. JPEG, PNG, WebP, and GIF images up to 10 MB
are accepted. The API uploads the image to Cloudinary, saves the returned HTTPS
URL in the resource's `banner` field, and returns the resource.

For example, create a profile and upload its banner together:

```bash
curl -X POST http://localhost:8001/api/profiles \
  -F "name=goffart" \
  -F "email=me@example.com" \
  -F "banner=@banner.jpg"
```

The default FastAPI CLI port (`8000`) may already be occupied. Use port `8001`
with `fastapi dev --port 8001 main.py` for development or
`fastapi run --port 8001 main.py` for production. Alternatively, start Uvicorn
directly with `uvicorn main:app --host 0.0.0.0 --port 8001 --reload`.
