# 📝 Smart Resume Builder

A full-stack, interview-ready MERN application that enables job seekers to design, save, version, and export ATS-optimized resumes in real-time. Features fluid interactive panels, dynamic completion statistics, snapshot checkpointing (version history), and premium PDF compiling.

---

## 🚀 Tech Stack

- **Frontend**: React.js, React Router, Tailwind CSS, Context API, Axios
- **Backend**: Node.js, Express.js (MVC Architecture)
- **Database**: MongoDB (Local or Atlas)
- **Security & Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing
- **PDF Generation**: `jspdf` & `html2canvas`

---

## 📂 Project Directory Structure

```
Smart-Resume-Builder/
├── client/
│   ├── src/
│   │   ├── components/      # Common components: Navbar, ResumeTemplates (Modern, Professional, Minimal)
│   │   ├── pages/           # Pages: LandingPage, LoginPage, SignupPage, Dashboard, ResumeBuilder
│   │   ├── context/         # React Contexts: AuthContext (auth state), ThemeContext (dark/light)
│   │   ├── services/        # API Client: Axios configurations, interceptors, services
│   │   ├── utils/           # Auxiliary formatting/validation scripts
│   │   ├── App.jsx          # Route management & secure route guard wraps
│   │   └── index.css        # Tailwind directives and global print layers
│   ├── index.html           # Document configuration and Google Fonts imports
│   └── vite.config.js       # Vite configuration with Tailwind plugin
│
├── server/
│   ├── controllers/         # Business Logic controllers (authController, resumeController)
│   ├── models/              # Mongoose Data Schemas (User, Resume)
│   ├── routes/              # Route Endpoints (authRoutes, resumeRoutes)
│   ├── middleware/          # Express Middleware (auth guard, global errorHandler)
│   ├── .env                 # API Secrets & Mongo Connection String
│   ├── .env.example         # Reference template for backend environmental variables
│   └── index.js             # Main server execution entry point
```

---

## ⚙️ How to Add Your Database Connection String

To point the backend to your local or cloud MongoDB server, follow these simple steps:

1. Locate the `.env` file in the `server` directory (automatically created for you during generation).
2. Find the variable named `MONGO_URI`.
3. Set it to your desired connection string. By default, it is configured to your requested local database:
   ```env
   MONGO_URI=mongodb://localhost:27017/smart_resume_builder
   ```
4. Save the file. When the server launches, it will output a success statement indicating it connected to the database successfully.

---

## 💻 Running the Application Locally

Follow these quick commands to spin up the MERN application on your machine:

### 1. Launch the Backend Server

```bash
cd server
npm install       # Install backend packages
npm run dev       # Launches server with Nodemon (running on http://localhost:5001)
```

### 2. Launch the Frontend React Client

```bash
cd client
npm install       # Install frontend packages
npm run dev       # Launches Vite dev server (usually running on http://localhost:5173)
```

---

## 💡 Deep Technical Workflows Explained

This section details the primary technical workflows of the application, making it highly valuable for software engineering interviews.

### 1. Authentication Workflow
```
[React Client] ──▶ Submits registration/login details
      │
      ▼
[Auth Context API] ──▶ Calls Axios Service
      │
      ▼
 [Express server] ──▶ Encrypts password (bcryptjs) & Saves in Mongo
      │
      ▼
 [Token Signed] ──▶ Returns Signed JWT
      │
      ▼
[Client Browser] ──▶ Saves Token in LocalStorage, appends Bearer to Axios headers
```

- **Password Hashing**: Done securely on the server using `bcryptjs`. We generate a 10-round salt, hash the plain-text password, and store the resulting irreversible hash in MongoDB.
- **Route Protection**: When client tries to access secured views like `/dashboard` or `/builder/:id`, a frontend route wrapper `ProtectedRoute` checks the login context state. If no profile exists, it forces a redirect to `/login`.
- **Axios Interceptor**: A request interceptor in `client/src/services/api.js` automatically intercepts outgoing Axios calls. If a JWT token exists in `localStorage`, it automatically appends it to the header as: `Authorization: Bearer <TOKEN>`.
- **Middleware Guard**: On the backend, incoming protected API routes pass through `server/middleware/auth.js`. This middleware extracts the bearer token, verifies it using `jwt.verify()`, fetches the user profile from MongoDB (excluding password hashes), and appends it to `req.user` for controller use.

---

### 2. API Router & Controller Workflow
The backend is structured around the **MVC (Model-View-Controller)** pattern. Routes receive incoming HTTP verbs, verify payloads, layer authentication guards, and invoke controller functions.

```
Incoming Request
       │
       ▼
 [Express Route] ──▶ Layer [Auth Middleware] (verifies JWT Bearer)
       │
       ▼
[Controller Handler]
       ├─ REGISTER/LOGIN ──▶ Encrypts credentials, signs token
       ├─ GET RESUMES ──▶ Filters documents by req.user.id
       ├─ UPDATE/SNAPSHOT ──▶ Triggers validation, pushes versions array
       └─ ROLLBACK ──▶ Restores root schema details from historical arrays
       │
       ▼
[Global Error Middleware] ──▶ Parses CastErrors, duplicate keys, expired tokens ──▶ Standard JSON Response
```

#### Core Endpoints:
- **Auth Endpoint**:
  - `POST /api/auth/register`: Public registration endpoint.
  - `POST /api/auth/login`: Public login endpoint returning signed JWTs.
  - `GET /api/auth/profile`: Secure endpoint verifying current active session profiles.
- **Resume Endpoints (Protected)**:
  - `POST /api/resume`: Creates a blank resume canvas template.
  - `GET /api/resume`: Retrieves lightweight metadata list for Dashboard view.
  - `GET /api/resume/:id`: Fetches the detailed fields of a specific resume.
  - `PUT /api/resume/:id`: Updates fields. Setting `createSnapshot: true` saves the current state into version histories.
  - `POST /api/resume/:id/rollback`: Rolles back root resume details to a prior snapshot.
  - `DELETE /api/resume/:id`: Removes a resume from the database.

---

### 3. Database Structure
The schemas are designed using Mongoose to enforce atomic data types and support nested documents inside MongoDB.

#### User Schema
- **name**: String (Required, Trimmed)
- **email**: String (Required, Unique, Lowercase, validates email formats)
- **password**: String (Required, Minimum length 6)

#### Resume Schema
The resume collection stores core contact details, multi-field lists, and historical versions in a single document:
- **userId**: ObjectId (references `User` collection)
- **title**: String (name of resume)
- **personalInfo**: Sub-Document (email, phone, address, website, github, linkedin, summary)
- **education**: Array of Education Sub-documents (school, degree, fieldOfStudy, startDate, endDate, currentlyStudying)
- **experience**: Array of Experience Sub-documents (company, position, location, startDate, endDate, currentlyWorking, description)
- **projects**: Array of Project Sub-documents (title, description, technologies, link, github)
- **skills**: Array of Skill Sub-documents (category, items)
- **certifications**: Array of Cert Sub-documents (name, organization, issueDate, expirationDate)
- **achievements**: Array of Achievement Sub-documents (title, description, date)
- **template**: String (modern, professional, minimal)
- **versionNumber**: Number (current active document edition number)
- **versionHistory**: Array of Snapshot Sub-documents (stores copies of all previous resume configurations for rollback)

---

### 4. Resume PDF Generation Workflow
Creating highly readable, print-perfect PDFs from browser elements requires converting reactive DOM models into vector sheets.

```
[React State Inputs] ──▶ Dynamic CSS Grid Template
                                │
                                ▼
                      [A4 Sized Render Node]
                                │
                                ▼
                       [html2canvas (scale: 2)]
                                │
                                ▼
                         [High-Res Canvas]
                                │
                                ▼
                   [jsPDF (A4 Sheet Dimensions)] ──▶ Multi-page slice calculations ──▶ User PDF download
```

1. **Marginal Scaling**: The selected template (Modern, Professional, Minimal) is outputted into a sticky container styled specifically to mimic the exact proportions of standard **A4 Dimensions** (`21cm` x `29.7cm`).
2. **Double-Scale Canvas Capture**: When the user clicks "Download PDF", `html2canvas` captures the container element. Setting `{ scale: 2 }` forces the browser to compile the text and layouts at double resolution, eliminating pixelation and maintaining high-quality text vectors.
3. **Multi-Page Slicing**:
   - jsPDF initialized with A4 parameters (`p`, `mm`, `a4`).
   - We map the height of the generated canvas against the maximum page height in millimeters.
   - If the canvas exceeds 297mm, a page loop computes vertical margins, executes `pdf.addPage()`, slices the image viewport dynamically, and places the next chunk on subsequent sheets.
4. **Local Download**: The compiled document is saved automatically via the user's browser download pipeline.

---

### 5. Deployment Process

#### Frontend (Vercel)
Vercel is optimal for React Vite setups.
1. Sign up on [Vercel](https://vercel.com).
2. Connect your Git repository.
3. In Build Settings:
   - Framework Preset: **Vite**
   - Root Directory: **`client`**
   - Build Command: **`npm run build`**
   - Output Directory: **`dist`**
4. Add Environmental Variable:
   - `VITE_API_URL` = (Your Render backend endpoint URL, e.g., `https://smart-resume-api.onrender.com/api`)
5. Click **Deploy**.

#### Backend (Render)
Render is an excellent host for Node Express servers.
1. Sign up on [Render](https://render.com).
2. Click **New Web Service** and link your Git repository.
3. In settings:
   - Root Directory: **`server`**
   - Runtime: **`Node`**
   - Build Command: **`npm install`**
   - Start Command: **`npm start`**
4. In Advanced Environment Variables:
   - `PORT` = `5001`
   - `MONGO_URI` = (Your MongoDB Atlas cloud connection URI string)
   - `JWT_SECRET` = (A secure random alphanumeric string)
   - `NODE_ENV` = `production`
5. Click **Create Web Service**.
