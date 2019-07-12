// Define SVG area dimensions
var svgWidth = 760;
var svgHeight = 560;

// Define the chart's margins as an object
var chartMargin = {
  top: 60,
  right: 80,
  bottom: 60,
  left: 100
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and to the bottom
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.bottom})`);

  
d3.json("/gross_data").then(function(response) {

    console.log(response);

    response.forEach(function(data) {
        data.Actual = +data.Actual;
        data.Predicted = +data.Predicted;
    })

    var xScale = d3.scaleLinear()
        .domain([10000, d3.max(response, d => d.Actual)])
        .range([0, chartWidth]);

    var yScale = d3.scaleLinear()
        .domain([10000, d3.max(response, d => d.Predicted)])
        .range([chartHeight, 0]);

    var bottomAxis = d3.axisBottom(xScale);
    var leftAxis = d3.axisLeft(yScale);

    chartGroup.append("g")
        .call(leftAxis);

    chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    var circlesGroup = chartGroup.selectAll(".circle")
        .data(response)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", d => xScale(d.Actual))
        .attr("cy", d => yScale(d.Predicted))
        .attr("r", 12)
        .attr("fill", "red")
        .attr("opacity", ".5");

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - chartMargin.left - 4)
      .attr("x", 0 - (chartHeight / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Predicted Gross");

    chartGroup.append("text")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top - 4})`)
      .attr("class", "axisText")
      .text("Actual Gross");

    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([95, -40])
    .html(function(d) {
    return (`${(d.Title).bold()}<br>Predicted: $${d.Predicted.toLocaleString()}<br>Actual: $${d.Actual.toLocaleString()}`);
    });

    // Create tooltip in the chart
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 18)
          .attr("opacity", "1")
          .attr("fill", "black");
    })
        // onmouseout event
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 12)
          .attr("fill", "red")
          .attr("opacity", "0.5");
        
        });
  
    
});

