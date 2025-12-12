# AI Spectrum — Onsite Portal

This repository contains a small web app to manage onsite registrations and attendance for the AI Spectrum conference.

## Layout

- **attendance** — React frontend (Vite)
  - path: `/Users/munch/Projects/AiSpectrup/spectrum_attend/attendance`
- **server** — Node/Express backend that reads/writes CSV files and handles uploads
  - path: `/Users/munch/Projects/AiSpectrup/spectrum_attend/server`
- **data files**:
  - `server/data/attendance.csv` — original dataset (copy your CSV here)
  - `server/data/new.csv` — appended onsite registrations
  - `server/uploads` — uploaded payment screenshots

## Quick start (mac)

1. **Start backend**

   ```bash
   cd /Users/munch/Projects/AiSpectrup/spectrum_attend/server
   npm install
   # ensure data dir exists and copy your original CSV:
   mkdir -p data
   # place your attendance.csv into server/data/attendance.csv
   npm start
   ```

   Backend will run on `http://localhost:5000`

2. **Start frontend**

   ```bash
   cd /Users/munch/Projects/AiSpectrup/spectrum_attend/attendance
   npm install
   npm run dev
   ```

   Open the URL shown by Vite (usually `http://localhost:5173`). A Vite proxy forwards `/api/*` to the backend.

## Available API endpoints

- `GET /api/attendance?mobile=PHONE` — lookup rows by mobile number
- `POST /api/attendance/mark` — body `{ mobile }` — marks `attendance="Yes"` in `server/data/attendance.csv`
- `POST /api/registration` — multipart/form-data (fields from the onsite form, file field name `paymentScreenshot`) — appends a record to `server/data/new.csv` with `attendance="Yes"`
- `GET /api/people` — returns two lists: registered (original CSV) and onsite (new.csv) with name/mobile/email

## Notes & tips

- The backend matches the mobile column case-insensitively (any header containing "mobile" or "phone"). If your CSV has an unusual header, rename it to include "Mobile".
- Keep a backup of your CSV files before testing writes.
- Uploaded screenshots are saved under `server/uploads`; `new.csv` will be created if missing.
- If you encounter CSV parsing errors with `csv-parse`, ensure the helper uses the supported sync entrypoints (`csv-parse/sync` and `csv-stringify/sync`) and reinstall dependencies.

## Troubleshooting

- Duplicate UI components: ensure the frontend mounts App only once (`main.jsx`) and Tabs only renders tab buttons (App renders selected tab).
- Backend errors: check server console for stack trace and confirm `server/data/attendance.csv` exists and is readable.

## License

MIT