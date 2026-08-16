# Syrama Yachting - Admin Backoffice

## Setup

### 1. Create the database migration

```bash
npx prisma migrate dev --name add_user_model
```

This will:
- Create the `user` table in your database
- Apply all pending migrations

### 2. Initialize admin user

```bash
npx ts-node scripts/init-admin.ts
```

This creates the default admin account:
- **Email:** admin@syrama.com
- **Password:** admin

### 3. Access the backoffice

Navigate to: `http://localhost:3000/admin/login`

## Features

### Authentication
- Login/Logout with secure cookies
- Session-based authentication
- Password hashing with PBKDF2

### Yacht Management
- **Create:** Add new yachts with detailed specifications
- **Read:** View all yachts with their details
- **Update:** Edit yacht information
- **Delete:** Remove yachts (also removes associated images)

### Image Management
- **Upload:** Add images to yachts
- **Delete:** Remove individual images
- **Images stored in:** `public/uploads/yachts/`

## Admin Dashboard

### Left Menu
- Add New Yacht button
- Logout button

### Yacht List
- Click on any yacht to expand and see details
- Edit: Modify yacht information
- Delete: Remove the yacht and all associated images

### Image Gallery (when yacht expanded)
- View all images for the yacht
- Upload new images
- Delete images (hover over image and click Delete)

## Yacht Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Model | Text | Yes | e.g., "Gozzo 35 Speedster" |
| Builder | Text | No | e.g., "Apreamare" |
| Length | Number | Yes | in meters |
| Cabins | Number | Yes | Number of cabins |
| Max Guests | Number | No | Maximum guests |
| Year | Number | No | Year built |
| Price/Day | Number | No | Charter price per day |
| Region | Text | No | e.g., "Mediterranean" |
| City | Text | No | e.g., "Monaco" |
| Status | Select | Yes | "charter" or "sale" |
| Available | Checkbox | No | Availability status |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout (clears session)

### Yachts
- `GET /api/admin/yachts` - Get all yachts
- `POST /api/admin/yachts` - Create new yacht
- `PUT /api/admin/yachts` - Update yacht
- `DELETE /api/admin/yachts?id=<id>` - Delete yacht

### Media
- `POST /api/admin/media` - Upload image (multipart form)
- `DELETE /api/admin/media?id=<id>` - Delete image

## Security Notes

1. All admin routes require authentication via userId cookie
2. Passwords are hashed using PBKDF2
3. Cookies are httpOnly and marked secure in production
4. File uploads are validated and saved to `public/uploads/yachts/`

## Troubleshooting

### Migration fails
- Clear old migrations: `rm -rf prisma/migrations`
- Check database connection
- Ensure POSTGRES_URL_NON_POOLING is set

### Can't login
- Check if User table exists: `psql -c "SELECT * FROM \"user\";"`
- Reinitialize admin user: `npx ts-node scripts/init-admin.ts`

### Images not uploading
- Ensure `public/uploads/yachts/` directory is writable
- Check file permissions
- Verify disk space

## Change admin password

```bash
npx prisma studio
```

Then manually update the password field with a new hashed value, or create a script.
