import React, { Component } from 'react';
import io from "socket.io-client";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import tags from './tags';

am4core.useTheme(am4themes_animated);
const ENDPOINT = "http://localhost:5001";
// const socket = socketIOClient(ENDPOINT, { transports: ['websocket', 'polling', 'flashsocket'] });
const socket = io(ENDPOINT, { transports: ['websocket', 'polling', 'flashsocket'] });

export default class AnalysisChart extends Component {

  constructor(props) {
    super(props)
    this.state = {
      response: [],
      isStart: true,
    }
  }

  componentDidMount() {
    var chart = am4core.create("chartdiv", am4charts.XYChart);
    this.chart = chart
    socket.on("connection", () => {
      console.log("connect to server");
    });
    socket.on('topic', (data) => {
      // message must under the form of [tag:pos:neg:neu]
      if (this.state.isStart) {
        let found;
        data = data.slice(1, -1);
        data = data.split(':');
        data[1] = parseInt(data[1]);
        data[2] = parseInt(data[2]);
        data[3] = parseInt(data[3]);

        if (this.state.response.length > 0) {
          found = false;
          this.state.response.forEach((element) => {
            if (element[0] === 'Joe Biden' && tags.includes(data[0])) {
              found = true;
              element[1] += data[1];
              element[2] += data[2];
              element[3] += data[3];
            } else {
              if (tags.includes(data[0])) {

              }
            }
          })

          if (!found) {
            // this.state.response.push(data)
            this.setState({
              response: [...this.state.response, data]
            })
          }
        } else {
          // this.state.response.push(data)
          this.setState({
            response: [...this.state.response, data]
          })
        }
        let allData = [];

        const data1 = []
        for (var i = 0; i < this.state.response.length; i++) {
          var dataElement = {
            choice: 'Joe Biden',
            numberOfTweets: this.state.response[i][1],
            numberOfTweets2: this.state.response[i][2],
          };
          data1.push(dataElement);
        }

        for (var j = 0; j < data1.length; j++) {
          allData[j] = data1[j];
        }

        //allData = allData.sort((a, b) => b.numberOfTweets - a.numberOfTweets).slice(0, 5);
        console.log(allData);

        chart.data = JSON.parse(
          JSON.stringify(allData)
        );
        // this.setState({
        //   response: [...this.state.response],
        // })
      }
    })
    // Themes end
    chart.padding(10, 10, 10, 10);

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

    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";

    var stepDuration = 0;

    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "choice";
    // categoryAxis.title.text = "Tags";
    categoryAxis.renderer.minGridDistance = 20;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.grid.template.disabled = true;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;

    var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.rangeChangeEasing = am4core.ease.linear;
    valueAxis.rangeChangeDuration = stepDuration;
    valueAxis.extraMax = 0.1;
    valueAxis.title.text = "Number of tweets";

    var series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.categoryY = "choice";
    series.dataFields.valueX = "numberOfTweets";
    series.name = "Trump";
    series.columns.template.strokeOpacity = 0;
    series.interpolationDuration = stepDuration;
    series.interpolationEasing = am4core.ease.linear;
    series.columns.template.column.cornerRadiusBottomRight = 5;
    series.columns.template.column.cornerRadiusTopRight = 5;

    var series2 = chart.series.push(new am4charts.ColumnSeries());
    series2.dataFields.categoryY = "choice";
    series2.dataFields.valueX = "numberOfTweets2";
    series2.name = "Joe Biden";
    series2.columns.template.strokeOpacity = 0;
    series2.interpolationDuration = stepDuration;
    series2.interpolationEasing = am4core.ease.linear;
    series2.columns.template.column.cornerRadiusBottomRight = 5;
    series2.columns.template.column.cornerRadiusTopRight = 5;

    // var series3 = chart.series.push(new am4charts.ColumnSeries());
    // series3.dataFields.categoryY = "choice";
    // series3.dataFields.valueX = "numberOfTweets3";
    // series3.name = "neutral";
    // series3.columns.template.strokeOpacity = 0;
    // series3.interpolationDuration = stepDuration;
    // series3.interpolationEasing = am4core.ease.linear;
    // series3.columns.template.column.cornerRadiusBottomRight = 5;
    // series3.columns.template.column.cornerRadiusTopRight = 5;

    var labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.locationX = 0.5;
    labelBullet.label.text = "{valueX}";
    labelBullet.label.fill = am4core.color("#fff");

    var labelBullet2 = series2.bullets.push(new am4charts.LabelBullet());
    labelBullet2.locationX = 0.5;
    labelBullet2.label.text = "{valueX}";
    labelBullet2.label.fill = am4core.color("#fff");

    // var labelBullet3 = series3.bullets.push(new am4charts.LabelBullet());
    // labelBullet3.locationX = 0.5;
    // labelBullet3.label.text = "{valueX}";
    // labelBullet3.label.fill = am4core.color("#fff");

    chart.zoomOutButton.disabled = true;

    var interval;

    function play() {
    }

    function stop() {
    }

    categoryAxis.sortBySeries = series;
    categoryAxis.sortBySeries = series2;
    // categoryAxis.sortBySeries = series3;
    categoryAxis.zoom({ start: 0, end: 1 / chart.data.length });

    series.events.on("inited", function () {
      setTimeout(function () {
        playButton.isActive = true; // this starts interval
      }, 10);
    });
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  render() {
    return (
      <>
        <div id="chartdiv" style={{ width: "100%", height: "100vh" }}></div>
      </>
    );
  }

}