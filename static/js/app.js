function moviedata(movie) {
    var url = "/movies/" + `${movie}`;

    // Use d3 to select the div panel with class of `#jumbotron`
    var movie_data_title = d3.select("body > div > div:nth-child(1) > div.col-lg-8 > div > div:nth-child(1) > div");
    var movie_data_img = d3.select("body > div > div:nth-child(1) > div.col-lg-8 > div > div:nth-child(2) > div:nth-child(1)");
    var movie_data = d3.select("body > div > div:nth-child(1) > div.col-lg-8 > div > div:nth-child(2) > div:nth-child(2)");

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

            movie_data.append('p').text('IMDB Rating: ' + response[0].Rating)
            movie_data.append('p').text('Duration: ' + response[0].Duration + ' minutes')
            movie_data.append('p').text('Gross Earnings: $' + parseInt(response[0].Gross_Earning).toLocaleString())
            movie_data.append('p').text('Genre: ' + response[0].Genre)
            movie_data.append('p').text('Total Votes: ' + parseInt(response[0].Total_Votes). toLocaleString())

        }

        catch (err) {
            message = d3.select("#movie_data_body");
            message.html("");
            message.append("h1")
                .attr("class", "nothing_found")
                .text("No results found for " + movie);
        }
    });
}

function movieRecommender(movie) {
    var movieList_url = "/movie_recommendation/" + `${movie}`

    var carousel_1 = d3.select("#demo > div > div:nth-child(1)");
    var carousel_2 = d3.select("#demo > div > div:nth-child(2)");
    var carousel_3 = d3.select("#demo > div > div:nth-child(3)");

    var carousel_group = [carousel_1, carousel_2, carousel_3];
    let carousel_count = 0;

    d3.json(movieList_url).then(function (movieList) {
        carousel_1.html("");
        carousel_2.html("");
        carousel_3.html("");

        try {
            movieList.forEach(searchMovie);

            function searchMovie(movie) {
                var movie_url = "/movies/" + `${movie}`;

                d3.json(movie_url).then(function (response) {
                    if (carousel_group[carousel_count]._groups[0][0].childElementCount < 6) {
                        carousel_group[carousel_count].selectAll('div.carousel-item')
                            .data(response)
                            .enter()
                            .append('div')
                            .attr('class', 'col-xs-2 col-sm-2 col-md-2')
                            .append('img')
                            .attr('src', response[0].Poster_Image);
                    }

                    else {
                        carousel_count++;
                        carousel_group[carousel_count].selectAll('div.carousel-item')
                            .data(response)
                            .enter()
                            .append('div')
                            .attr('class', 'col-xs-2 col-sm-2 col-md-2')
                            .append('img')
                            .attr('src', response[0].Poster_Image);
                    }
                })
            }
        }

        catch (err) {
            message = d3.select("body > div > div:nth-child(2)");
            message.html("");
            message.append("h1")
                .attr("class", "nothing_found_bottom")
                .text("No results found for " + movie);
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
});

function optionChanged(newMovie) {
    // Fetch new data each time a new movie is selected
    moviedata(newMovie)
    movieRecommender(newMovie)
}   

//$('select').on('change', function () {
//    var team = this.value;
//    localStorage.setItem("x", team);
//});