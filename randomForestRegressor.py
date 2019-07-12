import pandas as pd
import numpy
import matplotlib.pyplot as plt

movie_dataset = pd.read_csv(r'''Resources/movie_metadata.csv''')
# Remove unnecessary characters
for index, row in movie_dataset.iterrows():
    movie_dataset.loc[index, "movie_title"] = row["movie_title"].split('\xa0')[0]

# Drop duplicate rows    
movies = movie_dataset.drop_duplicates(subset="movie_title")
# Select needed columns
movies = movies[["num_critic_for_reviews", "content_rating", "gross", "num_voted_users", "cast_total_facebook_likes", "num_user_for_reviews", "budget", "movie_facebook_likes", "imdb_score", "duration", "genres"]]
# Drop rows with missing values
movies = movies.dropna(how="any")
# Select rows that don't have zero values for the facebook likes variables
movies = movies.loc[(movies["cast_total_facebook_likes"] != 0) & (movies["movie_facebook_likes"] != 0)]

# Dummy encode genres
genres = movies["genres"].str.get_dummies(sep='|')
# Drop old genres column
movies = movies.drop("genres", axis=1)
# Merge new genres dataframe with the original one
movies_df = genres \
    .merge(movies, left_index = True, right_index = True)

# Select X and y values
X = movies_df.drop("gross", axis=1)
y = movies_df['gross']

data = X.copy()

# Dummy encode content rating
data_binary_encoded = pd.get_dummies(data)

# Remove some of the content_rating variables
data_binary_encoded = data_binary_encoded.drop(["content_rating_Not Rated", "content_rating_Passed", "content_rating_Unrated", "content_rating_Approved"], axis=1)

# Separate data into training and testing data
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(data_binary_encoded, y, random_state=42)

# Fit the training data into the RandomForestRegressor model
from sklearn.ensemble import RandomForestRegressor
regr = RandomForestRegressor(max_depth=8, random_state=42, n_estimators=300)
regr.fit(X_train, y_train) 

# Quantify the model
training_score = regr.score(X_train, y_train)
testing_score = regr.score(X_test, y_test)

print(f"Training Score: {training_score}")
print(f"Testing Score: {testing_score}")

from sklearn.metrics import mean_squared_error

predictions = regr.predict(X_test)
MSE = mean_squared_error(y_test, predictions)
r2 = regr.score(X_test, y_test)

print(f"MSE: {MSE}, R2: {r2}")

# Actual gross vs predicted gross
df = pd.DataFrame({"Actual": y_test, "Predicted": predictions})
new = pd.merge(df, movie_dataset, left_index=True, right_index=True)
new = new[["Actual", "Predicted", "movie_title"]]

# Round gross to a whole number
new = new.round({"Predicted":0}) 


# Send data to SQLite table
import sqlite3

def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
 
    return None

def create_table(conn, create_table_sql):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :param create_table_sql: a CREATE TABLE statement
    :return:
    """
    try:
        c = conn.cursor()
        c.execute("DROP TABLE IF EXISTS predictions;")
        c.execute(create_table_sql)
    except Error:
        print("bad")
 
    return None


def create_project(conn, project):
    """
    Create a new project into the predictions table
    :param conn:
    :param project:
    :return: project id
    """
    sql = ''' INSERT INTO predictions(Actual, Predicted, movie_title)
              VALUES(?,?,?) '''
    cur = conn.cursor()
    cur.execute(sql, project)
    return cur.lastrowid


# Create table statement
p_table = """ CREATE TABLE predictions (Actual integer, Predicted integer, movie_title text); """
# Database
database = "db/newfinaldata.sqlite"
# Create connection to database
conn = create_connection(database)


if conn is not None:
    # create predictions table
    create_table(conn, p_table)
else:
    print("Cannot create the database connection.")


for index, row in new.iterrows():
    with conn:
        # create a new prediction row
        predict = (row["Actual"], row["Predicted"], row["movie_title"])
        create_project(conn, predict)
        #project_id = create_project(conn, project)

