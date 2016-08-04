$ = jQuery;
var demColor = "#87BACF";
var repColor = "#ED5B4E";
var grayColor = "#EEEEEE";
var chosenState = "ALLSTATE";
var chosenIssue = "ALLISSUE";

$(document).ready(function(){
  $("#exp-issue").hide();
  $("#rep-opinion").hide();
  $("#dem-opinion").hide();
  var issues = [];

  d3.csv("joined_stances.csv",function (csv) {
      var dataset = csv;
      issues = d3.map(dataset, function(d){return d["Issue Tag 1"];}).keys()
      issues = issues.filter(item => item !== "");
      addIssues(issues);
      createRandomIssues(issues);
      updateGraphText(chosenState, chosenIssue);
  });

  $("#shuffle-issue").click(() => {
    createRandomIssues(issues);
  });

  $("#state-filter").change(() => {
    chosenState = $("#state-filter option:selected").val();
    chosenIssue = $("#issue-filter option:selected").val();
    updateGraphText(chosenState, chosenIssue);
  });

  $("#issue-filter").change(() => {
    chosenIssue = $("#issue-filter option:selected").val();
    chosenState = $("#state-filter option:selected").val();
    updateGraphText(chosenState, chosenIssue);
  });

});

function addIssues(issues) {
  issues.forEach((issue)=>{
    var option = document.createElement("option");
    option.value = issue.trim();
    option.text = issue;
    $("#issue-filter").append(option);
  });
}

function createRandomIssues(issues) {
  $(".issue-list").empty();
  var rand = shuffle(issues).slice(0,6);
  rand.forEach((issue)=> {
    var b = document.createElement("button");
    b.innerHTML = issue;
    b.className = "shuffled";
    b.className = "btn btn-default";
    b.value = issue;
    b.addEventListener("click", (e)=>{
      console.log(e.target.value);
      chosenState = $("#state-filter option:selected").val();
      chosenIssue = e.target.value;
      $("#issue-filter").val(chosenIssue);
      updateGraphText(chosenState, chosenIssue);
    });
    $(".issue-list").append(b);
  });
}

function updateGraphText(chosenState, chosenIssue) {
  $("#repopinion").empty();
  $("#demopinion").empty();
  $("#exp-issue").hide();
  $("#rep-opinion").hide();
  $("#dem-opinion").hide();

  d3.csv("joined_stances.csv",function (csv) {
      var dataset = csv;
      $(".scatter-plot").empty();
      draw_scatter_plot(dataset, chosenState, chosenIssue);
      var candidates = d3.nest()
        .key((d)=>{return d.candidateID;})
        .entries(dataset);
      var repnumissue = 0;
      var demnumissue = 0;
      var repnumstate = 0;
      var demnumstate = 0;
      var reps = [];
      var dems = [];

      if (chosenState == "ALLSTATE" && chosenIssue == "ALLISSUE") {
        console.log("all state all issue");
        repnumstate = 177;
        demnumstate = 193;
        $("#repnumstate").text(repnumstate);
        $("#demnumstate").text(demnumstate);
        $(".chosenState").text("Colorado, Kentucky, and Illinois");
      }
      else if (chosenState == "ALLSTATE" && chosenIssue != "ALLISSUE"){
        console.log("all state not all issue");
        repnumstate = 177;
        demnumstate = 193;
        $("#repnumstate").text(repnumstate);
        $("#demnumstate").text(demnumstate);
        $(".chosenState").text("Colorado, Kentucky, and Illinois");
        candidates.forEach((candidate)=>{
          var candidate_party = candidate.values[0]["Party"];
          var issueList = []
          var uniqueIssue = []
          candidate.values.forEach((issue) => {
            issueList.push(issue["Issue Tag 1"]);
            uniqueIssue = issueList.filter(function(elem, pos) {
              return issueList.indexOf(elem) == pos;});
          });
          if (uniqueIssue.includes(chosenIssue)) {
            if ( candidate_party == "Republican" ) {
              repnumissue += 1;
              reps.push(candidate);
            } else if (candidate_party == "Democrat") {
              demnumissue += 1;
              dems.push(candidate);
            }
          }
        });
        sampleOpinions(reps, "#repopinion");
        sampleOpinions(dems, "#demopinion");
        $(".chosenIssue").text(chosenIssue);
        $("#repnumissue").text(repnumissue);
        $("#demnumissue").text(demnumissue);
        console.log(repnumissue)
        console.log(repnumstate)
        console.log(demnumissue)
        console.log(demnumstate)
        $("#reppercentissue").text(toPercent(repnumissue/repnumstate));
        $("#dempercentissue").text(toPercent(demnumissue/demnumstate));
        $("#exp-issue").show();
        if (reps.length) {
          $("#rep-opinion").show();
        }
        if (dems.length) {
          $("#dem-opinion").show();
        }
      }
      else if (chosenState != "ALLSTATE" && chosenIssue == "ALLISSUE") {
        console.log("not all state all issue");
        candidates.forEach((candidate) => {
          var entry = candidate.values[0];
          if (entry["state"] == chosenState) {
            if (entry["Party"] == "Republican") {
              repnumstate += 1;
            } else {
              demnumstate += 1;
            }
          }
        });
        $("#repnumstate").text(repnumstate);
        $("#demnumstate").text(demnumstate);
        $(".chosenState").text($("#state-filter option:selected").text());
      } else {
        console.log("not all state not all issue");
        console.log(chosenState);
        console.log(chosenIssue);
        candidates.forEach((candidate) => {
          var entry = candidate.values[0];
          if (entry["state"] == chosenState) {
            if (entry["Party"] == "Republican") {
              repnumstate += 1;
            } else {
              demnumstate += 1;
            }
          }
        });
        $("#repnumstate").text(repnumstate);
        $("#demnumstate").text(demnumstate);
        $(".chosenState").text($("#state-filter option:selected").text());
        candidates.forEach((candidate)=>{
          var candidate_party = candidate.values[0]["Party"];
          var candidate_state = candidate.values[0]["state"];
          var issueList = []
          var uniqueIssue = []
          if (candidate_state == chosenState) {
            candidate.values.forEach((issue) => {
              issueList.push(issue["Issue Tag 1"]);
              uniqueIssue = issueList.filter(function(elem, pos) {
                return issueList.indexOf(elem) == pos;});
            });
            if (uniqueIssue.includes(chosenIssue)) {
              if ( candidate_party == "Republican" ) {
                repnumissue += 1;
                reps.push(candidate);
              } else if (candidate_party == "Democrat") {
                demnumissue += 1;
                dems.push(candidate);
              }
            }
          }
        });
        sampleOpinions(reps, "#repopinion");
        sampleOpinions(dems, "#demopinion");
        $("#chosenIssue").text(chosenIssue);
        $("#repnumissue").text(repnumissue);
        $("#demnumissue").text(demnumissue);
        $("#reppercentissue").text(toPercent(repnumissue/repnumstate));   
        $("#dempercentissue").text(toPercent(demnumissue/demnumstate));
        $("#exp-issue").show();
        if (reps.length) {
          $("#rep-opinion").show();
        }
        if (dems.length) {
          $("#dem-opinion").show();
        }
      }
    }); 
  }

function sampleOpinions(reps, replist) {
  if (reps.length) {
    var opinions = []
    reps.forEach((rep)=>{
      rep.values.forEach((stance)=>{
        if (stance["Issue Tag 1"] == chosenIssue) {
          var l = document.createElement("li");
          l.className = "list-group-item";
          l.innerHTML = (stance["First Name"]+ " " + stance["Last Name"]
          + " running for " + stance["Office"] + " in " + stance["state"] + ": " +
           stance["Issue Stance"]);
          opinions.push(l);
        }
      });
    });
    opinions = shuffle(opinions).slice(0,5);
    opinions.forEach((l)=>{
      $(replist).append(l);
    });
  }
}


function toPercent(num){
  return (Math.abs(num)*100).toPrecision(2);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function partyColor(candidate_party) {
  if (candidate_party == "Republican"){
    return repColor;
  }
  else if (candidate_party == "Democrat"){
    return demColor;
  }
}

function hasIssue(issues, filterIssue) {
  var hasIssue = false;
  issues.forEach((issue)=> {
    if (issue["Issue Tag 1"] === filterIssue) {
      hasIssue = true;
      return hasIssue;
    }
  })
  return hasIssue;
}

function draw_scatter_plot(dataset, filterState, filterIssue) {

  var REPDEM = 250;
  var DEMIND = 500;
  var DIS = 25;

  var rep_x = 0;
  var dem_x = REPDEM + 20; // dividing line value
  var ind_x = DEMIND; // divinding line value

  var rep_y = 0;
  var dem_y = 0;
  var ind_y = 0;

  //keeping count
  var repx = 0;
  var demx = REPDEM + 20;
  var indx = 0;

  // Create a container for the graph
  //FIXME: remember to make the svg responsive
  var containerWidth = $(".scatter-plot").offsetWidth;
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 1200 - margin.left - margin.right,
      height = 525 - margin.top - margin.bottom;

  var svg = d3.select("body").select(".scatter-plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // // add the tooltip area to the webpage
  var tooltip = d3.select("body")
                  .select(".scatter-plot")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("position", "absolute")
                  .style("z-index", "10")
                  .style("visibility","hidden");


  var candidates = d3.nest()
    .key((d)=>{return d.candidateID;})
    .entries(dataset);

  svg.selectAll("circle")
      .data(candidates)
      .enter()
      .append("circle")
      .attr("cx", (d) => {
        var candidate_party = d.values[0]["Party"];
        if (candidate_party === "Republican") {
          if (rep_x >= REPDEM) {
            rep_x = 0;
          }
          rep_x += DIS;
          return rep_x;
        }
        else if (candidate_party === "Democrat") {
          if (dem_x >= DEMIND) {
            dem_x = REPDEM + 20;
          }
          dem_x += DIS;
          return dem_x;
        }
      })
      .attr("cy", (d) => {
        var candidate_party = d.values[0]["Party"];
        if (candidate_party === "Republican") {
          if (repx >= REPDEM) {
            rep_y += DIS;
            repx = 0;
          }
          repx += DIS;
          return rep_y;
        }
        else if (candidate_party === "Democrat") {
          if (demx >= DEMIND) {
            dem_y += DIS;
            demx = REPDEM + 20;
          }
          demx += DIS;
          return dem_y;
        }
      })
      .attr("r", 10)
      .attr("id", (d) => {
        return d.key
      })
      .attr("class", "candidate")
      .attr("data-toggle","modal")
      .attr("data-target", "#myModal")
      .style("fill", (d) => {
        var issues = d.values;
        var candidate_party = d.values[0]["Party"];
        var candidate_state = d.values[0]["state"]
        if (filterState === "ALLSTATE" && filterIssue === "ALLISSUE") {
          return partyColor(candidate_party);
        } else if (filterState !== "ALLSTATE" && filterIssue === "ALLISSUE") {
          if (candidate_state !== filterState){
            return grayColor;
          } else {
            return partyColor(candidate_party);
          }
        } else if (filterState === "ALLSTATE" && filterIssue !== "ALLISSUE") {
          if (!hasIssue(issues, filterIssue)) {
            return grayColor;
          } else {
            return partyColor(candidate_party);
          }
        } else {
          if (candidate_state === filterState && hasIssue(issues, filterIssue)) {
            return partyColor(candidate_party);
          } else {
            return grayColor;
          }
        }
    })

    .on("mouseover", function(d) {
      d3.select(this).attr({
        r: 15
      });
      var candidate = d.values[0];
      var party = candidate["Party"];
      tooltip.style("background-color", function() {
        return partyColor(party);
      });
      tooltip.text(candidate["First Name"] + " " + candidate["Last Name"])
           .style("left", (d3.select(this).attr("cx")) + "px")
           .style("top", (d3.select(this).attr("cy")) + "px")
           .style("visibility","visible")
           .transition()
           .duration(200)
           .style("opacity", 0.9);
    })
    .on("mouseout", function(d) {
      d3.select(this).attr({
        r: 10
      });
      tooltip.transition()
           .duration(500)
           .style("opacity", 0);
    })
    .on("click", function(d) {
      console.log(d);
      var candidate = d.values[0];
      var issues = d.values;
      var candidateIssues = " ";
      var sourceurl = ""
      $("#candidateName").text(candidate["First Name"] + " " + candidate["Last Name"]);
      if (hasIssue(issues, filterIssue)) {
        issues.forEach((issue) => {
          if (issue["Issue Tag 1"] == filterIssue) {
            candidateIssues += issue["edited issue stance for site"] + ".  ";
            sourceurl = issue["Source URL"];
          }
        })
        $("#candidateStance").text(candidateIssues);
        $("#candidateSource a").text("source");
        $("#candidateSource a").attr("href", sourceurl);
      }
    });
}
