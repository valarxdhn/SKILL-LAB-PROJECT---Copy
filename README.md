# ⚡ VoltCharge – EV Charging Station Finder & Booking

VoltCharge is a full-stack web application that helps users find EV charging stations, check charging port availability, and book charging slots conveniently.

## 📌 Project Overview

The **EV Charging Station Finder & Booking System** allows users to:

* View available EV charging stations
* Search and filter charging stations
* View station and charging port details
* Select a charging port
* Book a charging slot
* View existing bookings
* Update bookings
* Cancel bookings
* Check charging station and port availability
* Prevent duplicate bookings

The project demonstrates frontend development, backend REST APIs, database integration, validation, and CRUD operations.

---

## 🚀 Features

### 🔋 Charging Stations

* View all charging stations
* Search charging stations
* View station location and address
* View charging type
* View operating hours
* View contact information
* Check station availability
* View available charging ports

### 📅 Booking System

* Enter user details
* Select charging station
* Select charging port
* Select date and time
* Enter vehicle information
* Validate Indian vehicle registration number
* Validate Indian mobile number
* Prevent duplicate bookings
* View bookings
* Update bookings
* Cancel bookings

### 🎨 User Interface

* Clean white and green design
* Responsive layout
* Interactive forms
* Dynamic station rendering
* Dynamic booking rendering
* Mobile-friendly interface
* User-friendly navigation

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* DOM Manipulation
* Fetch API
* Responsive Web Design

### Backend

* Node.js
* Express.js
* REST API
* CORS
* JSON
* Server-side validation

### Database

* Supabase
* PostgreSQL

---

## 📂 Project Structure

```text
EV-Charging-Station/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

# ⚙️ Setup Instructions

## 1. Clone the Repository

Clone the GitHub repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project directory:

```bash
cd EV-Charging-Station
```

---

## 2. Install Backend Dependencies

Open the backend folder:

```bash
cd backend
```

Install the required packages:

```bash
npm install
```

---

## 3. Configure Supabase

Create a Supabase project and configure the required PostgreSQL tables.

The application uses Supabase for storing:

* Charging stations
* Charging ports
* Bookings

---

## 4. Configure Environment Variables

Create a `.env` file inside the `backend` folder.

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=5000
```

Replace the placeholder values with your Supabase project credentials.

### ⚠️ Important

Do **not** upload your `.env` file to GitHub.

Your `.gitignore` should contain:

```gitignore
node_modules/
.env
.env.*
!.env.example
```

---

## 5. Start the Backend

Inside the `backend` folder, run:

```bash
node server.js
```

The backend server will run at:

```text
http://localhost:5000
```

You should see a message similar to:

```text
Server running on port 5000
```

---

## 6. Run the Frontend

Open the `frontend` folder in VS Code.

Run `index.html` using **Live Server**.

The frontend communicates with the backend through REST API requests.

Example:

```text
Frontend
   ↓
JavaScript Fetch API
   ↓
Node.js + Express
   ↓
Supabase PostgreSQL
```

---

# 🔗 API Endpoints

## Charging Stations

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| GET    | `/stations`     | Get all stations       |
| GET    | `/stations/:id` | Get a specific station |
| POST   | `/stations`     | Add a new station      |
| PUT    | `/stations/:id` | Update a station       |
| DELETE | `/stations/:id` | Delete a station       |

## Bookings

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| GET    | `/bookings`     | Get all bookings       |
| GET    | `/bookings/:id` | Get a specific booking |
| POST   | `/bookings`     | Create a booking       |
| PUT    | `/bookings/:id` | Update a booking       |
| DELETE | `/bookings/:id` | Cancel a booking       |

---

# 🔐 Validation

The backend performs validation for important user inputs.

### Mobile Number

Indian mobile numbers are validated using the required 10-digit format.

Example:

```text
9876543210
```

### Vehicle Number

Indian vehicle registration numbers are validated.

Example:

```text
KA01AB1234
```

### Booking Validation

The system checks:

* Required user details
* Valid phone number
* Valid vehicle number
* Valid booking date
* Valid booking time
* Existing station
* Available station
* Existing charging port
* Charging port maintenance status
* Duplicate booking conflicts

---

# 🚫 Double Booking Prevention

Before creating a booking, the backend checks whether the selected charging port is already booked for the same:

```text
Charging Port
+
Date
+
Time
```

If a confirmed booking already exists, another booking for the same slot is rejected.

---

# 🗄️ Database

The project uses **Supabase PostgreSQL** as the database.

Main data entities include:

```text
Stations
   │
   └── Charging Ports

Bookings
   │
   ├── Station
   └── Charging Port
```

The backend uses the Supabase JavaScript client to perform database operations.

---

# 🔄 CRUD Operations

The project demonstrates RESTful CRUD operations.

### Create

```text
POST
```

Used for creating stations and bookings.

### Read

```text
GET
```

Used for retrieving stations and bookings.

### Update

```text
PUT
```

Used for updating stations and bookings.

### Delete

```text
DELETE
```

Used for deleting stations and cancelling bookings.

---

# 📱 Responsive Design

The frontend is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

The interface uses responsive CSS techniques to provide a consistent user experience.

---

# 🎯 Project Objective

The objective of this project is to develop a complete **EV Charging Station Finder and Booking System** that demonstrates practical implementation of frontend development, REST APIs, backend programming, database integration, validation, and CRUD operations.

---

# 📚 Learning Outcomes

Through this project, the following concepts are demonstrated:

* HTML structure
* CSS styling
* Responsive design
* JavaScript
* DOM manipulation
* JavaScript events
* Form validation
* Dynamic data rendering
* Fetch API
* Node.js
* Express.js
* REST API development
* GET, POST, PUT and DELETE
* JSON request/response handling
* HTTP status codes
* Error handling
* Supabase integration
* PostgreSQL database operations
* Git and GitHub

---

# 🔮 Future Improvements

Possible future enhancements include:

* User authentication
* Admin dashboard
* Google Maps integration
* Online payment
* Email booking confirmation
* Push notifications
* EV charging history
* User profiles
* Station ratings and reviews
* Cloud deployment

---

# 👨‍💻 Author

**Dhanush**

Computer Science Engineering Student

---

# 📄 License

This project is developed for **educational and academic purposes**.

