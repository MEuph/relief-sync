# Relief Sync

# Development Environment Setup

* Clone the repository
* Install Next.js by following the instructions at https://nextjs.org/docs/app/getting-started/installation
* Setup a virtual environment in python
    * Open the terminal in VS Code
    * Navigate to ```relief-sync/relief-sync```
    * Run the following commands
    ```
    python -m venv venv
    source venv/bin/activate
    ```
* Then, install the dependencies
    ```
    npm install
    ```
* Then, start the server
    ```
    npm run dev
    ```
* Set up a MySQL server and create a user with full permissions. Remember the sign-in info, as this is how you will create the other users for the application
* Run the SQL file, ```initalize.sql```

Open http://localhost:3000 in any browser to see the webpage

# Setting up user roles

* Sign in as an admin account, and then create new users for each role. You can now sign in to each user role page by signing in with this login info.

# Possible Common Errors

* If you're getting an error saying a particular python package wasn't found, then navigate to ```relief-sync/relief-sync``` and run the command ```pip install -r requirements.txt```

# Usage

To use the app, navigate to ```localhost:3000```.

You should use whatever credentials you use for your MySQL server connection. For the database field, use ```relief_sync```