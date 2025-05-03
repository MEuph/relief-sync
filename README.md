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
* Set up a MySQL server, and change ```username``` and ```password``` in ```index.py``` to the proper values for your SQL connection
* Run the SQL file, ```initalize.sql```

Open http://localhost:3000 in any browser to see the webpage

Open http://127.0.0.1:8000/api/py/helloFastApi to see the result of running

    ```sql
    SELECT * FROM volunteers;
    ```

# Possible Common Errors

* If you're getting an error saying a particular python package wasn't found, then navigate to ```relief-sync/relief-sync``` and run the command ```pip install -r requirements.txt```

# Usage

To use the app, navigate to ```localhost:3000```. If you're signed in to your database on the app, then you'll be automatically redirected to a page where you can input any arbitrary queries. Otherwise, you'll be redirected to a sign-in page.

You should use whatever credentials you use for your MySQL server connection. For the database field, use ```relief_sync```