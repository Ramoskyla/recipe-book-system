# My Recipe Book

A simple web-based Recipe Book application where users can register, login, add, edit, delete, view, and download recipes. Recipes can belong to multiple categories and are visible to all users, but only the owner can modify them.

## Features

- **User Authentication**
  - Register new users
  - Login / Logout functionality
  - Personalized greeting after login

- **Recipe Management**
  - Add new recipes with:
    - Name
    - Multiple categories (Breakfast, Lunch, Dinner, Dessert)
    - Ingredients (line by line)
    - Instructions
    - Optional image URL
  - Edit and delete recipes (only by the owner)
  - View recipe details on a separate screen
  - Download recipes as `.txt` files

- **Search & Filter**
  - Search by recipe name or ingredients
  - Filter by category
  - Pagination for better navigation

- **Responsive Design**
  - Uses Bootstrap 5 for mobile-friendly layout

---

## Technology Stack

- HTML5
- CSS3 (Bootstrap 5)
- JavaScript (ES6)
- `localStorage` for data persistence (users & recipes)
