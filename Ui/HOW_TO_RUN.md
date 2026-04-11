# How to Run the AI Fitness Trainer Application (Frontend Only)

This guide provides step-by-step instructions to run the AI Fitness Trainer application in frontend-only mode using mock data. The backend is not required for this mode.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

1.  **Node.js**: The JavaScript runtime environment.
    -   Download and install the LTS version from: [https://nodejs.org/](https://nodejs.org/)
    -   Verify installation by running `node -v` and `npm -v` in your terminal.

2.  **Git** (Optional): Version control system, if you need to clone the repository.
    -   Download from: [https://git-scm.com/](https://git-scm.com/)

---

## Step 1: Navigate to the Project Directory

Open your terminal (Command Prompt, PowerShell, or Terminal) and navigate to the `Ui` folder of the project.

```bash
# Example
cd "e:/GRAD PROJ/codes/Ui"
```

## Step 2: Install Dependencies

Install the necessary project dependencies using `npm`. This only needs to be done once or when dependencies change.

```bash
npm install
```

If you encounter huge logs or errors, try deleting `node_modules` and `package-lock.json` and running `npm install` again, but usually `npm install` is sufficient.

## Step 3: Start the Development Server

Start the Vite development server to run the frontend.

```bash
npm run dev
```

You should see output similar to this:

```
  VITE vX.X.X  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Step 4: Access the Application

1.  Open your web browser (Chrome, Edge, Firefox, etc.).
2.  Navigate to: [http://localhost:5173](http://localhost:5173)

## Step 5: Using the Application (Mock Mode)

Since the backend is bypassed, the application uses local mock data.

-   **Login**: Use **any email** and **any password** to log in. You will be redirected to the dashboard.
-   **Dashboard**: You will see simulated user data (e.g., "John Doe").
-   **Workouts**: Browse the list of workouts.
-   **Live Training**: You can start a workout session. The camera feature requires browser permission.
-   **Reports**: View simulated workout history.

### Limitations
-   **Data Persistence**: Any changes you make (like updating your profile name or completing a workout) are saved to your browser's local storage or are temporary. They will not persist across browser clears or on other devices.
-   **Registration**: The registration flow is simulated and will create a new mock user session.

---

## Troubleshooting

-   **Port Already in Use**: If port 5173 is busy, Vite will automatically try the next available port (e.g., 5174). Check the terminal output for the correct URL.
-   **"npm" not recognized**: Ensure Node.js is installed and added to your system's PATH.

---

Happy Training! 🚀
