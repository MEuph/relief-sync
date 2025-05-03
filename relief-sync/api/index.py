from fastapi import FastAPI
import mysql.connector

mydb = mysql.connector.connect(
    host="localhost",
    user='charris',
    password='6035Euph_'
)

mycursor = mydb.cursor()
mycursor.execute('USE relief_sync')
mycursor.close()
mycursor = mydb.cursor()
mycursor.execute('SELECT * from volunteer')

result = mycursor.fetchall()
mycursor.close()
mydb.commit()

app = FastAPI()

@app.get("/api/py/helloFastAPI")
def helloFastAPI():
    return {"result": result}