$ = jQuery;
let demColor = "#87BACF";
let repColor = "#ED5B4E";
let grayColor = "#EEEEEE";
let chosenIssue = "ALLISSUE";

$(document).ready(function(){
  $("#exp-issue").hide();
  $("#rep-opinion").hide();
  $("#dem-opinion").hide();
  let issues = ['Education', 'Economy', 'Taxes', 'Reform', 'Guns', 'Public Safety + Criminal Justice', 
  'Environment', 'Healthcare', 'Taxes + Budget', 'Pensions', 'Abortion / Contraception', 'Wages + Benefits', 
  'Voting', 'Government Operations', 'Diversity / Discrimination', 'Support Services', 'Budget', 
  'Immigration', 'Transparency + Participation', 'Veterans / VA', 'Housing', 'Transportation', 'Local', 
  'Healthcare Reform', 'Agriculture', 'Marriage', 'Social Services', 'Criminal Justice', 'Infrastructure', 
  'Citizen Participation', 'Energy', 'Public Health', 'Court/Prison System', 'Public Transit', 
  'Civil Liberties', 'LGBTQ', 'Technology', 'Seniors'];

      
  addIssues(issues);
  updateGraphText(chosenIssue);

  $("#issue-filter").change(() => {
    chosenIssue = $("#issue-filter option:selected").val();
    updateGraphText(chosenIssue);
  });

});

function addIssues(issues) {
  issues.forEach((issue)=>{
    let b = document.createElement("option");
    b.value = issue.trim();
    b.text = issue;
    b.className = "issue";
    b.addEventListener("click", (e)=>{
      console.log(e.target.value);
      chosenIssue = e.target.value;
      updateGraphText(chosenIssue);
    });
    $("#issue-list").append(b);
  });
}

function updateGraphText(chosenIssue) {

  let states = ["Colorado.csv", "Kentucky.csv", "Illinois.csv"];
  let stateIDs = ["#Colorado", "#Kentucky", "#Illinois"];
  let stateHeights = [150,100,400];
  
  for (let i = 0; i < 3; i++) {
    let state = states[i];
    let stateID = stateIDs[i];
    let stateHeight = stateHeights[i];
    // console.log(stateHeight);
    d3.csv(state,function (csv) {
      let dataset = csv;
      $(stateID).empty();
      console.log(stateID);
      console.log(stateHeight);
      draw_scatter_plot(dataset, chosenIssue, stateID, stateHeight);
    });
  }

}

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
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
  let hasIssue = false;
  issues.forEach((issue)=> {
    if (issue["Issue Tag 1"] === filterIssue) {
      hasIssue = true;
      return hasIssue;
    }
  })
  return hasIssue;
}

function draw_scatter_plot(dataset, filterIssue, stateID, stateHeight) {

  let REPDEM = 250;
  let DEMIND = 500;
  let DIS = 25;

  let rep_x = 0;
  let dem_x = REPDEM + 20; // dividing line value

  let rep_y = 0;
  let dem_y = 0;

  //keeping count
  let repx = 0;
  let demx = REPDEM + 20;

  // Create a container for the graph
  //FIXME: remember to make the svg responsive
  let containerWidth = $(stateID).offsetWidth;
  let margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 1200 - margin.left - margin.right,
      height = stateHeight - margin.top - margin.bottom;
      console.log(height);

  let svg = d3.select("body").select(stateID)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // // add the tooltip area to the webpage
  let tooltip = d3.select("body")
                  .select(stateID)
                  .append("div")
                  .attr("class", "tooltip")
                  .style("position", "absolute")
                  .style("z-index", "10")
                  .style("visibility","hidden");


  let candidates = d3.nest()
    .key((d)=>{return d.candidateID;})
    .entries(dataset);

  svg.selectAll("circle")
      .data(candidates)
      .enter()
      .append("circle")
      .attr("cx", (d) => {
        let candidate_party = d.values[0]["Party"];
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
        let candidate_party = d.values[0]["Party"];
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
        let issues = d.values;
        let candidate_party = d.values[0]["Party"];
        if (filterIssue === "ALLISSUE") {
          return partyColor(candidate_party);
        } else {
          if (hasIssue(issues, filterIssue)) {
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
      let candidate = d.values[0];
      let party = candidate["Party"];
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
      let candidate = d.values[0];
      let issues = d.values;
      let candidateIssues = " ";
      let sourceurl = ""
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
