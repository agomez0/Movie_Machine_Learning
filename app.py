import pandas as pd
from sqlalchemy.ext.automap import automap_base
from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/newfinaldata.sqlite"
db = SQLAlchemy(app)

# Reflect an existing database into a new model
Base = automap_base()

# Reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Movies = Base.classes.movie_data
Images = Base.classes.images
Predict = Base.classes.predictions
Upcoming = Base.classes.upcoming


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/upcoming_movies")
def upcoming_movies():
    """Return data scatter plot page."""
    return render_template("upcoming.html")

@app.route("/data_exploration")
def data_exploration():
    """Return data exploration page."""
    return render_template("dataexploration.html")

@app.route("/gross_predictions")
def gross_predictions():
    """Return data scatter plot page."""
    return render_template("scatter.html")

@app.route("/movie_title")
def movies():
    movies = db.session.query(Movies.name).filter(Movies.name == Images.name).order_by(Movies.name.asc()).distinct()

    # Return a list of the column names (movies)
    return jsonify(list(movies))


@app.route("/movies/<movie>")
def find(movie):
    sel = [
        Movies.name,
        Movies.rating,
        Movies.duration,
        Movies.gross_earnings,
        Movies.genre,
        Movies.total_votes,
        Images.image
    ]

    table = db.session.query(*sel).join(Movies, Movies.name == Images.name).\
        filter(Movies.name == movie).all()

    movie_data = []
    for results in table:
        movie = {}
        movie["Title"] = results[0]
        movie["Rating"] = results[1]
        movie["Duration"] = results[2]
        movie["Gross_Earning"] = results[3]
        movie["Genre"] = results[4].replace("|", ", ")
        movie["Total_Votes"] = results[5]
        movie["Poster_Image"] = results[6]
        movie_data.append(movie)

    return jsonify(movie_data)


import sqlite3
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel

cnx = sqlite3.connect('db/newfinaldata.sqlite', check_same_thread=False)
df_movie = pd.read_sql_query("SELECT * FROM movie_data", cnx)
df_img = pd.read_sql_query("SELECT * FROM images", cnx)
df = pd.merge(df_movie, df_img, how="inner", on='name')

# Break up the big genre string into a string array
df['genre'] = df['genre'].str.split('|')

# Convert genres to string value
df['genre'] = df['genre'].fillna("").astype('str')

tf = TfidfVectorizer(analyzer='word',ngram_range=(1, 2),min_df=0, stop_words='english')
tfidf_matrix = tf.fit_transform(df['genre'])
cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)

# Build a 1-dimensional array with movie titles
titles = df['name']
indices = pd.Series(df.index, index=df['name'])

# Function that get movie recommendations based on the cosine similarity score of movie genres
def genre_recommendations(title):
    newtitle = title
    idx = indices[newtitle]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[0:21]
    movie_indices = [i[0] for i in sim_scores]
    return titles.iloc[movie_indices]

def clean_movies(title):
    movies = genre_recommendations(title).head(19).tolist()
    counter = 0
    for movie in movies:
        if movie == title:
            movies.remove(movie)
            counter += 1

    if counter == 0:
        del movies[-1]
    
    return movies

@app.route("/movie_recommendation/<movie>")
def movie_recommender(movie):
    try:
        movie_recommendation = clean_movies(movie)

    except KeyError:
        movie_recommendation = []

    return jsonify(movie_recommendation)

@app.route("/gross_data")
def alldata():
    response = db.session.query(Predict.movie_title, Predict.Predicted, Predict.Actual).all()

    g_data = []
    for result in response:
        movie = {}
        movie["Title"] = result[0]
        movie["Predicted"] = int(result[1])
        movie["Actual"] = int(result[2])
        g_data.append(movie)

    # Return a list of the gross earnings data
    return jsonify(g_data)



#=================================
#Upcoming Movies
#=================================
def recommend_upcoming(movie_name, genre):
    df_upcoming = pd.read_sql_query("SELECT * FROM upcoming", cnx)
    
    # drop unnecessary column
    df_upcoming = df_upcoming[['name', 'genre']]
    df_upcoming['genre'] = df_upcoming['genre'].str.strip()
    df_upcoming['genre'] = df_upcoming['genre'].str.replace(" ","")
    

    # Break up the big genre string into a string array
    df_upcoming['genre'] = df_upcoming['genre'].str.split(',')
    
    dict1 = {
         "name": movie_name,
         "genre": genre
    }
    
    
    ref_df = pd.DataFrame(dict1, index = [0])
    ref_df['genre'] = ref_df['genre'].str.split('|')
    
    df_upcoming = df_upcoming.append(ref_df, ignore_index=True)
    

    # Convert genres to string value
    df_upcoming['genre'] = df_upcoming['genre'].fillna("").astype('str')

    tf = TfidfVectorizer(analyzer='word',ngram_range=(1, 2),min_df=0, stop_words='english')
    tfidf_matrix = tf.fit_transform(df_upcoming['genre'])
    cosine_sim = linear_kernel(tfidf_matrix, tfidf_matrix)
    
    # Build a 1-dimensional array with movie titles
    titles = df_upcoming['name']
    indices = pd.Series(df_upcoming.index, index=df_upcoming['name'])

    # newtitle = movie_name
    idx = indices[movie_name]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    sim_scores = sim_scores[0:4]
    movie_indices = [i[0] for i in sim_scores]

    recommendations =  titles.iloc[movie_indices]

    return recommendations


@app.route("/upc_movie/<movie>")
def upcoming_movie(movie):
    sel = [
        Upcoming.name,
        Upcoming.image,
        Upcoming.release_date,
        Upcoming.genre
    ]

    table = db.session.query(*sel).filter(Upcoming.name == movie).all()

    movie_data = []
    for results in table:
        movie = {}
        movie["Title"] = results[0]
        movie["Poster_Image"] = results[1]
        movie["Release_Date"] = results[2]
        movie["Genre"] = results[3].strip()
        movie_data.append(movie)

    return jsonify(movie_data)


@app.route("/upcoming_movie_recommendation/<movie>")
def get_genre(movie):
    sel = [
        Movies.name,
        Movies.genre
    ]

    table = db.session.query(*sel).filter(Movies.name == movie).all()

    movie_data = []
    for results in table:
        movie_dict = {}
        movie_dict["Title"] = results[0]
        movie_dict["Genre"] = results[1]
        movie_data.append(movie_dict)
    
    data = movie_data[0]

    upcoming_movies = list(recommend_upcoming(movie, data["Genre"]))
    
    counter = 0
    for item in upcoming_movies:
        if item == movie:
            upcoming_movies.remove(item)
            counter += 1

    if counter == 0:
        del upcoming_movies[-1]
        
    return jsonify(upcoming_movies)
  

if __name__ == '__main__':
    app.run(debug=True)