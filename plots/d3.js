/*  This visualization was made possible by modifying code provided by:

Scott Murray, Choropleth example from "Interactive Data Visualization for the Web"
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html

Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */


//Width and height of map
var width = 960;
var height = 500;


// D3 Projection
var projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2]) // translate to center of screen
  .scale([1000]); // scale things down so see entire US

// Define path generator
var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
  .projection(projection); // tell path generator to use albersUsa projection


// Define linear scale for output
var color = d3.scaleLinear()
  .domain([0, 13])
  .range(["rgb(213,222,217)", "rgb(84,36,55)"]);

// Reside container according to browser width
function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height")),
    aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
    .attr("perserveAspectRatio", "xMinYMid")
    .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
    var targetWidth = parseInt(container.style("width"));
    svg.attr("width", targetWidth);
    svg.attr("height", Math.round(targetWidth / aspect));
  }
}

//Create SVG element and append map to the SVG
var svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  // .attr("preserveAspectRatio", "xMinYMin meet")
  // .attr("viewBox", `0 0 ${width} ${height}`)
  .call(responsivefy);

// Append Div for tooltip to SVG
var div = d3.select("#map")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Load in my states data!
d3.csv("stateslived.csv", function(data) {


// BEGIN US-STATES.JSON
  // Load GeoJSON data and merge with states data
  d3.json("us-states.json", function(json) {

    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {

      // Grab State Name
      var dataState = data[i].state;

      // Grab data value
      var dataMax = 13; // Hacky fix
      var dataValue = data[i].visited;

      // Find the corresponding state inside the GeoJSON
      for (var j = 0; j < json.features.length; j++) {
        var jsonState = json.features[j].properties.name;

        if (dataState == jsonState) {

          // Copy the data value into the JSON
          json.features[j].properties.visited = dataValue;

          // Stop looking through the JSON
          break;
        }
      }
    }

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1")

      // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
      // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
      .on("mouseover", function(d) {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.text(`${d.properties.name}: ${d.properties.visited || 0}`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - $('#jumbo').outerHeight(true)) + "px");
      })

      // fade out tooltip on mouse out
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })

      .style("fill", function(d) {

        // Get data value
        var value = d.properties.visited;

        if (value) {
          //If value exists…
          return color(value);
        } else {
          //If value is undefined…
          return "rgb(213,222,217)";
        }

      });


    // Map the cities I have lived in!
    d3.csv("camp-fire-survivor-relocation.csv", function(data) {

      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return projection([d.X, d.Y])[0];
        })
        .attr("cy", function(d) {
          return projection([d.X, d.Y])[1];
        })
        .attr("r", function(d) {
          return 4; // radius of point circle
        })
        .style("fill", "rgb(217,91,67)")
        .style("opacity", 0.85)

        // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
        // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
        .on("mouseover", function(d) {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.text(d["Full Name"])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - $('#jumbo').outerHeight(true)) + "px");
        })

        // fade out tooltip on mouse out
        .on("mouseout", function(d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
    });
  });

  // END UNITED-STATES.JSON

  iDomain = [0, 2, 6, 8, 13]

  var thresholdScale = d3.scaleThreshold()
  .domain([1, 4, 8, 12])
  .range(d3.range(5)
  .map(function(i) { return color(iDomain[i])}));

var svg2 = d3.select("#legend");

svg2.append("g")
  .attr("class", "legendQuant")
  .attr("transform", "translate(20,20)");

var legend = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .labels(d3.legendHelpers.thresholdLabels)
    // .useClass(true)
    .title("Number of cities")
    .scale(thresholdScale)


svg2.select(".legendQuant")
  .call(legend);


});
