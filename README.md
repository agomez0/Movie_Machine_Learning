# Content-Based Movie Recommender

Our project uses a content-based movie recommender algorithm that recommends movies to users based on genre similarity. It uses the Vector Space Model, which stores movies as a vector of their genres; the cosine between the angles of vectors is calculated to determine the similarity between genres of the movies.

Our goal for the recommender is to facilitate the movie selection process for users that wish to view movies similar to those they already know they like.

In addition to the movie recommender, we used a Random Forest Regressor model to predict the gross of movies based on a few movie variables such as IMDB rating, movie budget, and content rating. The most important feature in predicting the gross was the number of users that voted.

### Files:
* `Resources/movie_metadata.csv`: IMDB movie dataset with 28 columns and 5000 rows. 
* `db/newfinaldata.sqlite`: SQLite database with four tables:
    * `movie_data`: Dataset with movie title and its content features including rating, duration, genre, etc.
    * `images`: Title of movie and its poster image
    * `upcoming`: Upcoming 2019 movies and their poster image, content rating and release date
    * `predictions`: Actual gross and predicted gross
* `webscrape_2019_movies.ipynb`: Web scrapes upcoming movie information from https://www.imdb.com/list/ls029217360/
    * NOTE: The contents of the webscraped site were exported to `upcoming_movies_2019.csv`
* All extract, transform, and load files: clean the data and export it to a MySQL database.
* `randomForestRegressor.py`: Random Forest Regressor model; exports gross predictions and actual gross directly to the SQLite file 

### Programs/Tools Used:
* Python Flask
* SQLite
* Sklearn
* Javascript
* HTML
* CSS
* Plotly.js
* D3.js
* SQLAlchemy

### Webpages:
* `/`: Main movie recommender that suggests similar movies
* `/upcoming_movies`: Second movie recommender that suggests upcoming movies based on selection of past movies
* `/data_exploration`: Various graphs of the distribution of variables used in the Random Forest Regressor model and possible correlations
* `/gross_predictions`: Quantification of the Random Forest Regressor model

### How to run the app locally:
* NOTE: Our SQLite file is pre-loaded with all the data needed.
* 1) Open your terminal in the downloaded repository.
* 2) Run the command `python app.py`
* 3) Paste this link into a browser: http://127.0.0.1:5000/

### Link to Webpage/Heroku App:
https://fake-imdb.herokuapp.com
