// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import * as d3 from "d3";
import "./style.scss";

function onlyUnique(value: any, index: any, self: any) {
  return self.indexOf(value) === index;
}

const stimulus = "stimulus";
const evaluation = "Unpleasant-Pleasant";
const potency = "Weak-Strong";
const activity = "Calm-Excitable";
const perceivability = "perceivability";

function makeSafeForCSS(name: string) {
  return name.replace(/[^a-z0-9]/g, function (s) {
    var c = s.charCodeAt(0);
    if (c == 32) return "-";
    if (c >= 65 && c <= 90) return "_" + s.toLowerCase();
    return "__" + ("000" + c.toString(16)).slice(-4);
  });
}

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

type Rating = {
  Cluster: number;
  Frequency: number;
  Pattern: string;
  Repetitions: number;
  Selected: boolean;
  "Unpleasant-Pleasant": number;
  "Calm-Excitable": number;
  "Weak-Strong": number;
};

function ratingName(rating: Rating, safe: boolean = false): string {
  var name = `(${rating.Frequency} Hz, ${rating.Pattern}, ${rating.Repetitions})`;
  if (safe) {
    name = makeSafeForCSS(name);
  }
  return name;
}

function toRating(data: any): Rating {
  return {
    "Unpleasant-Pleasant": parseFloat(data[evaluation]),
    "Calm-Excitable": parseFloat(data[activity]),
    "Weak-Strong": parseFloat(data[potency]),
    Cluster: parseInt(data["Cluster"]),
    Frequency: parseInt(data["Frequency"]),
    Pattern: data["Pattern"],
    Repetitions: parseInt(data["Repetitions"]),
    Selected: data["Selected"] == "True" ? true : false,
  };
}

d3.csv("../data/cluster_data.csv").then(function (_data: any[]) {
  var data: Rating[] = _data.map(toRating);

  // Add X axis
  const x = d3.scaleLinear().domain([0, 6]).range([0, width]);
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear().domain([0, 6]).range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  console.log(data);

  // Color scale: give me a specie name, I return a color
  const _color = d3
    .scaleOrdinal()
    .domain([1, 2, 3, 4, 5].map((i) => i.toString()) as any)
    .range(["#885673", "#477088", "#287D6A", "#627D3D", "#9E7134"]);

  const color = (d: Rating): string => {
    return _color(d.Cluster.toString()) as string;
  };

  // Highlight the specie that is hovered
  const highlight = function (event: any, d: Rating) {
    d3.selectAll(".dot")
      .transition()
      .duration(200)
      .style("fill", "lightgrey")
      .attr("r", 3);

    d3.selectAll(".cluster-" + d.Cluster)
      .transition()
      .duration(200)
      .style("fill", (d: Rating) => color(d))
      .attr("r", 7);
  };

  // Highlight the specie that is hovered
  const doNotHighlight = function (event: any, d: Rating) {
    d3.selectAll(".dot")
      .transition()
      .duration(200)
      .style("fill", (d: Rating) => color(d))
      .attr("r", 5);
  };

  // Add dots
  svg
    .append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", function (d: Rating) {
      return "dot cluster-" + d.Cluster;
    })
    .attr("cx", function (d: Rating) {
      return x(d["Calm-Excitable"]);
    })
    .attr("cy", function (d: Rating) {
      return y(d["Unpleasant-Pleasant"]);
    })
    .attr("r", 5)
    .style("fill", function (d: Rating) {
      return color(d);
    })
    .on("mouseover", highlight)
    .on("mouseleave", doNotHighlight);
});
