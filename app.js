function footballdata(team) {
    var url = "/games/" + `${team}`;

    // Use d3 to select the panel with id of `#gamedata`
    var football_data = d3.select("#gamedata");

    d3.json(url).then(function (response) {
        // Use `.html("") to clear any existing data
        football_data.html("");

        football_data.html('<b>Number of Games: </b>' + response.length);
    });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#dataSet");

  // Use the list of teams to populate the select options
  d3.json("/teams").then((team_list) => {
    team_list.forEach((team) => {
      selector
        .append("option")
        .text(team)
        .property("value", team);
    });

      // Use the first team from the list to build the initial plots
      const firstteam = team_list[0][0];
      footballdata(firstteam);
  });
}

// Initialize the dashboard
init();

function optionChanged(newTeam) {
    // Fetch new data each time a new team is selected
}   

$('select').on('change', function () {
    var team = this.value;
    localStorage.setItem("x", team);
});