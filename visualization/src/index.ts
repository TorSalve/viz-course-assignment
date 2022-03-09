// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.
import * as d3 from "d3";
import "./style.scss";
import "bootstrap";
import * as $ from "jquery";

const evaluation = "Unpleasant-Pleasant";
const potency = "Weak-Strong";
const activity = "Calm-Excitable";

const cluster_colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];
const cluster_data_path = "./data/cluster_data.csv";

type Margin = { top: number; right: number; bottom: number; left: number };

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

const _color = d3
  .scaleOrdinal()
  .domain([1, 2, 3, 4, 5].map((i) => i.toString()) as any)
  .range(cluster_colors);

const color = (d: Rating): string => {
  return _color(d.Cluster.toString()) as string;
};

// Highlight the specie that is hovered
var highlight = function (e: any, d: Rating) {
  $("#flash-card").fadeIn();
  $(`#flash-card #pattern-img img`).hide(0);
  $(`#flash-card #pattern-img #${d.Pattern}`).show(0);

  $(`#flash-card #frequency`).text(d.Frequency);
  $(`#flash-card #pattern`).text(d.Pattern);
  $(`#flash-card #repetitions`).text(d.Repetitions);

  $(`#flash-card #evaluation`).text(d["Unpleasant-Pleasant"].toFixed(2));
  $(`#flash-card #potency`).text(d["Weak-Strong"].toFixed(2));
  $(`#flash-card #activity`).text(d["Calm-Excitable"].toFixed(2));

  $(`#flash-card #cluster`).text(d.Cluster);
  $(`#flash-card #cluster-color`).css("color", color(d));

  // var cluster = d.target
  // first every group turns grey
  d3.selectAll(".line, .dot")
    .transition()
    .duration(200)
    .style("stroke", "lightgrey")
    .style("opacity", "0.2");
  // Second the hovered specie takes its color
  d3.selectAll(".cluster-" + d.Cluster)
    .transition()
    .duration(200)
    .style("stroke", color(d))
    .style("opacity", "1");
};

// Unhighlight
var doNotHighlight = function (e: any, d: Rating) {
  // d3.selectAll(".line, .dot")
  //   .transition()
  //   .duration(200)
  //   .delay(1000)
  //   .style("stroke", (d: Rating) => color(d))
  //   .style("opacity", "1");
};

// https://www.d3-graph-gallery.com/graph/correlogram_histo.html
function correlogram_scatter_hist(dimensions: string[]) {
  // Dimension of the whole chart. Only one size since it has to be square
  var marginWhole = { top: 50, right: 50, bottom: 50, left: 50 },
    sizeWhole = 640 - marginWhole.left - marginWhole.right;

  //

  var height = sizeWhole + marginWhole.top + marginWhole.bottom;
  var width = sizeWhole + marginWhole.left + marginWhole.right;
  // Create the svg area
  var svg = d3
    .select("#correlogram-scatter-hist")
    .append("svg")
    .attr("width", sizeWhole + marginWhole.left + marginWhole.right)
    .attr("height", sizeWhole + marginWhole.top + marginWhole.bottom)
    .append("g")
    .attr(
      "transform",
      "translate(" + marginWhole.left + "," + marginWhole.top + ")"
    );

  d3.csv(cluster_data_path).then(function (_data) {
    var data: Rating[] = _data.map(toRating);
    // What are the numeric variables in this dataset? How many do I have

    var numVar = dimensions.length;

    // Now I can compute the size of a single chart
    var mar = 20;
    var size = sizeWhole / numVar;

    // ----------------- //
    // Scales
    // ----------------- //

    // Create a scale: gives the position of each pair each variable
    var position = d3
      .scalePoint()
      .domain(dimensions)
      .range([0, sizeWhole - size]);

    // Color scale: give me a specie name, I return a color
    const _color = d3
      .scaleOrdinal()
      .domain([1, 2, 3, 4, 5].map((i) => i.toString()) as any)
      .range(cluster_colors);

    const color = (d: Rating): string => {
      return _color(d.Cluster.toString()) as string;
    };

    // ------------------------------- //
    // Add charts
    // ------------------------------- //
    for (var i in dimensions) {
      for (var j in dimensions) {
        // Get current variable name
        var var1 = dimensions[i];
        var var2 = dimensions[j];

        // Add a 'g' at the right position
        var tmp = svg
          .append("g")
          .attr(
            "transform",
            "translate(" +
              (position(var1) + mar) +
              "," +
              (position(var2) + mar) +
              ")"
          );

        // If var1 == var2 i'm on the diagonal, I skip that
        if (var1 === var2) {
          tmp
            .append("text")
            .attr("class", "x label")
            .attr("text-anchor", "start")
            .attr("x", 0)
            .attr("y", [540, 360, 180][i])
            .text(var1);

          tmp
            .append("text")
            .attr("class", "y label")
            .attr("text-anchor", "start")
            .attr("transform", "rotate(-90)")
            // .attr("x", [180, 360, 540][i])
            .attr("x", -marginWhole.top * 2 - 25)
            .attr("y", [0, 180, 360][i] * -1 - marginWhole.left / 2)
            .text(var1);
          continue;
        }

        // Add X Scale of each graph
        var x = d3
          .scaleLinear()
          .domain([0, 6])
          .nice()
          .range([0, size - 2 * mar]);

        // Add Y Scale of each graph
        var y = d3
          .scaleLinear()
          .domain([0, 6])
          .nice()
          .range([size - 2 * mar, 0]);

        // Add X and Y axis in tmp
        tmp
          .append("g")
          .attr("transform", "translate(" + 0 + "," + (size - mar * 2) + ")")
          .call(d3.axisBottom(x).ticks(3));
        tmp.append("g").call(d3.axisLeft(y).ticks(3));

        // Add circle
        tmp
          .selectAll("myCircles")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", function (d: any) {
            return x(+d[var1]);
          })
          .attr("cy", function (d: any) {
            return y(+d[var2]);
          })
          .attr("r", 3)
          .attr("fill", function (d: Rating) {
            return color(d) as string;
          })
          .attr("class", function (d) {
            return "dot cluster-" + d.Cluster;
          })
          .on("mouseover", highlight)
          .on("mouseleave", doNotHighlight);
      }
    }

    // ------------------------------- //
    // Add histograms = diagonal
    // ------------------------------- //
    for (i in dimensions) {
      for (j in dimensions) {
        // variable names
        var var1 = dimensions[i];
        var var2 = dimensions[j];

        // If var1 == var2 i'm on the diagonal, otherwisee I skip
        if (i != j) {
          continue;
        }

        // create X Scale
        var x = d3
          .scaleLinear()
          .domain([0, 6])
          .nice()
          .range([0, size - 2 * mar]);

        // Add a 'g' at the right position
        var tmp = svg
          .append("g")
          .attr(
            "transform",
            "translate(" +
              (position(var1) + mar) +
              "," +
              (position(var2) + mar) +
              ")"
          );

        // Add x axis
        tmp
          .append("g")
          .attr("transform", "translate(" + 0 + "," + (size - mar * 2) + ")")
          .call(d3.axisBottom(x).ticks(3));

        // set the parameters for the histogram
        var histogram = d3
          .bin()
          .value(function (d: any) {
            return +d[var1];
          }) // I need to give the vector of value
          .domain(x.domain() as any) // then the domain of the graphic
          .thresholds(x.ticks(15)); // then the numbers of bins

        // And apply this function to data to get the bins
        var bins = histogram(data as any);

        // Y axis: scale and draw:
        var y = d3
          .scaleLinear()
          .range([size - 2 * mar, 0])
          .domain([
            0,
            d3.max(bins, function (d) {
              return d.length;
            }),
          ]); // d3.hist has to be called before the Y axis obviously

        // append the bar rectangles to the svg element
        tmp
          .append("g")
          .selectAll("rect")
          .data(bins)
          .enter()
          .append("rect")
          .attr("x", 1)
          .attr("transform", function (d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")";
          })
          .attr("width", function (d) {
            return x(d.x1) - x(d.x0);
          })
          .attr("height", function (d) {
            return size - 2 * mar - y(d.length);
          })
          .style("fill", "#b8b8b8")
          .attr("stroke", "white");
      }
    }
  });
}

// https://www.d3-graph-gallery.com/graph/parallel_custom.html
function parallel_plot(dimensions: string[]) {
  // set the dimensions and margins of the graph
  var margin: Margin = { top: 50, right: 50, bottom: 50, left: 50 };
  var width = 640 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;
  // append the svg object to the body of the page
  var svg = d3
    .select("#parallel-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv(cluster_data_path).then(function (_data: any[]) {
    var data: Rating[] = _data.map(toRating);

    // Color scale: give me a specie name, I return a color

    // For each dimension, I build a linear scale. I store all in a y object
    var y: any = {};
    for (var i in dimensions) {
      var name = dimensions[i];
      y[name] = d3
        .scaleLinear()
        .domain([0, 6]) // --> Same axis range for each group
        // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
        .range([height, 0]);
    }

    // Build the X scale -> it find the best position for each Y axis
    var x = d3.scalePoint().range([0, width]).domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d: Rating) {
      return d3.line()(
        dimensions.map(function (p) {
          return [x(p), y[p]((d as any)[p])];
        })
      );
    }

    // Draw the lines
    svg
      .selectAll("myPath")
      .data(data)
      .enter()
      .append("path")
      .attr("class", function (d) {
        return "line cluster-" + d.Cluster;
      }) // 2 class for each line: 'line' and the group name
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", function (d) {
        return color(d);
      })
      .style("opacity", 0.5)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight);

    // Draw the axis:
    svg
      .selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions)
      .enter()
      .append("g")
      .attr("class", "axis")
      // I translate this element to its right position on the x axis
      .attr("transform", function (d) {
        return "translate(" + x(d) + ")";
      })
      // And I build the axis with the call function
      .each(function (d) {
        d3.select(this).call(d3.axisLeft(y[d]).ticks(5));
      })
      // Add axis title
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function (d) {
        return d;
      })
      .style("fill", "black");
  });
}

$(() => {
  $("#flash-card").hide();
  var dimensions = [evaluation, activity, potency];
  parallel_plot(dimensions);

  correlogram_scatter_hist(dimensions);
});

// dimensions = [activity, evaluation, potency];
// // set the dimensions and margins of the graph
// var margin2: Margin = {
//   top: 30,
//   right: margin.right + 50,
//   bottom: 10,
//   left: margin.left + 50,
// };
// var width2 = width + margin2.left + margin2.right;
// var height2 = height + margin2.top + margin2.bottom;
// parallel_plot(dimensions, margin2, width2, height2);

// dimensions = [potency, activity, evaluation];
// // set the dimensions and margins of the graph
// var margin3: Margin = {
//   top: 30,
//   right: margin2.right + 50,
//   bottom: 10,
//   left: margin2.left + 50,
// };
// var width3 = width2 + margin3.left + margin3.right;
// var height3 = height2 + margin3.top + margin3.bottom;
// parallel_plot(dimensions, margin3, width3, height3);
