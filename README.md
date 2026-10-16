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
profile. `offset` is the number of records to skip, so start with `offset=0`;
for example, `/api/profiles?offset=0&limit=10` returns the first page.

## Form and banner image uploads

Create and partial-update endpoints accept `multipart/form-data`, so submit
each resource's text fields and its optional `banner` image in one request.
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
