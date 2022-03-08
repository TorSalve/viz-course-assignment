// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import * as d3 from "d3";

function onlyUnique(value: any, index: any, self: any) {
  return self.indexOf(value) === index;
}

var activity

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("../data/ratings.csv").then(function (data) {
  // Add X axis
  const x = d3.scaleLinear().domain([4, 8]).range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 9]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

 // Calculate the sums and group data (while tracking count)
 const reduced = data.reduce(function(m, d){
    if(!m[d.team]){
      m[d.team] = {...d, count: 1};
      return m;
    }
    m[d.team]["Unpleasant-Pleasant"] += d["Unpleasant-Pleasant"];
    m[d.team]["Weak-Strong"] += d["Weak-Strong"];
    m[d.team].reb += d.reb;
    m[d.team].count += 1;
    return m;
 },{});
 
 // Create new array from grouped data and compute the average
 const result = Object.keys(reduced).map(function(k){
     const item  = reduced[k];
     return {
         team: item.team,
         "Unpleasant-Pleasant": item["Unpleasant-Pleasant"]/item.count,
         "Weak-Strong": item.["Weak-Strong"]/item.count,
         reb: item.reb/item.count
     }
 })

  const stmName = function (d: any) {
    return `${d.Frequency}-${d.Pattern}-${d.Repetitions}`;
  };

  var stmNames = [];
  for (var rating in data) {
    var d = data[rating];
    console.log(rating, d);
    stmNames.push(stmName(d));
  }
  stmNames = stmNames.filter(onlyUnique);
  console.log(stmNames);

  // Color scale: give me a specie name, I return a color
  const color = d3
    .scaleOrdinal()
    .domain(["setosa", "versicolor", "virginica"])
    .range(["#440154ff", "#21908dff", "#fde725ff"]);

  // Highlight the specie that is hovered
  const highlight = function (event: any, d: any) {
    var selected_specie = stmName(d);

    d3.selectAll(".dot")
      .transition()
      .duration(200)
      .style("fill", "lightgrey")
      .attr("r", 3);

    d3.selectAll("." + selected_specie)
      .transition()
      .duration(200)
      .style("fill", color(selected_specie) as string)
      .attr("r", 7);
  };

  // Highlight the specie that is hovered
  const doNotHighlight = function (event: any, d: any) {
    d3.selectAll(".dot")
      .transition()
      .duration(200)
      .style("fill", (d: any) => color(stmName(d)) as string)
      .attr("r", 5);
  };

  // Add dots
  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", function (d: any) {
      return "dot " + stmName(d);
    })
    .attr("cx", function (d: any) {
      return x(d["Unpleasant-Pleasant"]);
    })
    .attr("cy", function (d: any) {
      return y(d["Weak-Strong"]);
    })
    .attr("r", 5)
    .style("fill", function (d: any) {
      return color(stmName(d)) as string;
    })
    .on("mouseover", highlight)
    .on("mouseleave", doNotHighlight);
});
