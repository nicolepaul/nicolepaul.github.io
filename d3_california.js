//Width and height
var w = 960;
var h = 500;
//Define map projection
var projection2 = d3.geoMercator()
  .center([-120, 37.5])
  .translate([w / 2, h / 2])
  .scale([w * 2.5]);

//Define path generator
var path2 = d3.geoPath()
  .projection(projection2);

// Define linear scale for output
var color = d3.scaleLinear()
  .domain([0, 8])
  .range(["rgb(213,222,217)", "rgb(84,36,55)"]);

//Create SVG
var svg3 = d3.select("#map2")
  .append("svg")
  .attr("width", w)
  .attr("height", h)
  .call(responsivefy);
// Load in my states data!
d3.csv("counties-lived.csv", function(data) {
  //Load in GeoJSON data
  d3.json("cb_2014_us_county_5m.json", function(json) {

    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {

      // Grab State Name
      var dataState = data[i].county;

      // Grab data value
      var dataMax = 20; // Hacky fix
      var dataValue = data[i].nocities;

      // Find the corresponding state inside the GeoJSON
      for (var j = 0; j < json.features.length; j++) {
        var jsonState = json.features[j].properties.NAME;

        if (dataState == jsonState.toUpperCase()) {

          // Copy the data value into the JSON
          json.features[j].properties.nocities = dataValue;
          console.log(dataValue)

          // Stop looking through the JSON
          break;
        }
      }
    }
    //Bind data and create one path per GeoJSON feature
    svg3.selectAll("path2")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path2)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .on("mouseover", function(d) {
        var xPosition = w / 2 + 150;
        var yPosition = h / 2;
        // 						var xPosition = parseFloat(path.centroid(this).attr("cx"));
        // 						var yPosition = parseFloat(path.centroid(this).attr("cy"));
        d3.select("#tooltip2")
          .style("left", xPosition + "px")
          .style("top", yPosition + "px");
        d3.select("#county")
          .text(d.properties.NAME);
        d3.select("#tooltip2")
          .classed("hidden", false);
      })

      .style("fill", function(d) {

        // Get data value
        var value = d.properties.nocities;

        if (value) {
          //If value exists…
          return color(value);
        } else {
          //If value is undefined…
          return "rgb(213,222,217)";
        }

      })

      .on("mouseover", function(d) {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.text(`${d.properties.NAME}: ${d.properties.nocities || 0}`)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - $('#jumbo').outerHeight(true)) + "px");
      })

      // fade out tooltip on mouse out
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })

    // Map the cities I have lived in!
    d3.csv("camp-fire-survivor-relocation.csv", function(data) {
      caData = data.filter((county) => county.State === 'CA')
      console.log(caData, 'caData')
      svg3.selectAll("circle")
        .data(caData)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return projection2([d.X, d.Y])[0];
        })
        .attr("cy", function(d) {
          return projection2([d.X, d.Y])[1];
        })
        .attr("r", function(d) {
          return 3; // radius of point circle
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

  iDomain = [1, 3, 5, 7, 20]

  var thresholdScale = d3.scaleThreshold()
  .domain([2, 4, 6, 8])
  .range(d3.range(5)
  .map(function(i) { return color(iDomain[i])}));

  var svg4 = d3.select("#legend2");

  svg4.append("g")
  .attr("class", "legendQuant")
  .attr("transform", "translate(20,20)");

  var legend2 = d3.legendColor()
    .labelFormat(d3.format(".0f"))
    .labels(d3.legendHelpers.thresholdLabels)
    // .useClass(true)
    .title("Number of cities")
    .scale(thresholdScale)


  svg4.select(".legendQuant")
  .call(legend2);


});
