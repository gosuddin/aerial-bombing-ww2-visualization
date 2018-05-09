/*

COLOR PALETTES:

US : #FF7C16  UK: #5BAFE2   AU: #FFD32E   SA: #53BD24   NZ: #781513
*/
var handle;
var x;
var browserWidth;
var browserHeight;
var margin = {right: 15, left: 15};
var countryColors  = {US : '#FF7C16'  ,GB: '#5BAFE2'   ,AU: '#FFD32E'   ,SA: '#53BD24'   ,NZ: '#781513'}
var operations_data,events_data, colonies_data;


var dateFormatSpecifier = "%Y-%m-%d";  
var dateFormatParser = d3.timeFormat("%Y-%m-%d");

var ops_cs,ops_all,events_ndx,events_all,colonies_ndx,colonies_all;
var dateDim, bombingCounts ,min_date,max_date;

var rChart,everyoneB,usBChart,auBChart,gbBChart,saBChart,nzBChart,bombingWtParty,bombingWtTOP,bombingInd,bombingMap;

var dcCharts = [rChart,everyoneB,bombingWtParty,bombingWtTOP,bombingInd,bombingMap]

var tooltip, infotip;

var splash;

var countryCodes = {'US': 'USA',  'GB':  "GREAT BRITAIN"  ,'AU': 'AUSTRALIA'    ,'SA': 'SOUTH AFRICA'   ,'NZ':'NEW ZEALAND' }
var tOfPCodes = {'CBI':'CBI','EAST AFRICA':'EAFR','ETO':'ETO','MTO':'MTO','PTO':'PTO','UNKNOWN':'UNK'}

var chartInfo = {everyoneB: ['This trendline chart is the master chart. It shows '],
                bombingWtParty: [],
                bombingWtTOP: [],
                bombingInd: [],
                bombingMap: []}

function loadOpsData(){
  d3.csv('data/reduced_OnlyAllies.csv',function(error,data) {
  //console.log('Started with operations');

  //console.log(data)
  data.forEach(function(d){
    d.formatted_m_d = new Date(d.formatted_m_d);
    d.target_latitude = +(d.target_latitude);
    d.target_longitude = +(d.target_longitude);
    d.total_weight_t = +(d.total_weight_t);
    
  })
 
  
  operations_data =data;//
  console.log('Done with ops data');
  loadEventsData();
  })
}

function loadEventsData(){
  d3.csv('data/formatted_events.csv',function(error,data) {
  data.forEach(function(d){
    /*s_date = d.FROM.split('-')
    d.FROM =  new Date(s_date[0], +s_date[1] -1 , s_date[2]);
    s_date = d.TO.split('-')
    d.TO = new Date(s_date[0], +s_date[1] -1 , s_date[2]);*/
    d.FROM = dateFormatParser (new Date(d.FROM));
    d.TO = dateFormatParser( new Date(d.TO));
    
  })
  events_data = data;
  console.log('Done with events data');
  loadColoniesData();
  })
}

function loadColoniesData(){
  d3.csv('data/reduced_party_colonies.csv',function(error,data) {
  data.forEach(function(d){
    d.year = new Date(d.year,0,1);
  })
  colonies_data = data;
  console.log('Done with colonies data');
  createDimsAndFacts();
  })
}

function cleanColonies(data){
  data.forEach(function(d){
    d.year = new Date(d.year,0,1);
  })
  return data;
}

function cleanOps(data){
  data.forEach(function(d){
    d.formatted_m_d = new Date(d.formatted_m_d);
    d.target_latitude = +(d.target_latitude);
    d.target_longitude = +(d.target_longitude);
    d.total_weight_t = +(d.total_weight_t);
    
  })
  return data;
}

function cleanEvents(data){
  data.forEach(function(d){
    d.FROM = new Date(d.FROM,0,1);
    d.TO = new Date(d.TO,0,1);
  })
  return data;
}



function reduceAddMission(p, v) {
     ++p.count;
    p.us += v.country == "US" ? 1 : 0;
    p.gb += v.country == "GB" ? 1 : 0;
    p.sa += v.country == "SA" ? 1 : 0;
    p.nz += v.country == "NZ" ? 1 : 0;
    p.au += v.country == "AU" ? 1 : 0;

    return p;
}

function reduceRemoveMission(p, v) {
    --p.count;
    p.us -= v.country == "US" ? 1 : 0;
    p.gb -= v.country == "GB" ? 1 : 0;
    p.sa -= v.country == "SA" ? 1 : 0;
    p.nz -= v.country == "NZ" ? 1 : 0;
    p.au -= v.country == "AU" ? 1 : 0;
    return p;
}

function reduceInitialMission() {
  return {count: 0, us:0,gb:0,sa:0,nz:0,au:0}
}

function getCColors(data){
  if (data == 'US'){
    return countryColors.US;
  }
  else if(data =='AU' ){
    return countryColors.AU;
  }
  else if(data =='GB' ){
    return countryColors.GB;
  }
  else if(data =='NZ' ){
    return countryColors.NZ;
  }
  else if (data == 'SA,'){
    return countryColors.SA;
  }
}


function createDimsAndFacts(){
  console.log('Creating dims and facts ...')

  // Dimensions and facts for operations data
  ops_cs = crossfilter(operations_data);
  events_cs = crossfilter(events_data);
  ops_all = ops_cs.groupAll();
  events_all = events_cs.groupAll();


  dateDim = ops_cs.dimension (function(d){return d.formatted_m_d;})
  warCountryDim = ops_cs.dimension (function(d){return d.country;})
  tOfOpDim = ops_cs.dimension (function(d){return d.theater_of_operations;})
  tgtIndDim = ops_cs.dimension (function(d){return d.target_industry;})
  tgtDim = ops_cs.dimension(function(d){ return [d.target_industry,d.target_type];})
  bombCord = ops_cs.dimension (function(d){ return d.target_latitude+','+d.target_longitude})

  bombingCounts = dateDim.group().reduce(reduceAddMission,reduceRemoveMission,reduceInitialMission)
  warCountryDimGrp = warCountryDim.group().reduceCount() //.reduceSum(function(d){return +d.total_weight_t;})
  tOfOpDimGrp = tOfOpDim.group().reduceCount()//.reduceSum(function(d){return +d.total_weight_t;})
  bombCordGrp = bombCord.group()//.reduce(reduceAddMission,reduceRemoveMission,reduceInitialMission);
  bombCordCGrp = bombCord.group().reduce(reduceAddMission,reduceRemoveMission,reduceInitialMission);
  tgtIndDimGrp = tgtIndDim.group().reduceCount()
  tgtDimGrp = tgtDim.group().reduceCount()
  /*alBWt = dateDim.group().reduceSum(function(d){ if (d.country == 'allies') {return d.total_weight_t}else{ return 0;}})
  axBWt = dateDim.group().reduceSum(function(d){ if (d.country == 'axis') {return d.total_weight_t}else{ return 0;}})
  neBWt = dateDim.group().reduceSum(function(d){ if (d.country == 'neutralBChart') {return d.total_weight_t}else{ return 0;}})*/
  eventsDateDim = events_cs.dimension(function(d){return [d.FROM,d.TO] } )
  events_grp = function(d){return "events";}
  eventsgroupedDimension = eventsDateDim.group().reduce(
          function (p, v) {
              ++p.number;
              p.event = v.EVENT;
              p.link = '<a href =' + v.LINK + '>' + v.EVENT + '</a>';
              return p;
          },
          function (p, v) {
              --p.number;
              p.event = v.EVENT;
              p.link = '<a href =' + v.LINK + '>' + v.EVENT + '</a>';
              return p;
          },
          function () {
              return {number: 0, event: 0, link: 0}
      })
  min_date = dateDim.bottom(1)[0].formatted_m_d;

  max_date = dateDim.top(1)[0].formatted_m_d;

  

  // Dimensions and facts for events data


  // Dimensions and facts for colonies data

  plotViz();
  
}

function plotViz(){
  splash.style('visibility', 'hidden');
  console.log('Plotting viz.. ');

  dc.config.defaultColors(d3.schemeCategory20);

  /*Everyone bombing*/
  rChart = dc.barChart('#rangeC')
        .width(950)
        .height(75)
        .dimension(dateDim)
        .group(bombingCounts)
        .valueAccessor(function(d){ return d.value.count;})
        .centerBar(true)
        .elasticX(true)
        .elasticY(true)
        .gap(1)
        .x(d3.scaleTime().domain([min_date, max_date]))
        .xAxisLabel('Timeline')
        .yAxisLabel('    ')
        .alwaysUseRounding(true)
        .yAxisPadding(50)
        .xAxisPadding(50);
  
  rChart.yAxis().ticks(0);

  everyoneB = dc.compositeChart('#trendline_chart');

  usBChart = dc.lineChart(everyoneB);
  auBChart = dc.lineChart(everyoneB);
  gbBChart = dc.lineChart(everyoneB);
  saBChart = dc.lineChart(everyoneB);
  nzBChart = dc.lineChart(everyoneB);

  usBChart
        .group(bombingCounts, "Mission Counts by USA (US)")
        .keyAccessor(function(d){ return d.key})
        .valueAccessor(function (p) { return p.value.us; })
        .x(d3.scaleTime().domain([min_date,max_date]))
        .colors(countryColors.US)
        .legend(dc.legend().x(100).y(10).itemHeight(13).gap(5));
  auBChart
        .group(bombingCounts, "Mission Counts by Australia (AU)")
        .keyAccessor(function(d){ return d.key})
        .valueAccessor(function (p) { return p.value.au; })
        .x(d3.scaleTime().domain([min_date,max_date]))
        .colors(countryColors.AU)
        .legend(dc.legend().x(100).y(10).itemHeight(13).gap(5));
  gbBChart
        .group(bombingCounts, "Mission Counts by Great Britian (GB)")
        .keyAccessor(function(d){ return d.key})
        .valueAccessor(function (p) { return p.value.gb; })
        .x(d3.scaleTime().domain([min_date,max_date]))
        .colors(countryColors.GB)
        .legend(dc.legend().x(100).y(10).itemHeight(13).gap(5));
  saBChart
        .group(bombingCounts, "Mission Counts by South Africa (SA)")
        .keyAccessor(function(d){ return d.key})
        .valueAccessor(function (p) { return p.value.sa; })
        .x(d3.scaleTime().domain([min_date,max_date]))
        .colors(countryColors.SA)
        .legend(dc.legend().x(100).y(10).itemHeight(13).gap(5));

  nzBChart
        .group(bombingCounts, "Mission Counts by New Zealand (NZ)")
        .keyAccessor(function(d){ return d.key})
        .valueAccessor(function (p) { return p.value.nz; })
        .x(d3.scaleTime().domain([min_date,max_date]))
        .colors(countryColors.NZ)
        .legend(dc.legend().x(100).y(10).itemHeight(13).gap(5));
        
  
  everyoneB.width(950).height(375)
        .x(d3.scaleTime().domain([min_date,max_date]))
        .dimension(dateDim)
        .rangeChart(rChart)
        .legend(dc.legend().x(70).y(10).itemHeight(13).gap(5))
        .compose([usBChart,auBChart,gbBChart,saBChart,nzBChart])
        .keyAccessor(function(d){ return d.key})
        .renderTitle(false)
        .brushOn(false)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        
        .yAxisLabel('Mission Counts')
        .yAxisPadding(150)
        .xAxisPadding(50);
        
        
  everyoneB.xAxis().ticks(10);
        //.legend(dc.legend().x(100).y(10).itemHeight(13).gap(5))      ;
        
      
    //bombingMap =  dc.geoChoroplethChart('#us-chart');

    //bombingMap.width(1200).height(500)
    bombingWtParty = dc.barChart('#bomb_wt');
        
        bombingWtParty.width(250).height(275)
        .dimension(warCountryDim).group(warCountryDimGrp,'Mission Counts')
        .x(d3.scaleBand())
          .xUnits(dc.units.ordinal)
        .valueAccessor(function(d) {
            return d.value;
        })
        .margins({left:50,right:0,top:30,bottom:30})
        .keyAccessor(function(d) {
            return d.key;
        })
        .title(function(d) {
            return d.key + ": " + Math.round(d.value);
        })
        /*.xAxisLabel('Countries')*/
        .renderTitle(false)
        .colors('steelblue')
        .yAxis().ticks(5).tickFormat(d3.format('.3s'))
        
        //.ordinalColors(['#780CE8', '#3753AB', '#AAE1FC', '#0E332A'])
        /*.elasticX(true)*/

        /*.xAxis().ticks()*/
        

    bombingWtTOP = dc.barChart('#top_wt');
        
        bombingWtTOP.width(250).height(275)
        .dimension(tOfOpDim).group(tOfOpDimGrp,'Mission Counts by Theatre of Operations')
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .margins({left:50,right:0,top:30,bottom:30})    
        .keyAccessor(function(d){
          return d.key;
        })
        .valueAccessor(function(d) {
            return d.value;
        })
        .label(function(d) {
            return d.key;
        })
        .title(function(d) {
            return d.key + ": " + Math.round(d.value);
        })
        .colors('steelblue')
        .renderTitle(false)
        /*.xAxisLabel('Theatre of Operations')*/
        
        /*.elasticX(true)*/
        .yAxis().ticks(6).tickFormat(d3.format('.3s'))



    bombingInd = dc.rowChart('#top_ind')
      bombingInd
        .width(250).height(275)
        .margins({left:10,right:20,top:30,bottom:30})
        .dimension(tgtIndDim).group(tgtIndDimGrp)
        .keyAccessor(function(d){return d.key;})
        .renderTitle(false)
        .cap(6)
        .colors('steelblue')
        .ordering(function (d) { return -d.value;} )
        .xAxis().ticks(6).tickFormat(d3.format('.3s'))

        /*.ordinalColors(['#0E332A', '#AAE1FC', '#469DAB', '#780CE8', '#3753AB', '#AAE1FC', '#0E332A'])*/
        /*.xAxis().ticks(5)*/

    /*bombingInd = dc.rowChart('#top_ind');
        
        bombingInd.width(400).height(275)
        .dimension(tgtIndDim).group(tgtIndDimGrp)
        .x(d3.scaleBand())
        .xUnits(dc.units.ordinal)
        .valueAccessor(function(d) {
            return d.value;
        })
        .label(function(d) {
            return d.key;
        })
        .title(function(d) {
            return d.key + ": " + Math.round(d.value);
        })
        .ordinalColors(['#780CE8', '#3753AB', '#AAE1FC', '#0E332A'])
        
        .xAxis().ticks(5)*/

    //map_attempt = dc.geoChoroplethChart('#map_attempt_chart');    
    
    bombingMap = dc_leaflet.bubbleChart("#map_attempt_chart")
          .width(930)
          .height(400)
          .dimension(bombCord)
          .group(bombCordCGrp)
          .valueAccessor(function(d){return d.value.count;})
          .center([48.68, 4.9],4)
          .zoom(7)
          


    /*events_chart = dc.dataTable('#events_chart')
            .width(275)
            .height(480)
            .dimension(eventsgroupedDimension)
            .group(events_grp)
            .columns([function (d) { return d.key[0]; },
                      function (d) { return d.key[1]; },
                      function (d) { return d.value.link;}
                      ])
            .order(function (d) { return d.key[0];} )
    */
    




    tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");


    infotip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden");




    dc.renderAll();


    tooltip.attr('class', 'tip')
    infotip.attr('class', 'info')
    
    d3.selectAll("#bomb_wt .bar").on("mouseover", function(d) {
            return (tooltip.style("visibility", "visible").html("Country: " + countryCodes[d.data.key] + "<br>" + " No. of missions: " + d.data.value));
        })
        .on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });

    d3.selectAll("#top_wt .bar").on("mouseover", function(d) {
            return (tooltip.style("visibility", "visible").html("Theatre of Operations: " + tOfPCodes[d.data.key] + "<br>" + " No. of missions: " + d.data.value));
        })
        .on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });

    d3.selectAll("#top_ind svg rect").on("mouseover", function(d) {
            return (tooltip.style("visibility", "visible").html("Targeted Industry: " + d.key + "<br>" + " No. of missions: " + d.value));
        })
        .on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });
    d3.selectAll("#trendline_chart circle").on("mouseover", function(d) {
            return (tooltip.style("visibility", "visible").html("Country: " + dateFormatParser(d.data.key) + "<br>" + " No. of missions: <br> US: " + d.data.value.us + '<br>AU: ' + d.data.value.au + '<br>GB: ' + d.data.value.gb + '<br>SA :' + d.data.value.sa + '<br>NZ: ' + d.data.value.nz));
        })
        .on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            return tooltip.style("visibility", "hidden");
        });

    

          
          //.legend(dc_leaflet.legend().position('bottomright'));
    /*var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
    var map = L.map('map',{
    center: [48.68, 4.9],
    zoom: 7,
    layers: [osm]}
    });*/
    /*var map = L.map('map', {
    center: [48.68, 4.9],
    zoom: 7,
    layers: [osm, geojson]});
    dc_leaflet.leafletBase('#map_attempt_chart')
          .mapOptions({..})
          .center([48.68,4.9])      
          .zoom(7)                
          .map()                  
          .brushOn(true)     
         */
    
  
}
// document.addEventListener('DOMContentLoaded', function() {
    
//     browserWidth = document.documentElement.clientWidth
//     browserHeight = document.documentElement.clientHeight
//     console.log(browserHeight)
//     console.log(browserWidth)
//     append_visuals();
// }, false);
document.addEventListener('DOMContentLoaded', function() {
  startViz();
},false)

function startViz() {
    clientWidth = document.body.clientWidth;
    clientHeight = document.body.clientHeight;
    // largeWidth = (clientWidth / 14) * 12
    // mediumWidth = (clientWidth / 14) * 6
    // smallWidth = (clientWidth / 14) * 4
    // allHeight = clientHeight / 2
    splash = d3.select('#splash');
    splash.style('visibility', 'visible');
    console.log('should show');
    loadOpsData();   

    
}




