import React from 'react';
import io from "socket.io-client";
import { useEffect, useState } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import tags1 from './tags1';
import tags2 from './tags2';
import tags3 from './tags3';

am4core.useTheme(am4themes_animated);
const ENDPOINT = "http://localhost:5001";
// const socket = socketIOClient(ENDPOINT, { transports: ['websocket', 'polling', 'flashsocket'] });
const socket = io(ENDPOINT, { transports: ['websocket', 'polling', 'flashsocket'] });

function TagChart() {
  const [response, setResponse] = useState([]);
  const [isStart, setIsStart] = useState(true);

  useEffect(() => {
    let chart = am4core.create("chartdiv", am4charts.XYChart);
    socket.on("connection", () => {
      console.log("connect to server");
    });
    socket.on('topic', data => {
      // message must under the form of [tag:pos:neg:neu]
      if (isStart) {
        let found;
        data = data.slice(1, -1);
        data = data.split(':');
        data[1] = parseInt(data[1]) + parseInt(data[2]) + parseInt(data[3]);
        let temp = [data[0], data[1]];

        if (response.length > 0) {
          found = false;
          response.forEach((element) => {
            // bidden
            if (element[0] === data[0] && tags1.includes(data[0])) {
              found = true;
              element[1] += temp[1];
              element[2] = 'JoeBiden';
            } else if(element[0] === data[0] && tags2.includes(data[0])) { // trump
              found = true;
              element[1] += temp[1];
              element[2] = 'DonaldTrump'
            } else if(element[0] === data[0] && tags3.includes(data[0])) { // neutral
              found = true;
              element[1] += temp[1];
              element[2] = 'Neutral'
            }
          })

          if (!found) {
            if(tags1.includes(data[0])) {
              temp = [data[0], data[1], 'JoeBiden'];
            } else if(tags2.includes(data[0])) {
              temp = [data[0], data[1], 'DonaldTrump'];
            } else if(tags3.includes(data[0])) {
              temp = [data[0], data[1], 'Neutral'];
            }
            response.push(temp);
          }
        } else {
          if(tags1.includes(data[0])) {
            temp = [data[0], data[1], 'JoeBiden'];
          } else if(tags2.includes(data[0])) {
            temp = [data[0], data[1], 'DonaldTrump'];
          } else if(tags3.includes(data[0])) {
            temp = [data[0], data[1], 'Neutral'];
          }
          response.push(temp);
        }

        let allData = [];

        function generateData() {
          const data = [];
          let joe = 0;
          let trump = 0;
          let neutral = 0;
          for (var i = 0; i < response.length; i++) {
            if(response[i][2] === 'JoeBiden') {
              joe += response[i][1];
            } else if(response[i][2] === 'DonaldTrump') {
              trump += response[i][1];
            } else if(response[i][2] === 'Neutral') {
              neutral += response[i][1];
            }

            console.log(joe, trump, neutral)

            var dataElement = [
              { choice: "Joe Biden", numberOfTweets: joe },
              {
                choice: "Donald Trump",
                numberOfTweets: trump,
              },
              {
                choice: "Neutral (Not vote)",
                numberOfTweets: neutral,
              },
            ];

            data.push(dataElement);

          }

          allData = data;
        }

        generateData();

        chart.data = JSON.parse(
          JSON.stringify(allData[allData.length - 1])
        );

        setResponse([...response]);
      }
    })

    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end
    chart.padding(40, 40, 40, 40);

    chart.numberFormatter.bigNumberPrefixes = [
      { number: 1e3, suffix: "K" },
      { number: 1e6, suffix: "M" },
      { number: 1e9, suffix: "B" },
    ];

    var label = chart.plotContainer.createChild(am4core.Label);
    label.x = am4core.percent(97);
    label.y = am4core.percent(95);
    label.horizontalCenter = "right";
    label.verticalCenter = "middle";
    label.dx = -15;
    label.fontSize = 40;

    var playButton = chart.plotContainer.createChild(am4core.PlayButton);
    playButton.x = am4core.percent(97);
    playButton.y = am4core.percent(95);
    playButton.dy = -2;
    playButton.verticalCenter = "middle";
    playButton.events.on("toggled", function (event) {
      if (event.target.isActive) {
        play();
      } else {
        stop();
      }
    });

    var stepDuration = 4000;

    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "choice";
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;

    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.rangeChangeEasing = am4core.ease.linear;
    valueAxis.rangeChangeDuration = stepDuration;
    valueAxis.extraMax = 0.1;

    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = "choice";
    series.dataFields.valueX = "numberOfTweets";
    series.tooltipText = "{valueX.value}";
    series.columns.template.strokeOpacity = 0;
    series.columns.template.column.cornerRadiusBottomRight = 5;
    series.columns.template.column.cornerRadiusTopRight = 5;
    series.interpolationDuration = stepDuration;
    series.interpolationEasing = am4core.ease.linear;

    var labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.horizontalCenter = "right";
    labelBullet.label.text = "{valueX}";
    labelBullet.label.textAlign = "end";
    labelBullet.label.dx = -10;

    chart.zoomOutButton.disabled = true;

    // as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
    series.columns.template.adapter.add("fill", function (fill, target) {
      return chart.colors.getIndex(target.dataItem.index + 80);
    });


    function play() {
      setIsStart(true)
    }

    function stop() {
      setIsStart(false)
    }

    categoryAxis.sortBySeries = series;
    categoryAxis.zoom({ start: 0, end: 1 / chart.data.length });

    series.events.on("inited", function () {
      setTimeout(function () {
        playButton.isActive = true; // this starts interval
      }, 10);
    });
  }, []);


  useEffect(() => {
    
    console.log(response);
  }, [response])

  return (
    <>
      <div id="chartdiv" style={{ width: "100%", height: "400px" }}></div>
    </>
  );
}

export default TagChart;