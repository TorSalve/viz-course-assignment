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

const stimulus = "stimulus";
const evaluation = "Unpleasant-Pleasant";
const potency = "Weak-Strong";
const activity = "Calm-Excitable";
const perceivability = "perceivability";

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

const stmName = function (d: any) {
  return `${d.Frequency}-${d.Pattern}-${d.Repetitions}`;
};

d3.csv("../data/ratings.csv").then(function (data) {
  // Add X axis
  const x = d3.scaleLinear().domain([0, 6]).range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 6]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  // Calculate the sums and group data (while tracking count)
  const reduced = data.reduce(function (m: any, d: any) {
    var stm = stmName(d);
    if (d[perceivability] == "False") {
      return m;
    }

    // console.log(m, d, stm);
    if (!m[stm]) {
      m[stm] = { ...d, count: 1 };
      return m;
    }
    console.log(
      stm,
      parseInt(d[evaluation]),
      parseInt(d[potency]),
      parseInt(d[activity])
    );
    m[stm][evaluation] += parseInt(d[evaluation]);
    m[stm][potency] += parseInt(d[potency]);
    m[stm][activity] += parseInt(d[activity]);
    m[stm][stimulus] = stm;
    m[stm].count += 1;
    return m;
  }, {});

  // Create new array from grouped data and compute the average
  const result = Object.keys(reduced).map(function (k) {
    const item = reduced[k];
    console.log(item);
    return {
      stimulus: item[stimulus],
      evaluation: item[evaluation], // / item.count,
      potency: item[potency], /// item.count,
      activity: item[activity], /// item.count,
    };
  });

  var stmNames = [];
  for (var rating in data) {
    if (rating == "columns") {
      continue;
    }
    var d = data[rating];
    stmNames.push(stmName(d));
  }
  stmNames = stmNames.filter(onlyUnique);

  // Color scale: give me a specie name, I return a color
  const color = d3
    .scaleOrdinal()
    .domain(stmNames)
    .range([
      "#885673",
      "#835978",
      "#7D5C7C",
      "#775F80",
      "#706284",
      "#696586",
      "#616888",
      "#586B89",
      "#506D89",
      "#477088",
      "#3F7287",
      "#367485",
      "#2F7682",
      "#29787E",
      "#257A7A",
      "#237B75",
      "#247C70",
      "#287D6A",
      "#2E7E64",
      "#347E5E",
      "#3B7E58",
      "#437F52",
      "#4B7F4C",
      "#527E47",
      "#5A7E41",
      "#627D3D",
      "#6A7C38",
      "#727B35",
      "#7A7A32",
      "#817830",
      "#897730",
      "#907530",
      "#977332",
      "#9E7134",
      "#A46F38",
      "#AA6C3C",
    ]);

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
    .data(result)
    .enter()
    .append("circle")
    .attr("class", function (d: any) {
      return "dot " + d.stimulus;
    })
    .attr("cx", function (d: any) {
      return x(d.evaluation);
    })
    .attr("cy", function (d: any) {
      return y(d.potency);
    })
    .attr("r", 5)
    .style("fill", function (d: any) {
      return color(d.stimulus) as string;
    })
    .on("mouseover", highlight)
    .on("mouseleave", doNotHighlight);
});
