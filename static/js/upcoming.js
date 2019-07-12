function moviedata(movie) {
    var url = "/movies/" + `${movie}`;

    // Use d3 to select the div panel with class of `#jumbotron`
    var movie_data_title = d3.select("body > div > div:nth-child(1) > div.col-lg-8 > div > div:nth-child(1) > div");
    var movie_data_img = d3.select("#movie_data_body > div.col-6.text-center");
    var movie_data = d3.select("#movie_data_body > div:nth-child(2)");
    var movie_recommend_row = d3.select("body > div > div:nth-child(3)");

    movie_recommend_row.classed('d-none', false);

    d3.json(url).then(function (response) {

        // Use `.html("") to clear any existing data
        movie_data_title.html("");
        movie_data_img.html("");
        movie_data.html("");

        try {
            movie_data_title.selectAll('h1')
                .data(response)
                .enter()
                .append('h1')
                .attr('class', 'title_heading')
                .text(response[0].Title);

            movie_data_img.selectAll('img')
                .data(response)
                .enter()
                .append('img')
                .attr('src', response[0].Poster_Image)
                .attr('height', 'auto')
                .attr('width', 'auto');

            movie_data.append('div').attr('class', 'rating').text('IMDB Rating: ').append('p').text(response[0].Rating)
            movie_data.append('div').attr('class', 'duration').text('Duration: ').append('p').text(response[0].Duration + ' minutes')
            movie_data.append('div').attr('class', 'gross_earning').text('Gross Earnings: ').append('p').text('$' + parseInt(response[0].Gross_Earning).toLocaleString())
            movie_data.append('div').attr('class', 'genre').text('Genre: ').append('p').text(response[0].Genre)
            movie_data.append('div').attr('class', 'total_votes').text('Total Votes: ').append('p').text(parseInt(response[0].Total_Votes). toLocaleString())
        }

        catch (err) {
            var message = d3.select("body > div > div:nth-child(1) > div.col-lg-8 > div > div:nth-child(1) > div");
            message.html("");
            message.append("h1")
                .attr("class", "nothing_found")
                .text("No results found for " + movie);

            movie_recommend_row.classed('d-none', true);
        }
    });
}

function movieRecommender(movie) {
    var movieList_url = "/upcoming_movie_recommendation/" + `${movie}`;

    var movie_1 = d3.select("body > div > div:nth-child(4) > div:nth-child(1) > div > div > div:nth-child(1)");
    var movie_2 = d3.select("body > div > div:nth-child(4) > div:nth-child(2) > div > div > div:nth-child(1)");
    var movie_3 = d3.select("body > div > div:nth-child(4) > div:nth-child(3) > div > div > div:nth-child(1)");

    var movie_10 = d3.select("body > div > div:nth-child(4) > div:nth-child(1) > div > div > div:nth-child(2)");
    var movie_20 = d3.select("body > div > div:nth-child(4) > div:nth-child(2) > div > div > div:nth-child(2)");
    var movie_30 = d3.select("body > div > div:nth-child(4) > div:nth-child(3) > div > div > div:nth-child(2)");

    var upc_movies = [movie_1, movie_2, movie_3];
    let counter = 0;

    d3.json(movieList_url).then(function (movieList) {
        movie_1.html("");
        movie_2.html("");
        movie_3.html("");
        movie_10.html("");
        movie_20.html("");
        movie_30.html("");

        movieList.forEach(searchMovie);

        function searchMovie(movie) {
            var movie_url = "/upc_movie/" + `${movie}`;

            d3.json(movie_url).then(function (response) {
                upc_movies[counter].selectAll("img")
                    .data(response)
                    .enter()
                    .append('img')
                    .attr('src', response[0].Poster_Image);
            
                counter++;

                if (counter == 1) {
                    movie_10.append('div').attr('class', 'title_rec').text('Title: ').append('p').text(response[0].Title)
                    movie_10.append('div').attr('class', 'genre_rec').text('Genre: ').append('p').text(response[0].Genre)
                    movie_10.append('div').attr('class', 'release_date').append('p').text((response[0].Release_Date))
                }

                if (counter == 2) {
                    movie_20.append('div').attr('class', 'title_rec').text('Title: ').append('p').text(response[0].Title)
                    movie_20.append('div').attr('class', 'genre_rec').text('Genre: ').append('p').text(response[0].Genre)
                    movie_20.append('div').attr('class', 'release_date').append('p').text((response[0].Release_Date))
                }

                if (counter == 3) {
                    movie_30.append('div').attr('class', 'title_rec').text('Title: ').append('p').text(response[0].Title)
                    movie_30.append('div').attr('class', 'genre_rec').text('Genre: ').append('p').text(response[0].Genre)
                    movie_30.append('div').attr('class', 'release_date').append('p').text((response[0].Release_Date))
                }
               
            });
        }
    });
}

function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#dataSet");

    // Use the list of movies to populate the select options
    d3.json("/movie_title").then((movie_list) => {
        movie_list.forEach((movie) => {
            selector
                .append("option")
                .text(movie)
                .property("value", movie);
        });

        // Use the first movie to initialize
        const firstmovie = movie_list[0][0];
        moviedata(firstmovie);
        movieRecommender(firstmovie);
    });
}

// Initialize the dashboard
init();

// Select the submit and clear button
var submit = d3.select("#submit-btn");

submit.on("click", function () {
    d3.event.preventDefault();

    // Select the input element and get the raw HTML node
    var inputElement = d3.select("#input");

    // Get the value property of the input element
    var inputValue = inputElement.property("value");

    optionChanged(inputValue);

    d3.select("#dataSet").property('value', inputValue);
});

function optionChanged(newMovie) {
    // Fetch new data each time a new movie is selected
    moviedata(newMovie)
    movieRecommender(newMovie)
}