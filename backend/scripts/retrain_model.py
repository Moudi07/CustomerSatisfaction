import pickle
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import pandas as pd
import os

# Load new data from database (example using MongoDB)
from pymongo import MongoClient

client = MongoClient('mongodb+srv://mahabduswamad:nPfr7eycOfbtATqO@cluster1.gictr.mongodb.net/customer-satisfaction?retryWrites=true&w=majority')
db = client['customer-satisfaction']
collection = db['surveys']

# Load the latest data from MongoDB
data = pd.DataFrame(list(collection.find()))

# Update the column names for satisfaction-related attributes
satisfaction_columns = [
    'seatComfort', 'departureArrivalTime', 'foodAndDrink', 
    'gateLocation', 'inflightWifi', 'inflightEntertainment', 
    'onlineSupport', 'easeOfOnlineBooking', 'onBoardService', 
    'legRoomService', 'baggageHandling', 'checkinService', 
    'cleanliness', 'onlineBoarding'
]

# Calculate average satisfaction score and create target column
data['satisfaction_avg'] = data[satisfaction_columns].mean(axis=1)
data['satisfaction'] = data['satisfaction_avg'].apply(lambda x: 1 if x >= 4 else 0)

# Define features and target
X = data.drop(columns=['satisfaction', 'satisfaction_avg'])
y = data['satisfaction']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Retrain the Logistic Regression model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Save the model to the 'backend/models/' directory
model_dir = 'backend/models'
if not os.path.exists(model_dir):
    os.makedirs(model_dir)

with open(os.path.join(model_dir, 'satisfaction_model.pkl'), 'wb') as f:
    pickle.dump(model, f)

print("Model retrained and saved in backend/models/satisfaction_model.pkl.")
