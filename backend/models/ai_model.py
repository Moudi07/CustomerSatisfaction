import pymongo
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import numpy as np

# MongoDB connection setup
client = pymongo.MongoClient('mongodb+srv://mahabduswamad:nPfr7eycOfbtATqO@cluster1.gictr.mongodb.net/airlineDB?retryWrites=true&w=majority')
db = client['airlineDB']
survey_collection = db['surveys']
prediction_collection = db['predictions']  # New collection for predictions

# Fetch data from MongoDB
data = list(survey_collection.find({}))

# Print the number of records fetched
print(f"Number of records retrieved from MongoDB: {len(data)}")

# Initialize lists for features (X) and labels (y)
X = []
y = []

# Helper function to convert string to float, with fallback
def to_float(value):
    try:
        return float(value)
    except (ValueError, TypeError):
        return None

# Classification logic
def classify_satisfaction(satisfaction):
    if satisfaction <= 1.5:
        return 1  # Dissatisfied
    elif 1.5 < satisfaction <= 2.5:
        return 2  # Slightly dissatisfied
    elif 2.5 < satisfaction <= 3.5:
        return 3  # Neutral
    elif 3.5 < satisfaction <= 4.5:
        return 4  # Slightly satisfied
    else:
        return 5  # Satisfied

# Preprocessing: Check if each record has the required fields and append to X and y
for item in data:
    try:
        features = [
            to_float(item['seatComfort']),
            to_float(item['foodAndDrink']),
            to_float(item['onlineSupport']),
            to_float(item['departureArrivalTime']),
            to_float(item['gateLocation']),
            to_float(item['inflightWifi']),
            to_float(item['inflightEntertainment']),
            to_float(item['easeOfOnlineBooking']),
            to_float(item['onBoardService']),
            to_float(item['legRoomService']),
            to_float(item['baggageHandling']),
            to_float(item['checkinService']),
            to_float(item['cleanliness']),
            to_float(item['onlineBoarding'])
        ]
        
        if None in features:
            print(f"Skipping document with ID {item['_id']} due to invalid feature values.")
            continue

        X.append(features)
        satisfaction = sum(features) / len(features)
        y.append(satisfaction)

    except KeyError as e:
        print(f"Skipping document with ID {item['_id']} due to missing field: {e}")

# Convert lists to NumPy arrays
X = np.array(X)
y = np.array(y)

if len(X) == 0 or len(y) == 0:
    print("No valid data available for training.")
else:
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    clf = RandomForestRegressor()
    clf.fit(X_train, y_train)

    predictions = clf.predict(X_test)

    for i, prediction in enumerate(predictions):
        classified_satisfaction = classify_satisfaction(prediction)  # Classify the prediction
        
        # Insert into predictions collection
        prediction_collection.insert_one({
            'original_data': data[i],
            'predicted_satisfaction': prediction,
            'classified_satisfaction': classified_satisfaction
        })

    print('Predictions saved to MongoDB')
